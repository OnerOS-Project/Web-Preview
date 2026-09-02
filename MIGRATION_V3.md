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

**Runtime Integration + Legacy Desktop Migration:**
- Migrate `src/OS/background.js` logic to BackgroundLayer
- Update `src/app.js` to use DesktopRuntime
- Integrate SystemBar into DesktopRuntime
- Begin migrating bootloader to v3.0
- Complete legacy OS folder extraction

---

## Phase 6: Runtime Integration + Legacy Desktop Migration (COMPLETED)

### Runtime Composition Before Phase 6

```
src/app.js
├── LoadOS (bootloader) - renders splash screen
├── After 3 seconds:
│   ├── WindowManager
│   │   ├── Taskbar
│   │   └── Background (from src/OS/background.js)
│   └── LoadOS (always rendered)
```

### Runtime Composition After Phase 6

```
src/app.js
├── DesktopRuntime (isBooted state managed here)
│   ├── WindowManager
│   │   ├── BackgroundLayer (migrated from background.js)
│   │   ├── SystemSurfaceLayer
│   │   │   └── Taskbar
│   │   └── OverlayLayer (future)
├── LoadOS (bootloader) - still renders splash screen
```

### Files Created

| File | Purpose |
|---|---|
| None | No new files created in this phase |

### Files Modified

| File | Change |
|---|---|
| `src/app.js` | Now uses DesktopRuntime instead of direct legacy imports |
| `src/core/desktop/DesktopRuntime.tsx` | Accepts `isBooted` prop, removed duplicate boot logic |
| `src/core/desktop/desktop.types.ts` | Added `isBooted` prop to DesktopRuntimeProps |
| `src/core/desktop/layers/BackgroundLayer.tsx` | Migrated all background.js behavior |
| `src/core/desktop/layers/SystemSurfaceLayer.tsx` | Simplified, positioned at bottom |
| `src/OS/background.js` | Replaced with compatibility bridge |
| `package.json` | Version updated to 3.0.0 |

### Files Migrated

| Original | New Location | Status |
|---|---|---|
| `src/OS/background.js` | `src/core/desktop/layers/BackgroundLayer.tsx` | Fully migrated |
| `src/OS/background.css` | `src/core/desktop/layers/BackgroundLayer.tsx` | CSS imported from original location |

### Components Now Rendered by DesktopRuntime

| Component | Layer | Status |
|---|---|---|
| BackgroundLayer | Background (z-index: 0) | Active - migrated from background.js |
| WindowManager | Window (z-index: 10) | Active - renders windows |
| SystemSurfaceLayer | System (z-index: 100) | Active - contains Taskbar |
| Taskbar | System | Active - with position="bottom" |
| OverlayLayer | Overlay (z-index: 1000) | Prepared - not yet used |

### Background Migration Status

**COMPLETED**

BackgroundLayer now includes all behavior from original background.js:
- Context menu (right-click)
- Version display ("OnerOS Web (Preview) 3.0.0")
- Reload UI event dispatch
- Start Menu event dispatch
- All existing interactions

Original `src/OS/background.js` is now a compatibility bridge:
```javascript
export { default } from '../../core/desktop/layers/BackgroundLayer';
```

### SystemSurfaceLayer Integration

**COMPLETED**

SystemSurfaceLayer is now actively used in DesktopRuntime:
- Positioned at bottom of screen (z-index: 100)
- Renders Taskbar with position="bottom"
- Preserves existing layout behavior

### SystemBar Integration Status

**PREPARED - NOT YET VISIBLE**

SystemBar component exists but is not yet rendered in DesktopRuntime.
This preserves the current v2.2 visual appearance.

Future phases can integrate SystemBar for top/bottom system areas.

### Bootloader Migration Status

**NOT MIGRATED - Intentionally preserved**

`src/OS/bootloader.js` remains as-is:
- Simple component (17 lines)
- Sets body styles and shows splash screen
- No risk in keeping as legacy
- Can be migrated in future phase if desired

### Compatibility Bridges

| Legacy Path | Bridge |
|---|---|
| `src/OS/background.js` | Re-exports BackgroundLayer |

### Remaining Legacy Dependencies

| File | Status | Notes |
|---|---|---|
| `src/OS/bootloader.js` | Active | Simple, no migration needed yet |
| `src/OS/background.js` | Bridge only | Re-exports from BackgroundLayer |
| `src/OS/background.css` | Active | Imported by BackgroundLayer |
| `src/OS/Tools/taskbar.js` | Bridge only | Re-exports from v3.0 Taskbar |
| `src/OS/Tools/menuStart.js` | Bridge only | Re-exports from v3.0 StartMenu |
| `src/OS/Tools/time.js` | Bridge only | Re-exports from v3.0 Clock |
| `src/OS/Tools/taskbar/appSwitcher.tsx` | Bridge only | Re-exports from v3.0 AppSwitcher |
| `src/OS/Window/buildWindow.tsx` | Bridge only | Re-exports from v3.0 Window |

### Version Update

