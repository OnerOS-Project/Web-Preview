# OnerOS Web Preview - Migration to v3.0

## Phase 1: Window Foundation Extraction (COMPLETED)

### Window Extraction Details

The Window component has been extracted from `src/OS/Window/buildWindow.tsx` into the v3.0 architecture at `src/core/windowManager/Window/`.

### Files Created

| File | Purpose |
|---|---|
| `src/core/windowManager/Window/Window.tsx` | Main Window component (full implementation) |
| `src/core/windowManager/Window/WindowHeader.tsx` | Window title bar with controls |
| `src/core/windowManager/Window/WindowContent.tsx` | Window content renderer (iframe/embed/component) |
| `src/core/windowManager/Window/window.types.ts` | Expanded TypeScript interfaces |
| `src/core/windowManager/Window/window.constants.ts` | Window constants and CSS class names |
| `src/core/windowManager/Window/index.ts` | Barrel exports |

### Files Modified

| File | Change |
|---|---|
| `src/OS/Window/buildWindow.tsx` | Replaced with compatibility bridge re-export |
| `src/core/windowManager/index.ts` | Updated to export from Window/ |
| `src/core/windows/index.ts` | Fixed broken import paths |
| `src/core/desktop/desktop.types.ts` | Added missing React import |
| `src/core/state/state.types.ts` | Added missing React import |
| `src/core/windowManager/window.types.ts` | Added missing React import |
| `tsconfig.json` | Created (required for CRA TypeScript support) |
| `package.json` | Added typescript dependency |

### Compatibility Bridge

`src/OS/Window/buildWindow.tsx` now re-exports from the new location:
```typescript
export { default } from '../../core/windowManager/Window/Window';
```

All existing imports (`import Window from "../Window/buildWindow.tsx"`) continue to work.

### Extended Types

New optional fields added to `WindowData` (backwards-compatible):
- `appId?: string` - Application identifier
- `icon?: string` - Window icon
- `minSize?: WindowSize` - Minimum window dimensions
- `isFocused?: boolean` - Focus state
- `isMinimized?: boolean` - Minimized state
- `isOpen?: boolean` - Open state

### Remaining Legacy Window Code

| File | Status |
|---|---|
| `src/OS/Window/buildWindow.tsx` | Compatibility bridge (re-export only) |
| `src/OS/Tools/taskbar.js` | Still manages window state (windows array, open/close) |

### Recommended Phase 2

**Taskbar Decomposition** - Extract window state management from taskbar.js into a proper WindowManager:
- Move `windows` state and `handleAppClick`/`removeWindow` logic
- Create `src/core/windowManager/WindowManager.tsx` as state container
- Keep taskbar.js as a UI component that delegates to WindowManager

---

## Phase 2: Window Manager + Central Window State (COMPLETED)

### Window State Ownership

**Before (v2.2):**
- `src/OS/Tools/taskbar.js` owned `windows` state via `useState([])`
- `handleAppClick(appName)` created window data and added to state
- `removeWindow(id)` filtered window from state
- App imports were at top of taskbar.js (tight coupling)

**After (v3.0):**
- `src/core/windowManager/WindowManager.tsx` owns `windows` state
- `openWindow(appName)` creates window data via app registry and adds to state
- `closeWindow(id)` filters window from state
- `focusWindow(id)` and `updateWindow(id, updates)` prepared for future use
- Taskbar receives state and actions as props (UI-only)

### Files Created

| File | Purpose |
|---|---|
| `src/core/windowManager/WindowManager.tsx` | Central window state owner, renders windows, provides actions |
| `src/core/windowManager/windowManager.types.ts` | TypeScript interfaces for WindowManager |
| `src/core/windowManager/windowManager.utils.ts` | App registry and window data creation |

### Files Modified

| File | Change |
|---|---|
| `src/app.js` | Wraps Taskbar with WindowManager, passes state/actions as props |
| `src/OS/Tools/taskbar.js` | Receives props, removed window state ownership, uses `openWindow` instead of `handleAppClick` |
| `src/core/windowManager/index.ts` | Exports WindowManager and utilities |

### Logic Removed from taskbar.js

