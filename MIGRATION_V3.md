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

**Component Decomposition + App Registry Enhancement:**
- Move `src/OS/Tools/menuStart.js` → `src/core/system/bottombar/StartMenu.tsx`
- Move `src/OS/Tools/time.js` → `src/core/system/bottombar/Clock.tsx`
- Move `src/OS/Tools/taskbar/appSwitcher.tsx` → `src/core/system/bottombar/AppSwitcher.tsx`
- Enhance app registry with metadata (icon, category, description)
- Add lazy loading for app components
- Prepare for future TopBar/BottomBar separation

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
