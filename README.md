# OnerOS - One OS For Your Devices
### Web Preview v3.1.0

A web-based desktop environment with window management, themed apps, and a modular architecture.

## Features

- **Window Manager** — Open, close, focus, drag, resize, and maximize application windows
- **Application Registry** — Centralized app manifests with lazy loading and single-instance support
- **7 Themes** — Modern, Centered, Win95, WinXP, macOS, Ubuntu, OnerOS 2026 — all apps respond dynamically
- **Accent Colors** — User-configurable accent that propagates to every internal app
- **Wallpaper System** — Default wallpaper or solid color background
- **System Surfaces** — Taskbar, Start Menu, Clock, App Switcher with context menus
- **Responsive** — Works on desktop, tablet, and mobile with fixed taskbar on touch devices
- **Internal Apps** — Settings, Personalization, Tools, DevZone, Linux Mode, MPlayer, WinSync, KDialer

## Architecture

```
src/
├── apps/              # Internal application implementations
├── components/        # Shared UI primitives and SystemAlert
├── core/
│   ├── apps/          # Application Registry (AppManifest, singleInstance, lazy loading)
│   ├── desktop/       # DesktopRuntime, layer system (Background, Window, SystemSurface, Overlay)
│   ├── system/        # Surfaces (Taskbar, StartMenu, Clock, AppSwitcher) + layout types
│   └── windowManager/ # Window primitive, WindowManager (central state), window lifecycle
├── styles/            # Design tokens (CSS vars), globals, themes, responsive rules
└── hooks/             # Shared hooks
```

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
```

Produces an optimized production build in the `build/` folder.

## Tech Stack

- React 18 + React Router v6
- TypeScript (core modules) + JavaScript (apps)
- FontAwesome icons
- Interact.js (window drag/resize)
- Vite-compatible architecture
- Code splitting with React.lazy for non-critical apps

## License

[GPL-3.0](LICENSE)

## Author

[Klubuntu](https://klubuntu.eu.org/) — OnerOS Project