| Logic | New Owner |
|---|---|
| `const [windows, setWindows] = useState([])` | `WindowManager.tsx` |
| `handleAppClick(appName)` function | `WindowManager.tsx` → `openWindow(appName)` |
| `removeWindow(id)` function | `WindowManager.tsx` → `closeWindow(id)` |
| App component imports (Personalization, LinuxMode, etc.) | `windowManager.utils.ts` (app registry) |
| `uuidv4()` import | `windowManager.utils.ts` (uses `crypto.randomUUID()`) |
| `os:app_run` event listener | `WindowManager.tsx` |

### New WindowManager API

```typescript
interface WindowManagerActions {
  openWindow: (appName: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;      // Prepared for future
  updateWindow: (id: string, updates: Partial<WindowData>) => void;  // Prepared for future
}
```

### App Registry

`windowManager.utils.ts` contains a centralized app registry:
```typescript
const APP_REGISTRY: Record<string, AppConfig> = {
  settings: { title: 'Settings', size: {...}, src: '...' },
  personalization: { title: 'Personalization', size: {...}, component: Personalization },
  // ... more apps
};
```

This replaces the switch statement that was previously in taskbar.js.

### Integration Pattern

```
App
  └── WindowManager (owns windows state)
        ├── <div id="window-frame"> (renders Window components)
        └── Taskbar (receives props: windows, openWindow, closeWindow, ...)
```

WindowManager uses a render props pattern to pass state and actions to Taskbar.

### Compatibility Bridges

- `src/OS/Window/buildWindow.tsx` continues to re-export from v3.0
- Taskbar props are optional (backwards-compatible if someone uses Taskbar without WindowManager)
- All existing event listeners (`os:reload`, `os:reload_complete`) preserved

### Remaining Legacy Window Logic

| File | Status |
|---|---|
| `src/OS/Window/buildWindow.tsx` | Compatibility bridge (re-export only) |
| `src/OS/Tools/taskbar/appSwitcher.tsx` | Reads windows from DOM (MutationObserver), not state |
| `src/core/windowManager/Window/Window.tsx` | Handles focus via DOM classes, not centralized state |

### Known Limitations

1. `focusWindow()` does not yet affect z-index (prepared for future)
2. `updateWindow()` is available but not yet used by any component
3. AppSwitcher reads windows from DOM, not from WindowManager state
4. Window position/size not yet tracked in central state (managed by interactjs)

### Recommended Phase 3

**Application Registry + App Manifest Foundation:**
- Create central app registry in `src/core/apps/`
- Define AppManifest interface for application metadata
- Move app component imports out of WindowManager utils
- Prepare for lazy loading and single-instance apps

---

## Phase 3: Application Registry + App Manifest Foundation (COMPLETED)

### Previous Application Architecture

**Before (v2.2 → Phase 2):**
- `src/core/windowManager/windowManager.utils.ts` contained app imports and registry
- WindowManager directly imported all application components
- App metadata was mixed with window creation logic
- No separation between "what apps exist" and "how windows work"

**After (v3.0):**
- `src/core/apps/` contains the central Application Registry
- `AppManifest` interface defines application metadata
- WindowManager uses registry via `getApp(appId)` instead of direct imports
- Clear separation: App Registry knows what apps exist, WindowManager knows which windows are running

### AppManifest Interface

```typescript
interface AppManifest {
  id: string;                    // Stable identifier (e.g., 'linux-mode')
  name: string;                  // Display name (e.g., 'Linux Mode Terminal')
  description?: string;          // Short description
  icon?: string;                 // Icon identifier (future)
  component?: React.ComponentType<any>;  // React component
  category?: 'system' | 'internet' | 'media' | 'tools' | 'utilities';
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  singleInstance?: boolean;      // Prevent multiple windows (future)
  isSystemApp?: boolean;         // System vs user app
  type?: 'iframe' | 'embed' | 'internal-component';
  src?: string;                  // URL for iframe/embed apps
  version?: string;              // App version (future)
}
```

### Files Created

| File | Purpose |
|---|---|
| `src/core/apps/app.types.ts` | AppManifest interface and related types |
| `src/core/apps/registry.ts` | Central app registry with all applications registered |
| `src/core/apps/index.ts` | Barrel exports for app registry |

### Files Modified