Package version updated from `2.2.0` to `3.0.0` to reflect the architectural milestone.

### Build/Test Result

```
Build: SUCCESS
Bundle size: 656.64 kB (gzipped)
Warnings: Pre-existing (aria-disabled, unused vars)
```

### Regressions Found

None. All existing functionality preserved:
- Boot sequence works correctly
- Background renders with context menu
- Taskbar renders at bottom
- Windows open and close correctly
- Start Menu works
- Clock works
- AppSwitcher works
- All os:* events still work

### Recommended Phase 7

**Polish + Remaining Legacy Cleanup:**
- Migrate bootloader to v3.0 (optional)
- Remove remaining compatibility bridges
- Clean up unused legacy code
- Optimize bundle size
- Add TypeScript strict mode

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

---

# OnerOS Web Preview 3.1.0 — Codename: FLUENT VALLEY

## Version 3.1 Development

### PHASE 1 — Fluent Valley Foundation

**Goal:** Create the visual foundation for the OnerOS 2026 theme and Fluent Valley design system.

#### 1. Existing Token Audit

| File | Status | Contents |
|------|--------|----------|
| `src/styles/tokens/colors.css` | Extended | Accent, background, text, border, window, taskbar, menu, status, per-theme variables |
| `src/styles/tokens/spacing.css` | Unchanged | Spacing scale, layout dimensions, border widths |
| `src/styles/tokens/radius.css` | Unchanged | Border radius scale, per-theme radii |
| `src/styles/tokens/typography.css` | Extended | Font families, sizes, weights, line heights + Fluent Valley aliases |
| `src/styles/tokens/shadows.css` | Extended | Shadow scale + Fluent Valley elevation system |
| `src/styles/tokens/motion.css` | **New** | Duration scale, easing curves, reduced-motion support |
| `src/styles/tokens/surfaces.css` | **New** | Surface hierarchy, glass/translucency system with fallback |
| `src/styles/tokens/index.css` | Updated | Imports motion.css and surfaces.css |

#### 2. New Tokens Added

**Color Tokens (`--fv-*` prefix):**
- `--fv-background`, `--fv-surface`, `--fv-surface-elevated`, `--fv-surface-floating`
- `--fv-text-primary`, `--fv-text-secondary`, `--fv-text-muted`
- `--fv-border-subtle`, `--fv-border-default`, `--fv-border-active`
- `--fv-accent`, `--fv-accent-hover`, `--fv-accent-subtle`
- `--fv-success`, `--fv-warning`, `--fv-error`, `--fv-info`

**Typography Tokens (`--fv-font-*`, `--fv-line-height-*`):**
- `--fv-font-family`, `--fv-font-family-mono`
- `--fv-font-size-xs` through `--fv-font-size-3xl`
- `--fv-font-weight-regular`, `--fv-font-weight-medium`, `--fv-font-weight-semibold`
- `--fv-line-height-tight`, `--fv-line-height-normal`, `--fv-line-height-relaxed`

**Elevation Tokens (`--fv-elevation-*`):**
- `--fv-elevation-0` through `--fv-elevation-4`
- `--fv-elevation-active`

**Motion Tokens (`--fv-duration-*`, `--fv-ease-*`, `--fv-transition-*`):**
- `--fv-duration-instant` through `--fv-duration-slower`
- `--fv-ease-standard`, `--fv-ease-decelerate`, `--fv-ease-accelerate`, `--fv-ease-emphasized`, `--fv-ease-spring`
- `--fv-transition-fast`, `--fv-transition-normal`, `--fv-transition-slow`

**Surface Tokens (`--fv-surface-*`, `--fv-glass-*`):**
- `--fv-surface-base` through `--fv-surface-overlay`
- `--fv-surface-card`, `--fv-surface-panel`, `--fv-surface-dialog`
- `--fv-surface-glass`
- `--fv-glass-opacity`, `--fv-glass-blur`, `--fv-glass-border`, `--fv-glass-bg`

#### 3. Modified Tokens

None. All existing tokens remain unchanged. New tokens are additive.

#### 4. OnerOS 2026 Theme Architecture

- **Body class:** `oneros2026-mode`
- **Taskbar class:** `oneros2026-theme`
- **Theme ID:** 6 (in THEMES array)
- **CSS file:** `src/styles/themes/oneros2026.css`
- **Pattern:** Same body class toggling as existing themes
- **Integration:** Added to `THEME_MODES`, `THEME_CLASSES`, `BODY_MODE_CLASSES` constants
- **Type:** `DesktopTheme` union extended with `'oneros2026'`
- **Personalization:** Selectable in Personalization app with `faMagicWandSparkles` icon
- **Taskbar:** Boot restoration and theme cycling support OnerOS 2026

#### 5. Surface Hierarchy

```
Wallpaper
  ↓
Desktop
  ↓
Base Surface       (--fv-surface-base)
  ↓
Elevated Surface   (--fv-surface-elevated)
  ↓
Floating Surface   (--fv-surface-floating)
  ↓
Interactive Element
```

