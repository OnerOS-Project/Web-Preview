import React, { useState, useEffect, useRef } from 'react';
import './linuxmode.css';

function LinuxMode() {
  const [history, setHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/');
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  const fileSystem = {
    '/': {
      type: 'dir',
      contents: ['home', 'etc', 'var', 'usr', 'bin', 'readme.txt']
    },
    '/home': {
      type: 'dir',
      contents: ['readme.txt']
    },
    '/etc': {
      type: 'dir',
      protected: true
    },
    '/var': {
      type: 'dir',
      protected: true
    },
    '/usr': {
      type: 'dir',
      protected: true
    },
    '/bin': {
      type: 'dir',
      contents: ['linuxshell']
    },
    '/readme.txt': {
      type: 'file',
      content: 'Welcome to OnerOS Linux Mode!\nThis is a simulated Linux terminal.'
    },
    '/home/readme.txt': {
      type: 'file',
      content: 'To jest home space uzytkownika'
    }
  };

  useEffect(() => {
    setHistory([
      { type: 'info', content: 'OnerOS Linux Mode Terminal v1.0' },
      { type: 'info', content: 'Type "help" for available commands.' },
      { type: 'info', content: '' }
    ]);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getPrompt = () => {
    return `user@oneros.in ${currentPath}$`;
  };

  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add to command history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Add command to display history
    setHistory(prev => [...prev, { type: 'command', content: `${getPrompt()} ${trimmedCmd}` }]);

    const args = trimmedCmd.split(' ');
    const command = args[0].toLowerCase();

    let output = '';

    switch (command) {
      case 'help':
        output = `Available commands:
    help          - Show this help message
    clear         - Clear the terminal
    ls            - List directory contents
    pwd           - Print working directory
    cd [dir]      - Change directory
    cat [file]    - Display file contents
    echo [text]   - Display text
    whoami        - Display current user
    date          - Display current date and time
    uname         - Display system information
    hostname      - Display hostname
    neofetch      - Display system information (stylized)
    mkdir [dir]   - Create directory (simulated)
    touch [file]  - Create file (simulated)
    rm [file]     - Remove file (simulated)
    os-settings get [key]       - Get system setting
    os-settings set [key] [val] - Set system setting
    exit          - Close terminal window

    System settings:
    wallpaper_type    - 'default' or 'color'
    wallpaper_color   - Hex color code (e.g., #1a5743)
    accent_color      - Hex color code (e.g., #47b895)`;
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'ls':
        const dirInfo = fileSystem[currentPath];
        if (dirInfo && dirInfo.type === 'dir') {
          if (dirInfo.protected) {
            output = 'ERROR: Invalid permission - protected content';
          } else if (dirInfo.contents) {
            output = dirInfo.contents.join('  ');
          } else {
            output = '';
          }  
        }
        break;
      case 'cd':
        if (args.length < 2) {
          setCurrentPath('/home');
          output = '';
        } else if (args[1] === '..') {
          if (currentPath === '/') {
            output = '';
          } else {
            const parts = currentPath.split('/').filter(p => p);
            parts.pop();
            const newPath = '/' + parts.join('/');
            setCurrentPath(newPath === '' ? '/' : newPath);
            output = '';
          }
        } else if (args[1] === '/') {
          setCurrentPath('/');
          output = '';
        } else if (args[1] === '~') {
          setCurrentPath('/home');
          output = '';
        } else {
          let newPath;
          if (args[1].startsWith('/')) {
            newPath = args[1];
          } else {
            newPath = currentPath === '/' ? `/${args[1]}` : `${currentPath}/${args[1]}`;
          }
          newPath = newPath.replace(/\/+/g, '/');
          
          // Check if directory exists
          if (fileSystem[newPath] && fileSystem[newPath].type === 'dir') {
            setCurrentPath(newPath);
            output = '';
          } else {
            output = `cd: ${args[1]}: No such file or directory`;
          }
        }
        break;

      case 'cat':
        if (args.length < 2) {
          output = 'cat: missing file operand';
        } else {
          output = args[1] === 'readme.txt' 
            ? 'Welcome to OnerOS Linux Mode!\nThis is a simulated Linux terminal.'
            : `cat: ${args[1]}: No such file or directory`;
        }
        break;

      case 'echo':
        output = args.slice(1).join(' ');
        break;

      case 'whoami':
        output = 'user';
        break;

      case 'date':
        output = new Date().toString();
        break;

      case 'uname':
        const flag = args[1];
        if (flag === '-a') {
          output = 'OnerOS 1.0.0 Web-Preview x86_64 GNU/Linux';
        } else if (flag === '-r') {
          output = '1.0.0';
        } else {
          output = 'OnerOS';
        }
        break;

      case 'hostname':
        output = 'oneros.in';
        break;

      case 'neofetch':
        output = `
     ██████╗ ███╗   ██╗███████╗██████╗  ██████╗ ███████╗
    ██╔═══██╗████╗  ██║██╔════╝██╔══██╗██╔═══██╗██╔════╝
    ██║   ██║██╔██╗ ██║█████╗  ██████╔╝██║   ██║███████╗
    ██║   ██║██║╚██╗██║██╔══╝  ██╔══██╗██║   ██║╚════██║
    ╚██████╔╝██║ ╚████║███████╗██║  ██║╚██████╔╝███████║
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝

    user@oneros.in
    ─────────────────────────────
    OS: OnerOS Web Preview
    Host: Browser Environment
    Kernel: 1.0.0-web
    Uptime: ${Math.floor(performance.now() / 1000 / 60)} minutes
    Shell: oneros-shell
    Terminal: oneros-terminal
    CPU: Web Worker
    Memory: ${navigator.deviceMemory || 'Unknown'} GB`;
        break;

      case 'mkdir':
        if (args.length < 2) {
          output = 'mkdir: missing operand';
        } else {
          output = `mkdir: created directory '${args[1]}'`;
        }
        break;

      case 'touch':
        if (args.length < 2) {
          output = 'touch: missing file operand';
        } else {
          output = `touch: created file '${args[1]}'`;
        }
        break;

      case 'rm':
        if (args.length < 2) {
          output = 'rm: missing operand';
        } else {
          output = `rm: removed '${args[1]}'`;
        }
        break;

      case 'exit':
        output = 'Closing terminal...';
        setTimeout(() => {
          const closeBtn = document.querySelector('.window .actions div:last-child');
          closeBtn?.click();
        }, 500);
        break;

      case 'os-settings':
        if (args.length < 2) {
          output = 'os-settings: missing subcommand\nUsage: os-settings get [key] | os-settings set [key] [value]';
        } else if (args[1] === 'get') {
          if (args.length < 3) {
            output = 'os-settings get: missing key\nUsage: os-settings get [key]';
          } else {
            const key = args[2];
            let storageKey;
            switch (key) {
              case 'wallpaper_type':
                storageKey = 'os_wallpaper_type';
                break;
              case 'wallpaper_color':
                storageKey = 'os_wallpaper_color';
                break;
              case 'accent_color':
                storageKey = 'os_accent_color';
                break;
              default:
                output = `os-settings: unknown key '${key}'\nAvailable keys: wallpaper_type, wallpaper_color, accent_color`;
                break;
            }
            if (storageKey) {
              const value = localStorage.getItem(storageKey) || 'not set';
              output = `${key} = ${value}`;
            }
          }
        } else if (args[1] === 'set') {
          if (args.length < 4) {
            output = 'os-settings set: missing key or value\nUsage: os-settings set [key] [value]';
          } else {
            const key = args[2];
            const value = args[3];
            let storageKey;
            let isValid = true;

            switch (key) {
              case 'wallpaper_type':
                if (value !== 'default' && value !== 'color') {
                  output = `os-settings: invalid value for wallpaper_type\nValid values: default, color`;
                  isValid = false;
                } else {
                  storageKey = 'os_wallpaper_type';
                }
                break;
              case 'wallpaper_color':
                if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                  output = `os-settings: invalid hex color format\nExample: #1a5743`;
                  isValid = false;
                } else {
                  storageKey = 'os_wallpaper_color';
                }
                break;
              case 'accent_color':
                if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                  output = `os-settings: invalid hex color format\nExample: #47b895`;
                  isValid = false;
                } else {
                  storageKey = 'os_accent_color';
                }
                break;
              default:
                output = `os-settings: unknown key '${key}'\nAvailable keys: wallpaper_type, wallpaper_color, accent_color`;
                isValid = false;
                break;
            }

            if (isValid && storageKey) {
              localStorage.setItem(storageKey, value);
              output = `${key} set to ${value}\nReload the page or use Personalization app to apply changes.`;
              
              // Apply settings immediately
              if (key === 'wallpaper_type' || key === 'wallpaper_color') {
                const background = document.getElementById('os-background');
                if (background) {
                  if (key === 'wallpaper_type' && value === 'default') {
                    background.style.backgroundImage = 'url("/public/img/Wallpaper.webp")';
                    background.style.backgroundColor = '';
                  } else if (key === 'wallpaper_type' && value === 'color') {
                    const color = localStorage.getItem('os_wallpaper_color') || '#1a5743';
                    background.style.backgroundImage = 'none';
                    background.style.backgroundColor = color;
                  } else if (key === 'wallpaper_color') {
                    const wallpaperType = localStorage.getItem('os_wallpaper_type');
                    if (wallpaperType === 'color') {
                      background.style.backgroundImage = 'none';
                      background.style.backgroundColor = value;
                    }
                  }
                }
              } else if (key === 'accent_color') {
                const existingStyle = document.getElementById('custom-accent-style');
                if (existingStyle) {
                  existingStyle.remove();
                }
                const style = document.createElement('style');
                style.id = 'custom-accent-style';
                style.innerHTML = `
                  .window.active .border-window {
                    border-color: ${value} !important;
                  }
                  .window.active .draggable-window {
                    background-color: ${value} !important;
                  }
                  .menu-square {
                    background-color: ${value} !important;
                  }
                  #os-taskbar {
                    border-top-color: ${value} !important;
                  }
                  .apps .search-bar input {
                    border-color: ${value} !important;
                  }
                  .personalization-header {
                    border-bottom-color: ${value} !important;
                  }
                  .personalization-header h2 {
                    color: ${value} !important;
                  }
                  .personalization-section h3 {
                    color: ${value} !important;
                  }
                  .apps .search-bar input:focus {
                    border-color: ${value} !important;
                  }
                  .color-input-wrapper input[type="color"] {
                    border-color: ${value} !important;
                  }
                  .color-text-input {
                    border-color: ${value} !important;
                  }
                  .preview-box {
                    border-color: ${value} !important;
                  }
                  .btn-primary {
                    background-color: ${value} !important;
                  }
                  .btn-primary:hover {
                    background-color: ${value} !important;
                    filter: brightness(1.2);
                  }
                `;
                document.head.appendChild(style);
              }
            }
          }
        } else {
          output = `os-settings: unknown subcommand '${args[1]}'\nUsage: os-settings get [key] | os-settings set [key] [value]`;
        }
        break;

      case 'os-event':
        if (args.length < 2) {
          output = 'os-event: missing subcommand\nUsage: os-event debug list | os-event debug run [event]';
        } else if (args[1] === 'debug') {
          if (args.length < 3) {
            output = 'os-event debug: missing command\nUsage: os-event debug list | os-event debug run [event]';
          } else if (args[2] === 'list') {
            output = `Available system events:
  os:reload          - Notifies components that system reload started
  os:reload_complete - Notifies components that system reload completed
  os:open_menu       - Opens the start menu

Usage: os-event debug run [event]
Example: os-event debug run os:reload`;
          } else if (args[2] === 'run') {
            if (args.length < 4) {
              output = 'os-event debug run: missing event name\nUsage: os-event debug run [event]';
            } else {
              const eventName = args[3];
              const validEvents = ['os:reload', 'os:reload_complete', 'os:open_menu'];
              
              if (validEvents.includes(eventName)) {
                try {
                  window.dispatchEvent(new CustomEvent(eventName));
                  output = `Event '${eventName}' dispatched successfully`;
                } catch (error) {
                  output = `Error dispatching event '${eventName}': ${error.message}`;
                }
              } else {
                output = `os-event: unknown event '${eventName}'\nAvailable events: ${validEvents.join(', ')}`;
              }
            }
          } else {
            output = `os-event debug: unknown command '${args[2]}'\nUsage: os-event debug list | os-event debug run [event]`;
          }
        } else {
          output = `os-event: unknown subcommand '${args[1]}'\nUsage: os-event debug list | os-event debug run [event]`;
        }
        break;

      default:
        output = `${command}: command not found`;
        break;
    }

    if (output) {
      setHistory(prev => [...prev, { type: 'output', content: output }]);
    }

    setCurrentCommand('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion for commands
      const commands = ['help', 'clear', 'ls', 'pwd', 'cd', 'cat', 'echo', 'whoami', 'date', 'uname', 'hostname', 'neofetch', 'mkdir', 'touch', 'rm', 'exit'];
      const matches = commands.filter(cmd => cmd.startsWith(currentCommand));
      if (matches.length === 1) {
        setCurrentCommand(matches[0]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="linux-mode-terminal" onClick={handleTerminalClick}>
      <div className="terminal-header">
        <span className="terminal-title">user@oneros.in: ~</span>
      </div>
      <div className="terminal-body">
        {history.map((entry, index) => (
          <div key={index} className={`terminal-line ${entry.type}`}>
            <pre>{entry.content}</pre>
          </div>
        ))}
        <div className="terminal-input-line">
          <span className="terminal-prompt">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default LinuxMode;