| File | Change |
|---|---|
| `src/core/windowManager/windowManager.utils.ts` | Now imports from app registry instead of directly importing components |
| `src/core/windowManager/index.ts` | Added app registry exports |

### Application Registry API

```typescript
// Get a single app
getApp(appId: string): AppManifest | undefined

// Get all apps
getAllApps(): AppManifest[]

// Get apps by category
getAppsByCategory(category: string): AppManifest[]

// Check if app exists
isAppRegistered(appId: string): boolean

// Get all app IDs
getRegisteredAppIds(): string[]

// Get system/user apps
getSystemApps(): AppManifest[]
getUserApps(): AppManifest[]

// Search apps
searchApps(query: string): AppManifest[]
```

### All Registered Applications

| App ID | Name | Category | Component Location |
|---|---|---|---|
| `settings` | Settings | system | iframe (internal route) |
| `personalization` | Personalization | system | `src/pages/Personalization/` |
| `google` | Google | internet | iframe (external) |
| `facebook` | Facebook | internet | iframe (external) |
| `bing` | Bing | internet | iframe (external) |
| `calculator` | Calculator | utilities | iframe (external) |
| `mplayer` | MPlayer | media | `src/pages/MPlayer/` |
| `linuxmode` | Linux Mode Terminal | tools | `src/pages/LinuxMode/` |
| `devzone` | DevZone | tools | `src/pages/DevZone/` |
| `winsync` | WinSync | tools | `src/pages/WinSync/` |
| `kdialer` | KDialer | utilities | `src/pages/KDialer/` |
| `toolsapp` | Tools | tools | `src/pages/ToolsApp/` |

### Legacy Application Locations

Applications remain in `src/pages/` during this phase:

| Directory | App ID |
|---|---|
| `src/pages/Personalization/` | `personalization` |
| `src/pages/LinuxMode/` | `linuxmode` |
| `src/pages/DevZone/` | `devzone` |
| `src/pages/WinSync/` | `winsync` |
| `src/pages/KDialer/` | `kdialer` |
| `src/pages/MPlayer/` | `mplayer` |
| `src/pages/ToolsApp/` | `toolsapp` |
| `src/pages/Settings/` | `settings` (iframe) |

### Compatibility Mappings

All existing app IDs remain unchanged:
- Taskbar buttons use same IDs (`"google"`, `"facebook"`, `"bing"`)
- Start Menu handlers use same IDs (`"settings"`, `"personalization"`, etc.)
- `os:app_run` events use same IDs
- No breaking changes to existing callers

### WindowManager ↔ App Registry Relationship

```
App Registry (src/core/apps/)
  ├── Knows: what apps exist, their metadata
  └── Does NOT know: which windows are open

WindowManager (src/core/windowManager/)
  ├── Knows: which windows are open, window lifecycle
  └── Uses: getApp(appId) to create windows from registry

Taskbar / Start Menu
  ├── Knows: how to present apps, user interactions
  └── Uses: openWindow(appId) to request window creation
```

### Lazy Loading Status

**Not implemented in this phase.**

All app components are eagerly imported in `src/core/apps/registry.ts`.

The `AppManifest` interface is prepared for future lazy loading:
```typescript
// Future concept (not yet used)
loader?: () => Promise<{ default: React.ComponentType<any> }>
```

Lazy loading will be considered in a future phase after verifying build optimization needs.

### Single Instance Status

**Prepared but not enforced.**

`AppManifest` includes `singleInstance?: boolean` field.

Currently only `settings` is marked as `singleInstance: true`.

The WindowManager does not yet enforce single-instance behavior - duplicate windows can still be opened. This will be implemented in a future phase.

### Known Limitations

1. App components still imported eagerly (no code splitting)
2. Single-instance not enforced
3. App icons not yet implemented
4. App versions not tracked
5. No dynamic app registration (apps hardcoded in registry)

### Recommended Phase 4

**System Surfaces Extraction:**
- Extract system UI components from legacy OS folders into v3.0 core architecture
- Create layout types foundation for future adaptive positioning
- Prepare components so they do not create unnecessary architectural limitations
- Maintain backwards compatibility through compatibility bridges

---

## Phase 4: System Surfaces Extraction (COMPLETED)

### Components Extracted