Additional semantic surfaces: `--fv-surface-card`, `--fv-surface-panel`, `--fv-surface-dialog`, `--fv-surface-overlay`, `--fv-surface-glass`.

#### 6. Glass / Translucency Strategy

- Glass surfaces use `backdrop-filter: blur()` with fallback
- `@supports (backdrop-filter: blur(1px))` enables glass effects
- `@supports not (backdrop-filter: blur(1px))` falls back to solid opaque backgrounds
- Default blur: 12px (not extreme)
- Glass opacity: 0.75 (readable on complex wallpapers)

#### 7. Shadow / Elevation System

5-level elevation system (0-4) designed for soft depth:
- Level 0: No shadow
- Level 1: Subtle lift (cards, panels)
- Level 2: Elevated (dropdowns, popovers)
- Level 3: Floating (modals, dialogs)
- Level 4: Highest (tooltips, notifications)
- Active: Pressed state

#### 8. Typography System

Semantic font size scale (`--fv-font-size-*`) mapping to existing `--text-*` tokens.
System font stack preferred for performance. No external font dependencies added.

#### 9. Motion System

- Duration scale: instant (0ms), fast (100ms), normal (200ms), slow (350ms), slower (500ms)
- Easing: standard, decelerate, accelerate, emphasized, spring
- No GSAP or heavy animation libraries

#### 10. Reduced Motion Support

`@media (prefers-reduced-motion: reduce)` block in `motion.css` reduces all duration tokens to 0ms. This is a global mechanism — any future animation using `--fv-duration-*` or `--fv-transition-*` will automatically be disabled.

#### 11. Design System Preparation

UI primitives (AppShell, Button, EmptyState, Panel, Section) already consume CSS custom properties. They automatically inherit Fluent Valley tokens when OnerOS 2026 theme is active. No component changes required in this phase.

#### 12. Bundle Size Comparison

| Metric | Before (v3.0) | After (v3.1 Phase 1) | Delta |
|--------|---------------|----------------------|-------|
| Main JS (gzip) | 656.64 kB | 637.25 kB | -19.39 kB |
| Main CSS (gzip) | ~10.35 kB | 11.94 kB | +1.59 kB |

#### 13. Dependencies Added

None. All work uses existing CSS architecture and variables.

#### 14. Compatibility Results

- Bootloader: Working
- Desktop: Unchanged
- WindowManager: Unchanged
- Window open/close: Unchanged
- Taskbar: Updated (backward compatible)
- StartMenu: Working
- AppSwitcher: Working
- Settings: Working
- Personalization: Updated (new theme option)
- Themes: All existing themes functional
- Accent colors: Working
- Wallpapers: Working
- Lazy-loaded apps: Working
- Desktop: Working
- Mobile: Working

No regressions found.

#### 15. Recommended Phase 2

- Begin applying Fluent Valley surface tokens to existing components
- Migrate Taskbar to consume `--fv-surface-*` and `--fv-glass-*` tokens
- Apply elevation tokens to window components
- Implement Fluent Valley motion tokens for window open/close transitions
- Consider CSS-only micro-interactions (hover states, focus rings)
- Migrate app shell components to use semantic surface tokens

---

### PHASE 2 — Theme Engine & Appearance Architecture

**Goal:** Complete and stabilize the theme and appearance architecture. One coherent appearance flow.

#### 1. Theme Architecture Before (v3.0 / Phase 1)

- THEMES array duplicated in 3 locations: `personalization.jsx`, `Taskbar.tsx` (boot), `Taskbar.tsx` (toggle)
- `THEME_MODES`, `THEME_CLASSES`, `BODY_MODE_CLASSES` constants exported but never imported
- Theme application: manual class removal + switch/case in each location
- Accent colors: `document.createElement('style')` injection in 3 locations
- No centralized theme data, no centralized accent logic
- Adding a new theme required updating 3+ files with hardcoded class lists

#### 2. Theme Architecture After (Phase 2)

```
Theme Registry (single source of truth)
    ↓
Appearance Service (single entry point)
    ↓
DOM manipulation + localStorage persistence
    ↓
CSS variables → UI rendering
```

- **Theme Registry** (`src/core/system/appearance/themeRegistry.ts`): Single THEMES array, class lists, helper functions
- **Appearance Service** (`src/core/system/appearance/appearance.ts`): `setTheme()`, `restoreAppearance()`, `resetAppearance()`
- **Accent Module** (`src/core/system/appearance/accent.ts`): `applyAccentColor()` via CSS custom properties, zero style injection
- **Personalization** imports from appearance module, no duplicate data
- **Taskbar** imports from appearance module, no duplicate data
- **Linux Mode** imports `applyAccentColor()`, no style injection

#### 3. Appearance State Owner

`src/core/system/appearance/` is the single owner of:
- Theme selection and application
- Accent color management
- Wallpaper management
- Persistence (localStorage)
- Boot restoration

No duplicate state owners exist.

#### 4. Theme Persistence Flow

