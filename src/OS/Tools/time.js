// Compatibility bridge - re-exports from v3.0 architecture
// This file maintains backwards compatibility for existing imports.
// taskbar.js imports: import Clock from "./time"
export { Clock as default } from '../../core/system/surfaces/Clock';
