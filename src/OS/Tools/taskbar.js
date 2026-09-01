// Compatibility bridge - re-exports from v3.0 architecture
// This file maintains backwards compatibility for existing imports.
// app.js imports: import Taskbar from "./OS/Tools/taskbar"
export { Taskbar as default } from '../../core/system/surfaces/Taskbar';