| Component | Legacy Path | New Path | Status |
|---|---|---|---|
| Clock | `src/OS/Tools/time.js` | `src/core/system/surfaces/Clock/Clock.tsx` | Extracted |
| AppSwitcher | `src/OS/Tools/taskbar/appSwitcher.tsx` | `src/core/system/surfaces/AppSwitcher/AppSwitcher.tsx` | Extracted |
| StartMenu | `src/OS/Tools/menuStart.js` | `src/core/system/surfaces/StartMenu/StartMenu.tsx` | Extracted |
| Taskbar | `src/OS/Tools/taskbar.js` | `src/core/system/surfaces/Taskbar/Taskbar.tsx` | Extracted |

### Files Created

| File | Purpose |
|---|---|
| `src/core/system/layout/layout.types.ts` | ScreenEdge, LayoutMode, SystemLayoutPreferences types |
| `src/core/system/layout/index.ts` | Layout type exports |
| `src/core/system/surfaces/Clock/Clock.tsx` | Clock component (functional, with hooks) |
| `src/core/system/surfaces/Clock/index.ts` | Clock barrel exports |
| `src/core/system/surfaces/AppSwitcher/AppSwitcher.tsx` | AppSwitcher component (preserves DOM-based behavior) |
| `src/core/system/surfaces/AppSwitcher/index.ts` | AppSwitcher barrel exports |
| `src/core/system/surfaces/StartMenu/StartMenu.tsx` | StartMenu component (preserves existing behavior) |
| `src/core/system/surfaces/StartMenu/index.ts` | StartMenu barrel exports |
| `src/core/system/surfaces/Taskbar/Taskbar.tsx` | Taskbar component (with position prop support) |
| `src/core/system/surfaces/Taskbar/index.ts` | Taskbar barrel exports |
| `src/core/system/surfaces/index.ts` | Surfaces barrel exports |

### Files Modified

| File | Change |
|---|---|
| `src/core/system/index.ts` | Added layout and surfaces exports |
| `src/OS/Tools/taskbar.js` | Replaced with compatibility bridge |
| `src/OS/Tools/menuStart.js` | Replaced with compatibility bridge |
| `src/OS/Tools/time.js` | Replaced with compatibility bridge |
| `src/OS/Tools/taskbar/appSwitcher.tsx` | Replaced with compatibility bridge |

### Compatibility Bridges

| Legacy Path | Bridge Implementation |
|---|---|
| `src/OS/Tools/taskbar.js` | `export { Taskbar as default } from '../../core/system/surfaces/Taskbar';` |
| `src/OS/Tools/menuStart.js` | `export { StartMenu as default } from '../../core/system/surfaces/StartMenu';` |
| `src/OS/Tools/time.js` | `export { Clock as default } from '../../core/system/surfaces/Clock';` |
| `src/OS/Tools/taskbar/appSwitcher.tsx` | `export { AppSwitcher as default } from '../../../core/system/surfaces/AppSwitcher';` |

All existing imports continue to work through these bridges.

### Layout Foundation API

```typescript
// Screen edge positions for system surfaces
type ScreenEdge = 'top' | 'right' | 'bottom' | 'left';

// Layout mode for system surfaces
type LayoutMode = 'adaptive' | 'custom';

// System layout preferences for future configuration
interface SystemLayoutPreferences {
  mode: LayoutMode;
  taskbarPosition: ScreenEdge;
}

// Default layout preferences matching current v2.2 behavior
const DEFAULT_LAYOUT_PREFERENCES: SystemLayoutPreferences = {
  mode: 'adaptive',
  taskbarPosition: 'bottom',
};
```

### Component Architecture

**Taskbar:**
- Now accepts optional `position?: ScreenEdge` prop
- Defaults to `'bottom'` (current behavior)
- Uses `data-position` attribute for future CSS styling
- No visual changes - remains at bottom

**Clock:**
- Converted from class component to functional component with hooks
- Accepts optional `position?: ScreenEdge` prop
- Preserves all existing behavior

**AppSwitcher:**
- Preserves DOM-based window reading (MutationObserver)
- No changes to behavior
- Documented as technical debt for future WindowManager integration

**StartMenu:**
- Preserves all existing behavior
- App launching callbacks unchanged
- No visual changes