```
User selects theme
    ↓
setTheme(themeId)
    ↓
applyThemeToDOM(themeId)  →  body/taskbar class toggling
    ↓
localStorage.setItem('os_theme', id)
    ↓
On boot: restoreAppearance()
    ↓
getStoredThemeId()  →  read + validate
    ↓
applyThemeToDOM(themeId)
    ↓
restoreAccentColor()  →  applyAccentColor() via CSS vars
    ↓
restoreWallpaper()
```

#### 5. Accent Color Architecture

Before: 3 separate `document.createElement('style')` injections generating CSS strings.

After: Single `applyAccentColor(color)` function that sets CSS custom properties on `document.documentElement`:
- `--color-accent`, `--color-accent-dark`, `--color-accent-light`
- `--color-accent-hover`, `--color-accent-active`, `--color-accent-subtle`, `--color-accent-contrast`
- `--fv-accent`, `--fv-accent-hover`, `--fv-accent-active`, `--fv-accent-subtle`, `--fv-accent-contrast`

No `<style>` elements created. All rendering via CSS variables.

#### 6. Runtime Style Injection Removed

| Location | Before | After |
|----------|--------|-------|
| `personalization.jsx` | `document.createElement('style')` with 6 CSS rules | `applyAccentColor()` → CSS vars |
| `Taskbar.tsx` | `document.createElement('style')` with 6 CSS rules | `restoreAppearance()` → CSS vars |
| `linuxmode.jsx` | `document.createElement('style')` with 14 CSS rules | `applyAccentColor()` → CSS vars |

All 3 injection sites eliminated. Legacy injected styles are cleaned up by `removeInjectedAccentStyle()`.

#### 7. CSS Variables Added or Modified

**New accent variant tokens (all themes + `:root`):**
- `--color-accent-hover`
- `--color-accent-active`
- `--color-accent-subtle`
- `--color-accent-contrast`
- `--fv-accent-hover`
- `--fv-accent-active`
- `--fv-accent-subtle`
- `--fv-accent-contrast`

**New storage key:**
- `STORAGE_KEYS.THEME = 'os_theme'`

#### 8. OnerOS 2026 Default Readiness

- `DEFAULT_THEME_ID = 0` (Modern) — current default
- `FALLBACK_THEME_ID = 0` — safe fallback for invalid values
- To change default for new users: change `DEFAULT_THEME_ID` to `6`
- Returning users: `getStoredThemeId()` reads localStorage, preserves choice
- Invalid values: `validateThemeId()` returns `FALLBACK_THEME_ID`
- New users with no stored value: `DEFAULT_THEME_ID` is used

#### 9. Existing-User Migration

- All stored `os_theme` values (0-6) continue to work
- All stored `os_accent_color` values continue to work
- All stored `os_wallpaper_*` values continue to work
- No breaking changes to localStorage schema
- Boot restoration validates and falls back safely

#### 10. Legacy Theme Compatibility

All 7 themes continue to work exactly as before:
- Modern (0), Centered (1), Win95 (2), WinXP (3), macOS (4), Ubuntu (5), OnerOS 2026 (6)
- Theme-specific CSS variable overrides unchanged
- Per-theme component styling unchanged
- Legacy `app.css` theme rules unchanged

#### 11. Wallpaper Architecture

Wallpaper is independent from theme and accent:
- `applyWallpaper(type, color)` — DOM manipulation only
- `persistWallpaper(type, color)` — localStorage only
- `restoreWallpaper()` — reads + applies from localStorage
- Changing wallpaper does not affect theme or accent
- Changing theme does not affect wallpaper

#### 12. Performance Impact

| Metric | Phase 1 | Phase 2 | Delta |
|--------|---------|---------|-------|
| Main JS (gzip) | 637.25 kB | 626.0 kB | -11.25 kB |
| Main CSS (gzip) | 11.94 kB | 12.24 kB | +0.30 kB |

JS decreased because duplicated theme arrays were removed from Personalization and Taskbar.
CSS increased slightly due to new accent variant tokens in each theme block.

#### 13. Remaining Technical Debt

- Legacy `app.css` (1463 lines) remains unrefactored
- `--color-accent-dark` still used by app CSS (toolsapp, winsync, devzone, mplayer, kdialer) — kept for backward compatibility
- `THEME_MODES`, `THEME_CLASSES`, `BODY_MODE_CLASSES` constants still exported but now redundant with themeRegistry — can be deprecated in Phase 3
- `resetToDefault()` in Personalization still manually resets `.menu-square` styles — legacy compatibility

#### 14. Recommended Phase 3

- Begin applying Fluent Valley surface tokens to existing components
- Migrate Taskbar to consume `--fv-surface-*` and `--fv-glass-*` tokens
- Apply elevation tokens to window components
- Implement Fluent Valley motion tokens for window open/close transitions
- Consider CSS-only micro-interactions (hover states, focus rings)
- Deprecate `THEME_MODES`/`THEME_CLASSES`/`BODY_MODE_CLASSES` in favor of themeRegistry exports

---

### PHASE 3 — System Bars + Fluent Valley Surfaces + Responsive Layout

