import React, { useState, useEffect, useRef } from 'react';
import './linuxmode.css';

function LinuxMode() {
  const [history, setHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/');
  const [cmatrixInterval, setCmatrixInterval] = useState(null);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  const fileSystem = {
    '/': {
      type: 'dir',
      contents: ['home', 'etc', 'var', 'usr', 'bin', 'readme.txt']
    },
    '/home': {
      type: 'dir',
      contents: ['readme.txt', '.shell_history']
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
    },
    '/home/.shell_history': {
      type: 'file',
      content: '',
      hidden: true
    }
  };

  useEffect(() => {
    // Load command history from localStorage
    const savedHistory = localStorage.getItem('linuxmode_shell_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setCommandHistory(parsed);
      } catch (e) {
        console.error('Failed to load shell history:', e);
      }
    }

    setHistory([
      { type: 'info', content: 'OnerOS Linux Mode Terminal v1.0' },
      { type: 'info', content: 'Type "help" for available commands.' },
      { type: 'info', content: '' }
    ]);

    // Cleanup cmatrix on unmount
    return () => {
      if (cmatrixInterval) {
        clearInterval(cmatrixInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Add to command history and save to localStorage
    const updatedHistory = [...commandHistory, trimmedCmd];
    setCommandHistory(updatedHistory);
    localStorage.setItem('linuxmode_shell_history', JSON.stringify(updatedHistory));
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
    man [cmd]     - Display manual for command
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
    toilet [text] - Generate ASCII art text
    cmatrix       - The Matrix effect (Ctrl+C to stop)
    os-settings get [key]       - Get system setting
    os-settings set [key] [val] - Set system setting
    os-event debug list         - List all system events
    os-event debug run [event]  - Dispatch system event
    os-app list                 - List all available apps
    os-app run [app_name]       - Launch an application
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
            // Filter out hidden files unless -a flag is present
            const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
            const contents = showHidden 
              ? dirInfo.contents 
              : dirInfo.contents.filter(name => !name.startsWith('.'));
            output = contents.join('  ');
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

      case 'man':
        if (args.length < 2) {
          output = 'What manual page do you want?\nUsage: man [command]';
        } else {
          const manCmd = args[1].toLowerCase();
          const manPages = {
            'ls': `NAME
    ls - list directory contents

SYNOPSIS
    ls [OPTION]...

DESCRIPTION
    List information about files and directories.

OPTIONS
    -a     Show hidden files (starting with .)

EXAMPLES
    ls         List files in current directory
    ls -a      List all files including hidden`,

            'cd': `NAME
    cd - change directory

SYNOPSIS
    cd [DIRECTORY]

DESCRIPTION
    Change the current working directory.

ARGUMENTS
    /      Root directory
    ~      Home directory
    ..     Parent directory
    [dir]  Named directory

EXAMPLES
    cd /home    Change to /home
    cd ..       Go up one directory`,

            'cat': `NAME
    cat - concatenate and display files

SYNOPSIS
    cat [FILE]...

DESCRIPTION
    Display contents of files.

EXAMPLES
    cat readme.txt           Display file
    cat /home/.shell_history View command history`,

            'rm': `NAME
    rm - remove files

SYNOPSIS
    rm [FILE]...

DESCRIPTION
    Remove (delete) files.

WARNING
    Removing /home/.shell_history will clear command history.

EXAMPLES
    rm file.txt              Remove file
    rm /home/.shell_history  Clear command history`,

            'toilet': `NAME
    toilet - ASCII art text generator

SYNOPSIS
    toilet [OPTIONS] [TEXT]

DESCRIPTION
    Generate ASCII art from text with various styles.

OPTIONS
    -f font    Font style (standard, small, banner, block)
    --metal    Metal effect
    --gay      Rainbow colors

EXAMPLES
    toilet Hello
    toilet -f banner OnerOS
    toilet -f block --metal Linux
    toilet --gay Rainbow Text`,

            'cmatrix': `NAME
    cmatrix - Matrix effect in terminal

SYNOPSIS
    cmatrix

DESCRIPTION
    Display the Matrix digital rain effect.
    Press Ctrl+C to stop the animation.

EXAMPLES
    cmatrix    Start the Matrix effect`,

            'os-app': `NAME
    os-app - application launcher

SYNOPSIS
    os-app list
    os-app run [APP_NAME]

DESCRIPTION
    Launch and manage OnerOS applications.

COMMANDS
    list       Show available applications
    run        Launch an application

EXAMPLES
    os-app list
    os-app run devzone
    os-app run winsync`,

            'os-settings': `NAME
    os-settings - system settings manager

SYNOPSIS
    os-settings get [KEY]
    os-settings set [KEY] [VALUE]

DESCRIPTION
    Get and set system configuration.

SETTINGS
    wallpaper_type     Background type (default/color)
    wallpaper_color    Background color (#hex)
    accent_color       Theme accent color (#hex)

EXAMPLES
    os-settings get accent_color
    os-settings set accent_color #47b895`,

            'help': `NAME
    help - display available commands

SYNOPSIS
    help

DESCRIPTION
    Show a list of all available terminal commands.`,

            'clear': `NAME
    clear - clear the terminal screen

SYNOPSIS
    clear

DESCRIPTION
    Clear all output from the terminal display.`,

            'pwd': `NAME
    pwd - print working directory

SYNOPSIS
    pwd

DESCRIPTION
    Display the current directory path.`,

            'echo': `NAME
    echo - display text

SYNOPSIS
    echo [TEXT]...

DESCRIPTION
    Display text or variables to the terminal.

EXAMPLES
    echo Hello World
    echo "Multiple words"`,

            'whoami': `NAME
    whoami - display current user

SYNOPSIS
    whoami

DESCRIPTION
    Print the username of the current user.`,

            'date': `NAME
    date - display date and time

SYNOPSIS
    date

DESCRIPTION
    Display current system date and time.`,

            'neofetch': `NAME
    neofetch - system information display

SYNOPSIS
    neofetch

DESCRIPTION
    Display system information with ASCII art logo.`
          };

          if (manPages[manCmd]) {
            output = manPages[manCmd];
          } else {
            output = `No manual entry for ${manCmd}\nTry 'man help' for available pages`;
          }
        }
        break;

      case 'toilet':
        if (args.length < 2) {
          output = 'Usage: toilet [options] text\nTry: toilet Hello, toilet -f banner Text, toilet --metal Cool';
        } else {
          const text = args.filter(a => !a.startsWith('-')).slice(1).join(' ') || args[args.length - 1];
          const hasBanner = args.includes('-f') && args[args.indexOf('-f') + 1] === 'banner';
          const hasBlock = args.includes('-f') && args[args.indexOf('-f') + 1] === 'block';
          const hasSmall = args.includes('-f') && args[args.indexOf('-f') + 1] === 'small';
          const hasMetal = args.includes('--metal');
          const hasGay = args.includes('--gay');
          
          let asciiArt = '';
          
          if (hasBanner) {
            // Banner style - large block letters
            const chars = text.toUpperCase().split('');
            asciiArt = chars.map(char => {
              switch(char) {
                case 'O': return '  ██████╗ \n ██╔═══██╗\n ██║   ██║\n ██║   ██║\n ╚██████╔╝\n  ╚═════╝ ';
                case 'N': return ' ███╗   ██╗\n ████╗  ██║\n ██╔██╗ ██║\n ██║╚██╗██║\n ██║ ╚████║\n ╚═╝  ╚═══╝';
                case 'E': return ' ███████╗\n ██╔════╝\n █████╗  \n ██╔══╝  \n ███████╗\n ╚══════╝';
                case 'R': return ' ██████╗ \n ██╔══██╗\n ██████╔╝\n ██╔══██╗\n ██║  ██║\n ╚═╝  ╚═╝';
                case 'S': return ' ███████╗\n ██╔════╝\n ███████╗\n ╚════██║\n ███████║\n ╚══════╝';
                case 'L': return ' ██╗     \n ██║     \n ██║     \n ██║     \n ███████╗\n ╚══════╝';
                case 'I': return ' ██╗\n ██║\n ██║\n ██║\n ██║\n ╚═╝';
                case 'X': return ' ██╗  ██╗\n ╚██╗██╔╝\n  ╚███╔╝ \n  ██╔██╗ \n ██╔╝ ██╗\n ╚═╝  ╚═╝';
                case ' ': return '     \n     \n     \n     \n     \n     ';
                default: return ` ${char}  \n ${char}  \n ${char}  \n ${char}  \n ${char}  \n    `;
              }
            }).join('  ');
          } else if (hasBlock) {
            // Block style
            asciiArt = `
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 █ ${text.padEnd(18)} █
 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`;
          } else if (hasSmall) {
            // Small style
            asciiArt = `_${text}_`;
          } else {
            // Standard style
            asciiArt = `
 _____ _____ _____ _____ 
|     |     |     |     |
|  ${text.padEnd(20)}  |
|_____|_____|_____|_____|`;
          }
          
          // Store with color if metal or gay flag is set
          if (hasMetal || hasGay) {
            setHistory(prev => [...prev, { 
              type: 'output', 
              content: asciiArt,
              color: hasMetal ? '#888888' : '#ff00ff'
            }]);
            output = '';
          } else {
            output = asciiArt;
          }
        }
        break;

      case 'cmatrix':
        // Clear any existing cmatrix
        if (cmatrixInterval) {
          clearInterval(cmatrixInterval);
          setCmatrixInterval(null);
        }
        
        output = 'Starting Matrix... Press Ctrl+C to stop\n';
        setHistory(prev => [...prev, { type: 'output', content: output, color: '#00ff00' }]);
        
        const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        let matrixLines = 0;
        
        const interval = setInterval(() => {
          if (matrixLines >= 15) {
            clearInterval(interval);
            setCmatrixInterval(null);
            return;
          }
          
          let line = '';
          for (let i = 0; i < 60; i++) {
            line += matrixChars[Math.floor(Math.random() * matrixChars.length)] + ' ';
          }
          
          setHistory(prev => [...prev, { 
            type: 'output', 
            content: line,
            color: '#00ff00'
          }]);
          
          matrixLines++;
        }, 100);
        
        setCmatrixInterval(interval);
        // Don't set output, we already added to history
        output = '';
        break;

      case 'cat':
        if (args.length < 2) {
          output = 'cat: missing file operand';
        } else {
          const fileName = args[1];
          let filePath;
          
          // Determine full path
          if (fileName.startsWith('/')) {
            filePath = fileName;
          } else {
            filePath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
          }
          
          // Special handling for .shell_history
          if (filePath === '/home/.shell_history') {
            const savedHistory = localStorage.getItem('linuxmode_shell_history');
            if (savedHistory) {
              try {
                const parsed = JSON.parse(savedHistory);
                output = parsed.join('\n');
              } catch (e) {
                output = '';
              }
            } else {
              output = '';
            }
          } else if (fileSystem[filePath] && fileSystem[filePath].type === 'file') {
            output = fileSystem[filePath].content;
          } else {
            output = `cat: ${fileName}: No such file or directory`;
          }
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
          // Parse flags and get filename
          const flags = args.filter(arg => arg.startsWith('-'));
          const files = args.filter(arg => !arg.startsWith('-')).slice(1); // Skip command itself
          
          if (files.length === 0) {
            output = 'rm: missing operand';
            break;
          }
          
          const fileName = files[0];
          const hasForce = flags.includes('-rf') || flags.includes('-r');
          let filePath;
          
          // Determine full path
          if (fileName.startsWith('/')) {
            filePath = fileName;
          } else {
            filePath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
          }
          
          // Check if trying to remove protected system directories
          const protectedPaths = ['/usr', '/etc', '/var', '/bin'];
          const isProtected = protectedPaths.some(p => filePath === p || fileName === p.substring(1));
          
          if (isProtected && hasForce) {
            // Show warning and ask for confirmation
            const confirmed = window.confirm(
              '⚠️ WARNING: You are removing system protected content!\n\n' +
              'This action will cause system instability and may result in system failure.\n' +
              'The system may stop responding.\n\n' +
              'Do you want to continue?'
            );
            
            if (confirmed) {
              output = `rm: removing directory '${fileName}'...\nWARNING: Critical system files removed!`;
              setHistory(prev => [...prev, { type: 'output', content: output, color: '#ff0000' }]);
              
              // Trigger system panic after a short delay
              setTimeout(() => {
                // Hide taskbar
                const taskbar = document.querySelector('.taskbar');
                if (taskbar) {
                  taskbar.style.display = 'none';
                }
                
                // Freeze the system
                const background = document.getElementById('os-background');
                if (background) {
                  background.style.backgroundImage = 'none';
                  background.style.backgroundColor = '#000000';
                  
                  // Create kernel panic overlay
                  const panicOverlay = document.createElement('div');
                  panicOverlay.id = 'kernel-panic';
                  panicOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000000;
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Courier New', monospace;
                    color: #ff0000;
                    font-size: 24px;
                    text-align: center;
                    padding: 20px;
                    animation: blink 1s infinite;
                  `;
                  
                  panicOverlay.innerHTML = `
                    <div style="max-width: 800px;">
                      <pre style="margin: 0; line-height: 1.5;">
OS Kernel: System Panic

Critical system files have been removed.
The system has encountered a fatal error and cannot continue.

Error Code: 0x00000001
Location: ${filePath} directory missing

Please reload the page to restart the system.
                      </pre>
                    </div>
                  `;
                  
                  document.body.appendChild(panicOverlay);
                  
                  // Add blink animation
                  const style = document.createElement('style');
                  style.innerHTML = `
                    @keyframes blink {
                      0%, 49% { opacity: 1; }
                      50%, 100% { opacity: 0.7; }
                    }
                  `;
                  document.head.appendChild(style);
                  
                  // Disable all interactions
                  document.body.style.pointerEvents = 'none';
                  panicOverlay.style.pointerEvents = 'all';
                }
              }, 1500);
              
              output = '';
            } else {
              output = 'rm: operation cancelled by user';
            }
          } else if (isProtected && !hasForce) {
            output = `rm: cannot remove '${fileName}': Is a directory\nUse 'rm -rf ${fileName}' to remove directory and its contents`;
          } else if (filePath === '/home/.shell_history') {
            // Special handling for .shell_history
            localStorage.removeItem('linuxmode_shell_history');
            setCommandHistory([]);
            output = `rm: removed '/home/.shell_history'\nCommand history cleared.`;
          } else {
            output = `rm: removed '${fileName}'`;
          }
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

      case 'os-app':
        if (args.length < 2) {
          output = 'os-app: missing subcommand\nUsage: os-app run [app_name] | os-app list';
        } else if (args[1] === 'list') {
          output = `Available applications:
  settings         - System Settings
  personalization  - Wallpaper & Accent Color
  linuxmode        - Linux Mode Terminal
  devzone          - Developer Tools
  winsync          - Windows Sync Tools
  google           - Google (web)
  facebook         - Facebook (web)
  bing             - Bing Search (web)
  calculator       - Calculator (web)

Usage: os-app run [app_name]
Example: os-app run devzone`;
        } else if (args[1] === 'run') {
          if (args.length < 3) {
            output = 'os-app run: missing app name\nUsage: os-app run [app_name]';
          } else {
            const appName = args[2].toLowerCase();
            const validApps = ['settings', 'personalization', 'linuxmode', 'devzone', 'winsync', 'google', 'facebook', 'bing', 'calculator'];
            
            if (validApps.includes(appName)) {
              try {
                window.dispatchEvent(new CustomEvent('os:app_run', { 
                  detail: { app: appName } 
                }));
                output = `Launching application '${appName}'...`;
              } catch (error) {
                output = `Error launching app '${appName}': ${error.message}`;
              }
            } else {
              output = `os-app: unknown application '${appName}'\nUse 'os-app list' to see available apps`;
            }
          }
        } else {
          output = `os-app: unknown subcommand '${args[1]}'\nUsage: os-app run [app_name] | os-app list`;
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
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      // Stop cmatrix if running
      if (cmatrixInterval) {
        clearInterval(cmatrixInterval);
        setCmatrixInterval(null);
        setHistory(prev => [...prev, { type: 'output', content: '^C', color: '#ffff00' }]);
      }
      setCurrentCommand('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion for commands
      const commands = ['help', 'man', 'clear', 'ls', 'pwd', 'cd', 'cat', 'echo', 'whoami', 'date', 'uname', 'hostname', 'neofetch', 'mkdir', 'touch', 'rm', 'toilet', 'cmatrix', 'exit', 'os-settings', 'os-event', 'os-app'];
      const matches = commands.filter(cmd => cmd.startsWith(currentCommand));
      if (matches.length === 1) {
        setCurrentCommand(matches[0]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
      if (cmatrixInterval) {
        clearInterval(cmatrixInterval);
        setCmatrixInterval(null);
      }
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
            <pre 
              style={entry.color ? { color: entry.color } : undefined}
              dangerouslySetInnerHTML={entry.html ? { __html: entry.html } : undefined}
            >
              {!entry.html && entry.content}
            </pre>
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