### Remaining Legacy Dependencies

| File | Status |
|---|---|
| `src/OS/Tools/taskbar.js` | Compatibility bridge only |
| `src/OS/Tools/menuStart.js` | Compatibility bridge only |
| `src/OS/Tools/time.js` | Compatibility bridge only |
| `src/OS/Tools/taskbar/appSwitcher.tsx` | Compatibility bridge only |
| `src/app.js` | Still imports from legacy path (works through bridge) |

### DOM-Based Technical Debt

1. **AppSwitcher** reads windows from DOM using MutationObserver
   - Should eventually use WindowManager's window list API
   - Current behavior preserved for backwards compatibility

2. **Theme switching** uses direct DOM manipulation
   - `taskbar.js` manipulates `document.body` classes
   - Should eventually use CSS custom properties or context

3. **Accent color injection** creates `<style>` elements in `<head>`
   - Should eventually use CSS variables or theme context

### Future Adaptive Layout Considerations

The architecture now supports:
- Taskbar position via `position` prop (currently locked to `'bottom'`)
- CSS `data-position` attribute for future edge-specific styling
- Layout preferences type for future settings UI
- No hardcoded assumptions about screen edge in component logic

Future phases can implement:
- Settings UI for taskbar position
- CSS for different edge positions
- Adaptive layout engine
- User preferences persistence

### Recommended Phase 5

**Desktop Runtime Extraction + System Bar Foundation:**
- Extract core Desktop Runtime from legacy OS structure
- Create layered desktop architecture
- Prepare foundation for future system bars and adaptive layout
- Maintain backwards compatibility

---

## Phase 5: Desktop Runtime Extraction + System Bar Foundation (COMPLETED)

### New Desktop Runtime Structure

```
src/core/desktop/
├── DesktopRuntime.tsx       # Main orchestrator for desktop environment
├── Desktop.tsx              # Desktop container (existing)
├── DesktopLayer.tsx         # Z-index layering (existing)
├── desktop.types.ts         # Type definitions (updated)
├── desktop.constants.ts     # Constants (new)
├── index.ts                 # Barrel exports (updated)
└── layers/
    ├── BackgroundLayer.tsx   # Wallpaper and background effects
    ├── DesktopContentLayer.tsx # Desktop-level content
    ├── WindowLayer.tsx       # Window rendering layer
    ├── SystemSurfaceLayer.tsx # System UI layer
    ├── OverlayLayer.tsx      # Dialogs and overlays
    └── index.ts
```

### Files Created

| File | Purpose |
|---|---|
| `src/core/desktop/DesktopRuntime.tsx` | Main desktop orchestrator, composes all layers |
| `src/core/desktop/desktop.constants.ts` | Layer z-index values, CSS class names |
| `src/core/desktop/layers/BackgroundLayer.tsx` | Wallpaper and background effects layer |
| `src/core/desktop/layers/DesktopContentLayer.tsx` | Desktop content layer (icons, widgets) |
| `src/core/desktop/layers/WindowLayer.tsx` | Window rendering layer |
| `src/core/desktop/layers/SystemSurfaceLayer.tsx` | System UI layer (Taskbar, bars) |
| `src/core/desktop/layers/OverlayLayer.tsx` | Dialogs, notifications, overlays |
| `src/core/desktop/layers/index.ts` | Layer barrel exports |
| `src/core/system/surfaces/SystemBar/SystemBar.tsx` | Reusable system bar with slot pattern |
| `src/core/system/surfaces/SystemBar/index.ts` | SystemBar barrel exports |

### Files Modified

| File | Change |
|---|---|
| `src/core/desktop/desktop.types.ts` | Added DesktopRuntimeProps, WindowManagerContext |
| `src/core/desktop/index.ts` | Added DesktopRuntime and layer exports |
| `src/core/system/surfaces/index.ts` | Added SystemBar exports |
| `src/core/system/index.ts` | Added SystemBar exports |
| `src/core/index.ts` | Added DesktopRuntime and layer exports |

### Layer Architecture