**Goal:** First major visible Fluent Valley system UI — TopBar, BottomBar, surface styling, responsive behavior.

#### 1. TopBar Architecture

New component at `src/core/system/topbar/TopBar.tsx`:
- **Left:** Weather surface (lightweight placeholder, no API dependency)
- **Center:** Search surface with Fluent Valley glass styling
- **Right:** Clock (reuses date logic, no duplication)

Uses Fluent Valley tokens: `--fv-surface-glass`, `--fv-glass-blur`, `--fv-glass-border`, `--fv-transition-*`.

Renders as `#os-topbar` with `position: fixed; top: 0; z-index: 200`.

#### 2. BottomBar Architecture

New component at `src/core/system/bottombar/BottomBar.tsx` — 3-zone layout:
- **Left:** Widgets / system launcher area
- **Center:** Applications (absolutely centered relative to viewport)
- **Right:** System controls / notifications

Center zone uses `position: absolute; left: 50%; transform: translateX(-50%)` to remain optically centered regardless of left/right content width.

#### 3. Taskbar Migration

The existing `Taskbar` component was restructured with the 3-zone layout:
- **Left zone:** Menu button (`.menu` + `.fv-taskbar-menu`)
- **Center zone:** Application icons (`.apps` + `.fv-taskbar-center`)
- **Right zone:** Clock (`.fv-taskbar-clock`)

All legacy class names preserved (`.menu`, `.menu-square`, `.apps`, `#os-taskbar`, `#clock`) for backward compatibility with theme CSS.

#### 4. DesktopRuntime Integration

`DesktopRuntime.tsx` now renders:
```
<BackgroundLayer />
<SystemSurfaceLayer>  ← now full-viewport, pointer-events: none
  <TopBar />          ← position: fixed, top
  <Taskbar />         ← position: fixed, bottom
</SystemSurfaceLayer>
```

#### 5. SystemSurfaceLayer Update

Changed from `bottom: 0; height: auto` to `top: 0; width: 100%; height: 100%; pointer-events: none` — supports future left/right positioning.

#### 6. AppSwitcher Integration

AppSwitcher CSS updated with Fluent Valley tokens:
- `--fv-surface-elevated` for background
- `--fv-border-subtle` for borders
- `--fv-elevation-4` for shadow
- `fv-fade-in` and `fv-scale-in` animations
- Reduced motion support

All existing functionality preserved: keyboard navigation, context menu, focus management.

#### 7. StartMenu Integration

StartMenu remains fully functional inside the Taskbar. Legacy CSS classes (`.menu-layout`, `.app-tile`, `.menu-elm`, etc.) unchanged.

#### 8. Window Surface Changes

Added Fluent Valley elevation tokens to base `.window` class:
- Default: `--fv-elevation-2` (resting), `--fv-elevation-3` (active)
- OnerOS 2026: Same tokens with theme-specific shadow values
- Transition: `--fv-transition-normal` for smooth elevation changes

No changes to drag, resize, maximize, or WindowManager behavior.

#### 9. Fluent Valley Tokens Adopted

System surfaces use:
- `--fv-surface-glass` / `--fv-glass-blur` / `--fv-glass-border`
- `--fv-elevation-1` through `--fv-elevation-4`
- `--fv-border-subtle`
- `--fv-transition-fast` / `--fv-transition-normal`
- `--fv-duration-*` / `--fv-ease-*`

#### 10. Glass/Fallback Behavior

All system bars use `@supports (backdrop-filter: blur(1px))` pattern:
- Supported: translucent glass with blur
- Not supported: solid `--bg-primary` fallback

#### 11. Motion Implemented

- `fv-fade-in` — AppSwitcher overlay
- `fv-scale-in` — AppSwitcher panel
- `--fv-transition-fast` — button hover/press
- `--fv-transition-normal` — surface background transitions
- `prefers-reduced-motion: reduce` — all transitions/animations disabled

#### 12. Responsive Behavior

| Breakpoint | TopBar | BottomBar |
|------------|--------|-----------|
| > 768px | Full (weather + search + clock) | Full (menu + apps + clock) |
| ≤ 768px | Compact (no weather label, smaller search) | Compact (smaller icons) |
| ≤ 480px | Minimal (icon only weather, tiny search) | Minimal (smaller buttons) |
| ≤ 360px | Ultra-compact | Ultra-compact |
| Touch | Larger touch targets (44px min) | Larger touch targets (44px min) |

#### 13. Accessibility Changes

- All system bars have `role` and `aria-label`
- Menu button: `role="button"`, `aria-expanded`, `aria-label`
- App buttons: `aria-label` on each
- Search: `aria-label="Search"`
- Clock: `aria-label` with current time
- Focus-visible outlines on all interactive elements
- No hover-only functionality

#### 14. Future System Bar Positioning Readiness

- `SystemSurfaceLayer` spans full viewport (not just bottom)
- `ScreenEdge` type already defined in layout.types.ts
- `SystemLayoutPreferences` interface exists
- Bars use `position: fixed` — can be repositioned via CSS
- No deep coupling of Taskbar = bottom in the runtime

