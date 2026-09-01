# Legacy Code

This directory contains code that has not yet been migrated to the v3.0 architecture.

## Contents

- `src/OS/` - Original OS components (taskbar, background, bootloader, etc.)
- `src/pages/` - Original application components
- `src/app.js` - Original root App component
- `src/app.css` - Re-exports from `src/styles/legacy/app.css`

## Migration Notes

These files will be gradually migrated to:
- `src/core/` - System-level components
- `src/features/` - User-facing features
- `src/apps/` - Individual applications
- `src/styles/` - Organized CSS

Do not add new features to legacy code. Use the new architecture for all new development.