| Layer | Z-Index | Responsibility |
|---|---|---|
| BackgroundLayer | 0 | Wallpaper, background effects |
| DesktopContentLayer | 1 | Desktop icons, widgets (future) |
| WindowLayer | 10 | Window rendering (via WindowManager) |
| SystemSurfaceLayer | 100 | Taskbar, system bars, start menu |
| OverlayLayer | 1000 | Dialogs, notifications, search |

### DesktopRuntime Architecture

```
DesktopRuntime
├── WindowManager (single source of truth for windows)
│   ├── BackgroundLayer (wallpaper)
│   ├── #window-frame (window rendering)
│   ├── SystemSurfaceLayer
│   │   └── Taskbar (with position prop)
│   └── OverlayLayer (future)
└── Children (Bootloader, etc.)
```

### SystemBar API

```typescript
// SystemBar with slot pattern
<SystemBar edge="top">
  <SystemBar.Left>
    {/* Weather, launcher */}
  </SystemBar.Left>
  <SystemBar.Center>
    {/* Search */}
  </SystemBar.Center>
  <SystemBar.Right>
    {/* Time, system info */}
  </SystemBar.Right>
</SystemBar>

// Props
interface SystemBarProps {
  edge?: ScreenEdge;  // 'top' | 'right' | 'bottom' | 'left'
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
```

### WindowManager Integration

DesktopRuntime uses the existing WindowManager pattern:
- WindowManager remains single source of truth for window state
- DesktopRuntime composes WindowManager (does NOT own window state)
- Taskbar receives window state/actions as props

### Legacy Desktop Components

| Component | Status |
|---|---|
| `src/OS/background.js` | Preserved as-is, not yet migrated |
| `src/OS/bootloader.js` | Preserved as-is, not yet migrated |
| `src/app.js` | Still uses legacy structure |

Note: `src/OS/background.js` contains context menu and version display logic that could be migrated in a future phase. For now, it remains untouched to preserve backwards compatibility.

### Future Adaptive Layout Strategy

The architecture now supports:
- Layered desktop with clear z-index separation
- SystemBar component with position-agnostic design
- ScreenEdge type for future taskbar positioning
- No hardcoded assumptions about screen edges in architectural logic

Future phases can implement:
- Movable taskbar (top/right/bottom/left)
- Adaptive layout engine
- Custom layout settings
- Top system bar
- Bottom system area

### Remaining Legacy Dependencies

| File | Status |
|---|---|
| `src/OS/background.js` | Legacy, not yet migrated |
| `src/OS/bootloader.js` | Legacy, not yet migrated |
| `src/app.js` | Legacy, uses legacy imports |

### Known Limitations

1. DesktopRuntime does not yet use DesktopRuntime in app.js
2. Background.js not yet migrated to BackgroundLayer
3. SystemBar not yet integrated into DesktopRuntime
4. OverlayLayer prepared but not used

### Recommended Phase 6

**Legacy Desktop Migration + Integration:**
- Migrate `src/OS/background.js` logic to BackgroundLayer
- Update `src/app.js` to use DesktopRuntime
- Integrate SystemBar into DesktopRuntime
- Begin migrating bootloader to v3.0
- Complete legacy OS folder extraction

---

## 1. Current Project Structure Summary (v2.2)

```
src/
├── app.js                    # Root App component (boot sequence + layout)
├── app.css                   # All global styles (1445 lines)
├── index.js                  # Entry point with React Router
├── logo.svg
├── reportWebVitals.js
├── setupTests.js
├── OS/
│   ├── background.js         # Desktop wallpaper + context menu
│   ├── background.css        # Background-specific styles
│   ├── bootloader.js         # Boot splash screen
│   ├── Tools/
│   │   ├── menuStart.js      # Start menu component
│   │   ├── taskbar.js        # Taskbar + window management (central orchestrator)
│   │   ├── time.js           # Clock component
│   │   └── taskbar/
│   │       └── appSwitcher.tsx  # Alt-Tab style app switcher
│   └── Window/
│       └── buildWindow.tsx   # Draggable/resizable window component
├── pages/
│   ├── DevZone/devzone.jsx   # Developer tools (JSON, Base64, Regex, etc.)
│   ├── KDialer/kdialer.jsx   # Phone dialer app
│   ├── LinuxMode/linuxmode.jsx  # Simulated Linux terminal
│   ├── MPlayer/mplayer.jsx   # Music player app
│   ├── Personalization/personalization.jsx  # Wallpaper + accent color settings
│   ├── Settings/homescreen.jsx  # Placeholder settings page
│   ├── ToolsApp/toolsapp.jsx  # Screenshot, monitor, clipboard, recorder, color picker, notes
│   └── WinSync/winsync.jsx   # Clipboard sync, file transfer, QR, link shortener, notes
└── lambda/
    ├── async-dadjoke.js      # Netlify serverless function
    └── hello.js              # Netlify serverless function
```