#### 15. Theme Constants Cleanup

Removed from `src/constants/index.ts`:
- `THEME_MODES` — was never imported anywhere
- `THEME_CLASSES` — was never imported anywhere
- `BODY_MODE_CLASSES` — was never imported anywhere

Single source of truth: `src/core/system/appearance/themeRegistry.ts`

#### 16. Bundle Size

| Metric | Phase 2 | Phase 3 | Delta |
|--------|---------|---------|-------|
| Main JS (gzip) | 626.0 kB | 626.9 kB | +0.9 kB |
| Main CSS (gzip) | 12.24 kB | 13.53 kB | +1.29 kB |

JS increase: TopBar component + DesktopRuntime changes.
CSS increase: `system-bars.css` (new), AppSwitcher token updates.

#### 17. Dependencies Added

**None.**

#### 18. Remaining Technical Debt

- Legacy `app.css` (1463 lines) still contains old Taskbar rules — functional but redundant with `system-bars.css`
- Weather surface is a placeholder (no real API)
- Search surface has no backend integration
- `BottomBar` component exists but is not rendered (Taskbar handles the bottom bar directly)
- Theme cycling in Taskbar still uses internal state — could migrate to appearance module fully

#### 19. Recommended Phase 4

- Implement real weather provider (extensible architecture)
- Connect search surface to actual search functionality
- Begin StartMenu visual evolution
- Consider BottomBar/Taskbar unification
- Add notification system to BottomBar right zone
- Migrate remaining legacy `app.css` rules to Fluent Valley tokens

---

### PHASE 4 — Surface System + Legacy CSS Migration + Window Visual Refinement

**Goal:** Reduce legacy dependency, enforce surface hierarchy, refine window visuals.

#### 1. Legacy CSS Audit

| Category | Lines | Description |
|----------|-------|-------------|
| ACTIVE | ~250 | Core window, loader, background, start menu, window states |
| COMPATIBILITY | ~600 | Legacy theme taskbar/window/menu styles (Win95, WinXP, macOS, Ubuntu) |
| DUPLICATE removed | ~185 | App switcher theme styles (now in themes.css + AppSwitcher.css) |
| DEAD removed | ~95 | search-bar, mobile-search-icon, taskbar-separator, .window.moved, .window.blocked, compatibility-error, fadeIn keyframe |

Legacy CSS: **1463 → 1059 lines** (-404 lines, -27.6%)

#### 2. CSS Files Migrated

No files were moved. Dead and duplicate selectors were removed from `legacy/app.css`. Active selectors remain in place.

#### 3. New System Style Additions

`system-bars.css` expanded with:
- Window surface tokens (semantic background, elevation, border, transitions)
- OnerOS 2026 window surface overrides
- Interaction consistency section (StartMenu, context menu, window action transitions)
- Window focus-visible ring
- `prefers-reduced-motion` for window transitions

#### 4. Selectors Removed

- `*` universal reset (duplicate of globals/reset.css)
- `body` base styles (duplicate of globals/base.css)
- `body.margin` (duplicate)
- `#os-background.opacity` (dead)
- `.taskbar-separator` base + all theme variants (dead — not in DOM)
- `.apps .search-bar input`, `.apps .mobile-search-icon` (dead)
- `.window.moved`, `.window.blocked` (dead)
- Empty `.actions .action-minimize`, `.actions .action-close` rules
- All `.app-switcher-overlay`, `.app-switcher`, `.app-switcher .app` base rules (duplicate)
- Win95/WinXP/macOS/Ubuntu `.app-switcher` theme rules (duplicate — in themes.css)
- `.app-switcher-icon`, `.close-switcher` (dead)
- `compatibility-error` (dead)
- `@keyframes fadeIn` (duplicate of `fv-fade-in`)
- Responsive `.app-switcher` rules in 640px query (duplicate)
- Dead `.search-bar`, `.mobile-search-icon`, `.mobile-hidden` responsive rules

#### 5. Compatibility Selectors Retained

All legacy theme taskbar/window/menu styles remain:
- `#os-taskbar.win95-theme` + children
- `#os-taskbar.winxp-theme` + children
- `#os-taskbar.macos-theme` + children
- `#os-taskbar.ubuntu-theme` + children
- `body.win95-mode .window` + children
- `body.winxp-mode .window` + children
- `body.macos-mode .window` + children
- `body.ubuntu-mode .window` + children
- StartMenu layout classes (`.menu-layout`, `.app-tile`, `.menu-elm`)

#### 6. Window Visual Changes

- **Background**: Uses `--fv-surface-elevated` semantic token
- **Border**: Uses `--fv-border-subtle` for inactive, `--color-accent` for active
- **Elevation**: `--fv-elevation-2` (resting) → `--fv-elevation-3` (active)
- **Title bar**: Uses `--fv-surface-elevated`, subtle bottom border
- **Transitions**: `--fv-transition-normal` for shadow, `--fv-transition-fast` for border
- **OnerOS 2026**: 12px radius, softer shadows, accent-colored active border
- WindowManager behavior: **untouched**

