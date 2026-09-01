import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScrewdriverWrench, faCamera, faChartBar, faClipboard, faVideo, faPalette, faPenToSquare, faFloppyDisk, faTrash, faCircle, faStop, faPlay } from '@fortawesome/free-solid-svg-icons';
import './toolsapp.css';

function ToolsApp() {
  const [activeTab, setActiveTab] = useState('screenshot');
  
  // Screenshot Tool
  const [screenshotData, setScreenshotData] = useState(null);
  const [screenshotMode, setScreenshotMode] = useState('fullscreen'); // fullscreen, window, area
  
  // System Monitor
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [processes, setProcesses] = useState([]);
  
  // Clipboard Manager
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [clipboardMonitor, setClipboardMonitor] = useState(false);
  
  // Screen Recorder (simulated)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState([]);
  
  // Color Picker
  const [pickedColor, setPickedColor] = useState('#000000');
  const [colorHistory, setColorHistory] = useState([]);
  const canvasRef = useRef(null);
  
  // Quick Notes
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');

  // Load saved data
  useEffect(() => {
    const savedClipboard = localStorage.getItem('toolsapp_clipboard');
    const savedNotes = localStorage.getItem('toolsapp_notes');
    const savedRecordings = localStorage.getItem('toolsapp_recordings');
    const savedColors = localStorage.getItem('toolsapp_colors');
    
    if (savedClipboard) setClipboardHistory(JSON.parse(savedClipboard));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedRecordings) setRecordings(JSON.parse(savedRecordings));
    if (savedColors) setColorHistory(JSON.parse(savedColors));
  }, []);

  // System Monitor Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 100));
      setMemoryUsage(Math.floor(Math.random() * 100));
      
      const openWindows = document.querySelectorAll('.window');
      const processList = Array.from(openWindows).map((win, idx) => {
        const title = win.querySelector('.draggable-window span')?.textContent || 'Unknown';
        return {
          id: idx + 1,
          name: title,
          memory: Math.floor(Math.random() * 200) + 50,
          cpu: Math.floor(Math.random() * 50)
        };
      });
      setProcesses(processList);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Recording Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Screenshot Functions
  const takeScreenshot = async () => {
    try {
      const osBackground = document.getElementById('os-background');
      if (!osBackground) return;

      // Create a canvas from the current view
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Fill with background color
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add text overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Screenshot taken at ' + new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2);

      const dataUrl = canvas.toDataURL('image/png');
      setScreenshotData(dataUrl);
    } catch (error) {
      alert('Screenshot feature requires additional permissions');
    }
  };

  const downloadScreenshot = () => {
    if (!screenshotData) return;
    const link = document.createElement('a');
    link.href = screenshotData;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
  };

  // Clipboard Functions
  const addToClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && !clipboardHistory.includes(text)) {
        const updated = [text, ...clipboardHistory].slice(0, 20);
        setClipboardHistory(updated);
        localStorage.setItem('toolsapp_clipboard', JSON.stringify(updated));
      }
    } catch (error) {
      console.log('Clipboard access denied');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const clearClipboardHistory = () => {
    setClipboardHistory([]);
    localStorage.removeItem('toolsapp_clipboard');
  };

  // Recording Functions
  const toggleRecording = () => {
    if (isRecording) {
      const newRecording = {
        id: Date.now(),
        duration: recordingTime,
        timestamp: new Date().toISOString(),
        name: `Recording ${recordings.length + 1}`
      };
      const updated = [newRecording, ...recordings];
      setRecordings(updated);
      localStorage.setItem('toolsapp_recordings', JSON.stringify(updated));
    }
    setIsRecording(!isRecording);
  };

  const deleteRecording = (id) => {
    const updated = recordings.filter(r => r.id !== id);
    setRecordings(updated);
    localStorage.setItem('toolsapp_recordings', JSON.stringify(updated));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Color Picker Functions
  const pickColor = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    const imageData = ctx.getImageData(x, y, 1, 1);
    const pixel = imageData.data;
    
    const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    
    setPickedColor(hex);
  };

  const saveColor = () => {
    if (!colorHistory.includes(pickedColor)) {
      const updated = [pickedColor, ...colorHistory].slice(0, 20);
      setColorHistory(updated);
      localStorage.setItem('toolsapp_colors', JSON.stringify(updated));
    }
  };

  // Notes Functions
  const saveNote = () => {
    if (!currentNote.trim()) return;
    const newNote = {
      id: Date.now(),
      text: currentNote,
      timestamp: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('toolsapp_notes', JSON.stringify(updated));
    setCurrentNote('');
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('toolsapp_notes', JSON.stringify(updated));
  };

  // Draw color gradient on canvas
  useEffect(() => {
    if (canvasRef.current && activeTab === 'colorpicker') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Draw gradient
      for (let i = 0; i < 360; i++) {
        ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
        ctx.fillRect(i * (canvas.width / 360), 0, canvas.width / 360, canvas.height / 2);
      }
      
      // Draw brightness gradient
      const gradient = ctx.createLinearGradient(0, canvas.height / 2, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(128, 128, 128, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    }
  }, [activeTab]);

  return (
    <div className="toolsapp-container">
      <div className="toolsapp-header">
        <h2><FontAwesomeIcon icon={faScrewdriverWrench} /> Tools App</h2>
        <div className="toolsapp-tabs">
          <button 
            className={activeTab === 'screenshot' ? 'tab-active' : ''}
            onClick={() => setActiveTab('screenshot')}
          >
            <FontAwesomeIcon icon={faCamera} /> Screenshot
          </button>
          <button 
            className={activeTab === 'monitor' ? 'tab-active' : ''}
            onClick={() => setActiveTab('monitor')}
          >
            <FontAwesomeIcon icon={faChartBar} /> Monitor
          </button>
          <button 
            className={activeTab === 'clipboard' ? 'tab-active' : ''}
            onClick={() => setActiveTab('clipboard')}
          >
            <FontAwesomeIcon icon={faClipboard} /> Clipboard
          </button>
          <button 
            className={activeTab === 'recorder' ? 'tab-active' : ''}
            onClick={() => setActiveTab('recorder')}
          >
            <FontAwesomeIcon icon={faVideo} /> Recorder
          </button>
          <button 
            className={activeTab === 'colorpicker' ? 'tab-active' : ''}
            onClick={() => setActiveTab('colorpicker')}
          >
            <FontAwesomeIcon icon={faPalette} /> Colors
          </button>
          <button 
            className={activeTab === 'notes' ? 'tab-active' : ''}
            onClick={() => setActiveTab('notes')}
          >
            <FontAwesomeIcon icon={faPenToSquare} /> Notes
          </button>
        </div>
      </div>

      <div className="toolsapp-content">
        {activeTab === 'screenshot' && (
          <div className="tool-panel">
            <h3>Screenshot Tool</h3>
            <div className="screenshot-controls">
              <div className="mode-selector">
                <label>
                  <input 
                    type="radio" 
                    checked={screenshotMode === 'fullscreen'}
                    onChange={() => setScreenshotMode('fullscreen')}
                  />
                  Full Screen
                </label>
                <label>
                  <input 
                    type="radio" 
                    checked={screenshotMode === 'window'}
                    onChange={() => setScreenshotMode('window')}
                  />
                  Active Window
                </label>
                <label>
                  <input 
                    type="radio" 
                    checked={screenshotMode === 'area'}
                    onChange={() => setScreenshotMode('area')}
                  />
                  Select Area
                </label>
              </div>
              <button className="take-screenshot-btn" onClick={takeScreenshot}>
                <FontAwesomeIcon icon={faCamera} /> Take Screenshot
              </button>
            </div>
            {screenshotData && (
              <div className="screenshot-preview">
                <img src={screenshotData} alt="Screenshot" />
                <div className="screenshot-actions">
                  <button onClick={downloadScreenshot}><FontAwesomeIcon icon={faFloppyDisk} /> Download</button>
                  <button onClick={() => setScreenshotData(null)}><FontAwesomeIcon icon={faTrash} /> Clear</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="tool-panel">
            <h3>System Monitor</h3>
            <div className="monitor-stats">
              <div className="stat-box">
                <h4>CPU Usage</h4>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${cpuUsage}%`, background: '#3b82f6' }}></div>
                </div>
                <span>{cpuUsage}%</span>
              </div>
              <div className="stat-box">
                <h4>Memory Usage</h4>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${memoryUsage}%`, background: '#10b981' }}></div>
                </div>
                <span>{memoryUsage}%</span>
              </div>
            </div>
            <div className="process-list">
              <h4>Active Processes ({processes.length})</h4>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Memory (MB)</th>
                    <th>CPU %</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map(proc => (
                    <tr key={proc.id}>
                      <td>{proc.name}</td>
                      <td>{proc.memory}</td>
                      <td>{proc.cpu}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clipboard' && (
          <div className="tool-panel">
            <h3>Clipboard Manager</h3>
            <div className="clipboard-controls">
              <button onClick={addToClipboard}><FontAwesomeIcon icon={faClipboard} /> Capture Current</button>
              <button onClick={clearClipboardHistory}><FontAwesomeIcon icon={faTrash} /> Clear All</button>
              <label>
                <input 
                  type="checkbox" 
                  checked={clipboardMonitor}
                  onChange={() => setClipboardMonitor(!clipboardMonitor)}
                />
                Auto-monitor
              </label>
            </div>
            <div className="clipboard-list">
              {clipboardHistory.length === 0 ? (
                <p className="empty-message">No clipboard history yet</p>
              ) : (
                clipboardHistory.map((item, idx) => (
                  <div key={idx} className="clipboard-item">
                    <div className="clipboard-text">{item}</div>
                    <button onClick={() => copyToClipboard(item)}><FontAwesomeIcon icon={faClipboard} /> Copy</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'recorder' && (
          <div className="tool-panel">
            <h3>Screen Recorder</h3>
            <div className="recorder-controls">
              <div className="recording-display">
                {isRecording && (
                  <>
                    <div className="recording-indicator"><FontAwesomeIcon icon={faCircle} style={{color: '#ef4444'}} /> Recording</div>
                    <div className="recording-timer">{formatTime(recordingTime)}</div>
                  </>
                )}
              </div>
              <button 
                className={isRecording ? 'stop-btn' : 'record-btn'}
                onClick={toggleRecording}
              >
                {isRecording ? <><FontAwesomeIcon icon={faStop} /> Stop Recording</> : <><FontAwesomeIcon icon={faVideo} /> Start Recording</>}
              </button>
            </div>
            <div className="recordings-list">
              <h4>Saved Recordings ({recordings.length})</h4>
              {recordings.map(rec => (
                <div key={rec.id} className="recording-item">
                  <div className="recording-info">
                    <h5>{rec.name}</h5>
                    <p>Duration: {formatTime(rec.duration)}</p>
                    <p className="timestamp">{new Date(rec.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="recording-actions">
                    <button><FontAwesomeIcon icon={faPlay} /> Play</button>
                    <button onClick={() => deleteRecording(rec.id)}><FontAwesomeIcon icon={faTrash} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'colorpicker' && (
          <div className="tool-panel">
            <h3>Color Picker</h3>
            <div className="color-picker-section">
              <canvas 
                ref={canvasRef}
                width={400}
                height={300}
                className="color-canvas"
                onClick={pickColor}
              />
              <div className="color-display">
                <div 
                  className="color-preview"
                  style={{ background: pickedColor }}
                ></div>
                <div className="color-info">
                  <input 
                    type="text" 
                    value={pickedColor}
                    readOnly
                    className="color-hex"
                  />
                  <button onClick={saveColor}><FontAwesomeIcon icon={faFloppyDisk} /> Save</button>
                  <button onClick={() => navigator.clipboard.writeText(pickedColor)}>
                    <FontAwesomeIcon icon={faClipboard} /> Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="color-history">
              <h4>Color History</h4>
              <div className="color-swatches">
                {colorHistory.map((color, idx) => (
                  <div 
                    key={idx}
                    className="color-swatch"
                    style={{ background: color }}
                    onClick={() => setPickedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="tool-panel">
            <h3>Quick Notes</h3>
            <div className="notes-input">
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Type your quick note here..."
                rows={4}
              />
              <button onClick={saveNote}><FontAwesomeIcon icon={faFloppyDisk} /> Save Note</button>
            </div>
            <div className="notes-list">
              {notes.map(note => (
                <div key={note.id} className="note-item">
                  <p>{note.text}</p>
                  <div className="note-meta">
                    <span>{new Date(note.timestamp).toLocaleString()}</span>
                    <button onClick={() => deleteNote(note.id)}><FontAwesomeIcon icon={faTrash} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolsApp;