**Architecture:** Create React App + React 18 + React Router v6
**State Management:** Local state + localStorage + Custom DOM Events
**Styling:** Plain CSS (single global file + per-component CSS)
**Window System:** interactjs for drag/resize, custom Window component

---

## 2. New Target Architecture (v3.0)

```
src/
├── app/
│   ├── App.tsx               # Root App component (future)
│   ├── providers/             # Context providers (future)
│   └── routes/                # Route definitions (future)
│
├── core/
│   ├── desktop/
│   │   ├── Desktop.tsx        # Desktop container
│   │   ├── DesktopLayer.tsx   # Z-index layering
│   │   ├── desktop.types.ts   # Desktop type definitions
│   │   └── index.ts
│   ├── windowManager/
│   │   ├── Window/
│   │   │   ├── Window.tsx         # Main window component
│   │   │   ├── WindowHeader.tsx   # Title bar with controls
│   │   │   ├── WindowContent.tsx  # Content renderer
│   │   │   ├── window.types.ts    # Window data types
│   │   │   ├── window.constants.ts # Window constants
│   │   │   └── index.ts
│   │   ├── windowManager.types.ts  # Manager types (future)
│   │   ├── windowManager.constants.ts # Manager constants
│   │   └── index.ts
│   ├── system/
│   │   ├── topbar/
│   │   │   ├── TopBar.tsx     # Future top bar
│   │   │   ├── topbar.types.ts
│   │   │   └── index.ts
│   │   ├── bottombar/
│   │   │   ├── BottomBar.tsx  # Future bottom bar
│   │   │   ├── bottombar.types.ts
│   │   │   └── index.ts
│   │   ├── bootloader/
│   │   │   ├── Bootloader.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── state/
│   │   ├── state.types.ts     # Global state types
│   │   └── index.ts
│   └── index.ts
│
├── features/
│   ├── search/
│   │   ├── Search.tsx
│   │   ├── search.types.ts
│   │   └── index.ts
│   ├── widgets/
│   │   ├── Widgets.tsx
│   │   ├── widgets.types.ts
│   │   └── index.ts
│   ├── notifications/
│   │   ├── Notifications.tsx
│   │   ├── notifications.types.ts
│   │   └── index.ts
│   ├── settings/
│   │   ├── settings.types.ts
│   │   └── index.ts
│   ├── appearance/
│   │   ├── Appearance.tsx
│   │   ├── appearance.types.ts
│   │   └── index.ts
│   └── index.ts
│
├── apps/
│   ├── file-explorer/index.ts
│   ├── browser/index.ts
│   ├── settings/index.ts
│   ├── shared/index.ts
│   └── index.ts
│
├── components/
│   ├── ui/index.ts
│   ├── layout/index.ts
│   ├── shared/index.ts
│   └── index.ts
│
├── hooks/index.ts
├── services/index.ts
├── utils/index.ts
├── types/index.ts
├── constants/index.ts
│
├── styles/
│   ├── tokens/
│   │   ├── colors.css         # Design tokens: colors
│   │   ├── spacing.css        # Design tokens: spacing
│   │   ├── radius.css         # Design tokens: border radius
│   │   └── index.css
│   ├── globals/
│   │   ├── reset.css          # CSS reset
│   │   ├── base.css           # Base typography
│   │   └── index.css
│   └── legacy/
│       └── app.css            # Original v2.2 global styles (moved)
│
├── assets/
│   └── images/
│
├── legacy/
│   └── README.md              # Migration documentation
│
├── OS/                         # [LEGACY] Original OS components
├── pages/                      # [LEGACY] Original application components
├── app.js                      # [LEGACY] Original root App component
├── app.css                     # [RE-EXPORT] Imports from styles/
└── index.js                    # [LEGACY] Entry point (unchanged)
```

