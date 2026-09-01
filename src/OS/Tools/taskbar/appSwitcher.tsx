// Compatibility bridge - re-exports from v3.0 architecture
// This file maintains backwards compatibility for existing imports.
// taskbar.js imports: import AppSwitcher from './taskbar/appSwitcher.tsx'
export { AppSwitcher as default } from '../../../core/system/surfaces/AppSwitcher';