#### 7. Interaction Improvements

- StartMenu `.app-tile` and `.menu-elm`: background + color transitions
- Context menu items: background transition
- Window action buttons: background + scale(0.92) on press
- All transitions use `--fv-transition-fast`
- `prefers-reduced-motion: reduce` disables all transitions

#### 8. Theme Compatibility

All 7 themes verified functional:
- Modern (0): FV window tokens apply
- Centered (1): FV window tokens apply
- Win95 (2): Legacy window chrome overrides FV tokens
- WinXP (3): Legacy window chrome overrides FV tokens
- macOS (4): Legacy window chrome overrides FV tokens
- Ubuntu (5): Legacy window chrome overrides FV tokens
- OnerOS 2026 (6): FV window tokens with theme-specific values

#### 9. CSS Size Comparison

| Metric | Before (Phase 3) | After (Phase 4) | Delta |
|--------|-------------------|-----------------|-------|
| Legacy CSS lines | 1463 | 1059 | **-404 lines** |
| System CSS lines | 614 | 695 | +81 lines |
| Main CSS (gzip) | 13.53 kB | 12.93 kB | **-0.60 kB** |

#### 10. Bundle Size

| Metric | Phase 3 | Phase 4 | Delta |
|--------|---------|---------|-------|
| Main JS (gzip) | 626.9 kB | 626.9 kB | 0 |
| Main CSS (gzip) | 13.53 kB | 12.93 kB | **-0.60 kB** |

CSS decreased due to removal of dead/duplicate selectors.

#### 11. Warnings

**0 warnings.**

#### 12. Regressions

**None found.** All themes functional. Windows open/close/focus/drag/resize/maximize work. Taskbar, StartMenu, AppSwitcher, context menus all work. Mobile layout works.

#### 13. Remaining Technical Debt

- Legacy `app.css` still 1059 lines (compatibility layer for themes)
- Weather/Search surfaces are placeholders
- `BottomBar` component exists but Taskbar handles bottom bar directly
- Theme cycling still uses Taskbar internal state

#### 14. Recommended Phase 5

- StartMenu visual evolution
- Search backend integration
- Real weather provider
- Notification system
- BottomBar/Taskbar unification
- Further legacy CSS reduction as themes are modernized

---

### PHASE 5 — Taskbar & Window Experience

**Goal:** Improve desktop experience — taskbar states, window transitions, microinteractions.

#### 1. Taskbar State Derivation
- `taskbarState.ts` — derives app state from WindowManager data (no duplicate state)
- `deriveTaskbarStates()` groups windows by `appId`, computes `isOpen`/`isFocused`/`isMinimized`/`windowCount`
- `getBestWindowForApp()` finds best window for focus/restore

#### 2. Taskbar Visual States
- `--open`: subtle background
- `--focused`: accent underline indicator
- `--minimized`: dimmed + gray underline

#### 3. Window Transitions
- **Open**: `scale(0.96) + opacity 0` → `scale(1) + opacity 1` (200ms)
- **Close**: `scale(1) + opacity 1` → `scale(0.96) + opacity 0` (100ms) + `pointer-events: none`
- **Minimize**: `scale(0.8) + translateY(20px) + opacity 0` (100ms)
- **Restore**: `scale(0.8) + translateY(20px) + opacity 0` → `scale(1) + opacity 1` (200ms)

#### 4. Motion Tokens
All reused: `--fv-duration-fast/normal`, `--fv-ease-standard/decelerate/accelerate`. No new tokens.

#### 5. Reduced Motion
`prefers-reduced-motion: reduce` disables all transitions and animations.

#### 6. Bundle Size
| Metric | Phase 4 | Phase 5 | Delta |
|--------|---------|---------|-------|
| JS (gzip) | 626.9 kB | 641.4 kB | +14.5 kB |
| CSS (gzip) | 12.93 kB | 13.2 kB | +0.27 kB |

---

### PHASE 6 — Application Identity & Taskbar Personalization

**Goal:** Connect App Registry metadata to Taskbar, icon resolver, pinned apps, race condition fix.

#### 1. Icon Resolution Architecture
- `src/core/apps/iconResolver.ts` — single source of truth for icon mapping
- `resolveAppIcon(iconString)` → FontAwesome `IconProp`
- Used by Taskbar, AppSwitcher, and any future consumer
- Safe fallback for unknown icons

#### 2. AppManifest Changes
- No type changes needed — all 12 apps already have `icon` field in registry

#### 3. Applications with Icon Mappings
| App | Icon |
|-----|------|
| Settings | fa-gear |
| Personalization | fa-palette |
| Google | fa-globe |
| Facebook | fa-facebook |
| Bing | fa-magnifying-glass |
| Calculator | fa-calculator |
| MPlayer | fa-music |
| Linux Mode | fa-terminal |
| DevZone | fa-code |
| WinSync | fa-rotate |
| KDialer | fa-phone |
| Tools | fa-screwdriver-wrench |