---

## 3. What Was Moved

| Original Location | New Location | Status |
|---|---|---|
| `src/app.css` (content) | `src/styles/legacy/app.css` | Moved; `src/app.css` now re-imports |
| `src/styles/tokens/colors.css` | New file | Created (extracted from app.css) |
| `src/styles/tokens/spacing.css` | New file | Created |
| `src/styles/tokens/radius.css` | New file | Created |
| `src/styles/globals/reset.css` | New file | Created (extracted from app.css) |
| `src/styles/globals/base.css` | New file | Created (extracted from app.css) |

---

## 4. What Remains Legacy

| File/Directory | Reason |
|---|---|
| `src/OS/` | Core OS components tightly coupled to taskbar.js |
| `src/pages/` | All application components imported directly by taskbar.js |
| `src/app.js` | Root component, imports OS components |
| `src/index.js` | Entry point with router |
| `src/lambda/` | Netlify serverless functions (unrelated to UI) |

---

## 5. What Should Be Migrated Next

### Priority 1: Window System Extraction
- Move `src/OS/Window/buildWindow.tsx` → `src/core/windowManager/Window/`
- Create re-export at old path for backwards compatibility
- Extract window state management from taskbar.js into a proper WindowManager

### Priority 2: Taskbar Decomposition
- Split `src/OS/Tools/taskbar.js` into:
  - `src/core/system/bottombar/` - Taskbar container
  - `src/core/system/bottombar/StartMenu.tsx` - Start menu
  - `src/core/system/bottombar/Clock.tsx` - Clock
  - `src/core/system/bottombar/AppSwitcher.tsx` - App switcher
  - `src/core/system/bottombar/SearchBar.tsx` - Search bar

### Priority 3: App Registry
- Create an app registry system in `src/apps/`
- Move app definitions from taskbar.js switch statement to registry
- Support dynamic app loading

### Priority 4: State Management
- Extract localStorage operations into `src/services/`
- Create proper state management in `src/core/state/`
- Move DOM event system to `src/services/`

### Priority 5: TypeScript Migration
- Add `tsconfig.json`
- Convert `.js` files to `.ts`/`.tsx` incrementally
- Start with leaf components (time.js, bootloader.js)

---

## 6. Technical Debt Discovered

1. **Single monolithic CSS file** - `app.css` is 1445 lines with all themes, all components, all responsive rules
2. **No state management** - All state is local + localStorage + DOM events
3. **Tight coupling** - taskbar.js imports ALL app components directly
4. **Mixed file extensions** - `.js`, `.jsx`, `.tsx` used inconsistently
5. **No TypeScript config** - No `tsconfig.json` despite having `.tsx` files
6. **No path aliases** - All imports use relative paths (`../../pages/...`)
7. **No lazy loading** - All apps imported eagerly in taskbar.js
8. **DOM manipulation** - Theme switching uses direct DOM manipulation
9. **No CSS modules** - All styles are global
10. **No build optimization** - CRA defaults, no code splitting

---

## 7. Risky Areas for Future Refactoring

1. **taskbar.js** - Central orchestrator; any changes here affect the entire OS
2. **buildWindow.tsx** - Uses interactjs; drag/resize logic is complex
3. **Theme system** - CSS class toggling on document.body; deeply coupled to app.css
4. **localStorage keys** - Multiple components share localStorage; key changes break persistence
5. **DOM events** - Custom events (os:reload, os:app_run) are used cross-component
6. **App imports** - All apps are statically imported; switching to lazy loading requires careful handling
7. **Settings iframe** - Settings opens in iframe via URL route; breaks if routing changes

---

## 8. Migration Guidelines

1. **Never break existing imports** - Always create re-exports at old paths
2. **Move one component at a time** - Don't try to move everything at once
3. **Test after each move** - Run `npm start` to verify the app works
4. **Keep legacy code working** - Old code should continue functioning
5. **Create index.ts files** - Use barrel exports for clean module boundaries
6. **Define types first** - Create type definitions before moving components
7. **Extract services** - Move localStorage operations to services before moving components
8. **Add path aliases** - Configure webpack/vite aliases to simplify imports
