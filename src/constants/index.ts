export const WINDOW_DEFAULTS = {
  MIN_WIDTH: 152,
  MIN_HEIGHT: 170,
  DEFAULT_WIDTH: 520,
  DEFAULT_HEIGHT: 500,
  BORDER_WIDTH: 6,
  Z_BASE: 100,
  Z_MAX: 5000,
} as const;

export const OS_EVENTS = {
  RELOAD: 'os:reload',
  RELOAD_COMPLETE: 'os:reload_complete',
  OPEN_MENU: 'os:open_menu',
  APP_RUN: 'os:app_run',
} as const;

export const STORAGE_KEYS = {
  THEME: 'os_theme',
  WALLPAPER_TYPE: 'os_wallpaper_type',
  WALLPAPER_COLOR: 'os_wallpaper_color',
  ACCENT_COLOR: 'os_accent_color',
  LINUXMODE_HISTORY: 'linuxmode_shell_history',
  KDIALER_CONTACTS: 'kdialer_contacts',
  KDIALER_RECENT: 'kdialer_recent',
  MPLAYER_PLAYLIST: 'mplayer_playlist',
  DEVZONE_SNIPPETS: 'devzone_snippets',
  WINSYNC_CLIPBOARD: 'winsync_clipboard_history',
  WINSYNC_FILES: 'winsync_file_transfers',
  WINSYNC_SHARES: 'winsync_shared_items',
  WINSYNC_LINKS: 'winsync_short_links',
  WINSYNC_NOTES: 'winsync_notes',
  TOOLSAPP_CLIPBOARD: 'toolsapp_clipboard',
  TOOLSAPP_NOTES: 'toolsapp_notes',
  TOOLSAPP_RECORDINGS: 'toolsapp_recordings',
  TOOLSAPP_COLORS: 'toolsapp_colors',
} as const;

export const BOOT_DURATION_MS = 3000;