#### 4. Pinned App Architecture
- `src/core/system/preferences/taskbarPreferences.ts`
- `DEFAULT_PINNED_APPS`: `['google', 'facebook', 'bing']`
- `loadPinnedApps()` / `savePinnedApps()` / `validatePinnedApps()`
- `pinApp()` / `unpinApp()` / `isPinned()`
- Validation: removes unknown IDs, duplicates, preserves order, fallback to defaults
- Persisted in `localStorage` via `os_pinned_apps` key

#### 5. Taskbar Integration
- Loads pinned apps from preferences module
- Resolves icons from App Registry via iconResolver
- Each window instance rendered as individual button (not grouped by app)
- Open non-pinned apps also appear as individual buttons

#### 6. AppSwitcher Integration
- Replaced local `ICON_MAP` with shared `iconResolver`
- Resolves icons from `window.icon` or AppRegistry
- Filters out closing windows (`isClosing`)
- Context menu: app icon in title + "Switch to this app" / "Move Window" / "Close app"

#### 7. StartMenu Integration
- Still uses hardcoded tiles (planned for Phase 7)
- Icons remain hardcoded per-tile

#### 8. Multi-Window UX
- Every window instance renders as its own taskbar button
- Each button shows its specific window state (focused/minimized/open)
- `windowCount` no longer used for visual grouping

#### 9. Race Condition Fix
- Added `isClosing` to `WindowData` type
- `closeWindow()` marks window as `isClosing: true` first, removes after 120ms
- Single-instance lookup excludes `isClosing` windows
- Prevents ghost windows during rapid close/reopen

#### 10. Taskbar Context Menu
- Right-click any taskbar icon shows context menu
- App icon + name in title
- "Open new instance" / "Close app"
- Positioned above taskbar (`bottom: 52px`)

#### 11. Iframe Click Blocking
- Inactive windows show transparent click blocker overlay (`z-index: 10`)
- First click focuses the window, second click goes to iframe
- Header bar (title, close/min/max) always clickable (`z-index: 11`)
- `isActive = windowData.isFocused === true` — only explicitly focused windows allow iframe clicks

#### 12. Bundle Size
| Metric | Phase 5 | Phase 6 | Delta |
|--------|---------|---------|-------|
| JS (gzip) | 641.4 kB | 643.5 kB | +2.1 kB |
| CSS (gzip) | 13.2 kB | 13.4 kB | +0.2 kB |

#### 13. Dependencies Added
**None.**

#### 14. Remaining Technical Debt
- StartMenu still hardcoded (not using App Registry)
- No drag-to-reorder pinned apps
- Weather/Search surfaces are placeholders
- Theme cycling still uses Taskbar internal state
- BottomBar component exists but unused

#### 15. Recommended Phase 7
- StartMenu visual evolution using App Registry
- Per-app icon in StartMenu tiles
- Drag-to-reorder pinned apps
- Search backend integration
- Real weather provider
- Notification system

---

### PHASE 7 — StartMenu, Search, Weather & Notifications

**Goal:** Replace legacy system surfaces with modern Fluent Valley components.

#### 1. StartMenu Architecture
- Rewritten with App Registry integration — no hardcoded app list
- `getAllApps()` → display all registered apps with resolved icons
- Built-in search bar with keyboard navigation
- Footer: Personalization / Settings / Power
- Glass surface with `--fv-surface-glass` tokens

#### 2. Search Architecture
- `src/core/system/search/` — types, utils, index
- `searchSystem(query, openWindow) → SearchResult[]`
- Searches App Registry by name, description, category, id
- TopBar SearchSurface uses real search with dropdown results
- Keyboard: ArrowUp/Down/Enter/Escape
- Future-ready for commands, files, settings

#### 3. Weather Provider
- `src/core/system/weather/` — types, service, index
- `WeatherProvider` interface (swappable)
- `WeatherService` with localStorage caching (30min TTL)
- Graceful fallback: time-based weather display
- No API keys in code

#### 4. Notification Architecture
- `src/core/system/notifications/` — types, store, components
- Store: `subscribeNotifications()`, `notify()`, `dismissNotification()`, `clearNotifications()`
- Reactive subscriber pattern (no external state library)
- `NotificationBell` in Taskbar with unread badge
- `NotificationPanel`: glass surface, dismiss, clear all, empty state
- Type icons: info/success/warning/error

#### 5. Bundle Size
| Metric | Phase 6 | Phase 7 | Delta |
|--------|---------|---------|-------|
| JS (gzip) | 643.5 kB | 644.9 kB | +1.4 kB |
| CSS (gzip) | 13.4 kB | 14.8 kB | +1.4 kB |

#### 6. Dependencies Added: **None**

#### 7. Build Result: **SUCCESS — 0 warnings**

#### 8. Recommended Phase 8
- Real weather API integration
- Drag-to-reorder pinned apps
- User-configurable StartMenu pins
- Desktop widget system
- System command palette
- Multi-monitor support
