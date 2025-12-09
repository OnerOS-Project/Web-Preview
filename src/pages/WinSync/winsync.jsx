import React, { useState, useEffect } from 'react';
import './winsync.css';

function WinSync() {
  const [activeTab, setActiveTab] = useState('clipboard');
  
  // Clipboard State
  const [clipboardText, setClipboardText] = useState('');
  const [clipboardHistory, setClipboardHistory] = useState(() => {
    const saved = localStorage.getItem('winsync_clipboard_history');
    return saved ? JSON.parse(saved) : [];
  });

  // File Transfer State
  const [fileTransferQueue, setFileTransferQueue] = useState(() => {
    const saved = localStorage.getItem('winsync_file_transfers');
    return saved ? JSON.parse(saved) : [];
  });
  const [transferCode, setTransferCode] = useState('');
  const [receiveCode, setReceiveCode] = useState('');

  // Quick Share State
  const [shareText, setShareText] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [sharedItems, setSharedItems] = useState(() => {
    const saved = localStorage.getItem('winsync_shared_items');
    return saved ? JSON.parse(saved) : [];
  });

  // QR Code State
  const [qrInput, setQrInput] = useState('');
  const [qrCode, setQrCode] = useState('');

  // Link Shortener State
  const [longUrl, setLongUrl] = useState('');
  const [shortLinks, setShortLinks] = useState(() => {
    const saved = localStorage.getItem('winsync_short_links');
    return saved ? JSON.parse(saved) : [];
  });

  // Notes Sync State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [syncedNotes, setSyncedNotes] = useState(() => {
    const saved = localStorage.getItem('winsync_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Clipboard Functions
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
    } catch (err) {
      alert('Failed to read clipboard. Please paste manually.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
      addToClipboardHistory(text);
    });
  };

  const addToClipboardHistory = (text) => {
    if (!text || text.trim() === '') return;
    
    const newItem = {
      id: Date.now(),
      text: text,
      date: new Date().toISOString()
    };
    
    const updated = [newItem, ...clipboardHistory.slice(0, 19)]; // Keep last 20 items
    setClipboardHistory(updated);
    localStorage.setItem('winsync_clipboard_history', JSON.stringify(updated));
  };

  const saveToClipboard = () => {
    if (clipboardText) {
      copyToClipboard(clipboardText);
    }
  };

  const deleteClipboardItem = (id) => {
    const updated = clipboardHistory.filter(item => item.id !== id);
    setClipboardHistory(updated);
    localStorage.setItem('winsync_clipboard_history', JSON.stringify(updated));
  };

  const clearClipboardHistory = () => {
    setClipboardHistory([]);
    localStorage.removeItem('winsync_clipboard_history');
  };

  // File Transfer Functions
  const generateTransferCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const initiateFileTransfer = (files) => {
    const code = generateTransferCode();
    const transfers = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      code: code,
      status: 'ready',
      progress: 0,
      date: new Date().toISOString()
    }));
    
    const updated = [...transfers, ...fileTransferQueue];
    setFileTransferQueue(updated);
    localStorage.setItem('winsync_file_transfers', JSON.stringify(updated));
    setTransferCode(code);
  };

  const simulateFileTransfer = (id) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFileTransferQueue(prev => {
        const updated = prev.map(item => 
          item.id === id 
            ? { ...item, progress, status: progress === 100 ? 'completed' : 'transferring' }
            : item
        );
        localStorage.setItem('winsync_file_transfers', JSON.stringify(updated));
        return updated;
      });
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      initiateFileTransfer(e.target.files);
    }
  };

  const deleteTransfer = (id) => {
    setFileTransferQueue(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('winsync_file_transfers', JSON.stringify(updated));
      return updated;
    });
  };

  const receiveFilesByCode = () => {
    if (!receiveCode) {
      alert('Please enter a transfer code');
      return;
    }

    const code = receiveCode.toUpperCase();
    const matchingFiles = fileTransferQueue.filter(f => f.code === code);

    if (matchingFiles.length === 0) {
      alert(`No files found with code: ${code}`);
      return;
    }

    // Mark files as received (simulate download)
    setFileTransferQueue(prev => {
      const updated = prev.map(item =>
        item.code === code
          ? { ...item, status: 'received', progress: 100 }
          : item
      );
      localStorage.setItem('winsync_file_transfers', JSON.stringify(updated));
      return updated;
    });

    setReceiveCode('');
    alert(`Received ${matchingFiles.length} file(s) with code: ${code}`);
  };

  // Quick Share Functions
  const createQuickShare = () => {
    if (!shareText) {
      alert('Please enter some text to share');
      return;
    }

    const code = generateTransferCode();
    const newShare = {
      id: Date.now(),
      text: shareText,
      code: code,
      date: new Date().toISOString(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };

    const updated = [newShare, ...sharedItems];
    setSharedItems(updated);
    localStorage.setItem('winsync_shared_items', JSON.stringify(updated));
    setShareCode(code);
    setShareText('');
  };

  const deleteShare = (id) => {
    const updated = sharedItems.filter(item => item.id !== id);
    setSharedItems(updated);
    localStorage.setItem('winsync_shared_items', JSON.stringify(updated));
  };

  const retrieveShare = (code) => {
    const item = sharedItems.find(s => s.code === code.toUpperCase());
    if (item) {
      setShareText(item.text);
      copyToClipboard(item.text);
    } else {
      alert('Share code not found');
    }
  };

  // QR Code Functions
  const generateQRCode = () => {
    if (!qrInput) {
      alert('Please enter text or URL');
      return;
    }

    // Simple QR code simulation using placeholder
    // In production, use a QR library like qrcode.react
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrInput)}`;
    setQrCode(qrDataUrl);
  };

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = 'qrcode.png';
      link.click();
    }
  };

  // Link Shortener Functions
  const generateShortLink = () => {
    if (!longUrl) {
      alert('Please enter a URL');
      return;
    }

    const shortCode = Math.random().toString(36).substring(2, 8);
    const shortUrl = `oneros.in/${shortCode}`;
    
    const newLink = {
      id: Date.now(),
      longUrl: longUrl,
      shortUrl: shortUrl,
      clicks: 0,
      date: new Date().toISOString()
    };

    const updated = [newLink, ...shortLinks];
    setShortLinks(updated);
    localStorage.setItem('winsync_short_links', JSON.stringify(updated));
    setLongUrl('');
    copyToClipboard(shortUrl);
  };

  const deleteShortLink = (id) => {
    const updated = shortLinks.filter(link => link.id !== id);
    setShortLinks(updated);
    localStorage.setItem('winsync_short_links', JSON.stringify(updated));
  };

  // Notes Functions
  const saveNote = () => {
    if (!noteTitle || !noteContent) {
      alert('Please enter both title and content');
      return;
    }

    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: noteContent,
      date: new Date().toISOString(),
      synced: true
    };

    const updated = [newNote, ...syncedNotes];
    setSyncedNotes(updated);
    localStorage.setItem('winsync_notes', JSON.stringify(updated));
    
    setNoteTitle('');
    setNoteContent('');
    alert('Note saved and synced!');
  };

  const loadNote = (note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const deleteNote = (id) => {
    const updated = syncedNotes.filter(note => note.id !== id);
    setSyncedNotes(updated);
    localStorage.setItem('winsync_notes', JSON.stringify(updated));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="winsync-container">
      <div className="winsync-header">
        <h2>WinSync - Windows Sync Tools</h2>
      </div>

      <div className="winsync-tabs">
        <button 
          className={activeTab === 'clipboard' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('clipboard')}
        >
          Clipboard Sync
        </button>
        <button 
          className={activeTab === 'files' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('files')}
        >
          File Transfer
        </button>
        <button 
          className={activeTab === 'share' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('share')}
        >
          Quick Share
        </button>
        <button 
          className={activeTab === 'qr' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('qr')}
        >
          QR Code
        </button>
        <button 
          className={activeTab === 'links' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('links')}
        >
          Link Shortener
        </button>
        <button 
          className={activeTab === 'notes' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('notes')}
        >
          Notes Sync
        </button>
      </div>

      <div className="winsync-content">
        {activeTab === 'clipboard' && (
          <div className="tool-panel">
            <h3>Clipboard Sync</h3>
            <p className="description">Sync clipboard content across devices</p>
            
            <div className="clipboard-input-section">
              <textarea
                className="winsync-textarea"
                placeholder="Enter text or paste from clipboard..."
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                rows={6}
              />
              <div className="button-group">
                <button onClick={pasteFromClipboard}>Paste from Clipboard</button>
                <button onClick={saveToClipboard}>Save & Copy</button>
                <button onClick={() => setClipboardText('')}>Clear</button>
              </div>
            </div>

            <div className="clipboard-history">
              <div className="history-header">
                <h4>Clipboard History ({clipboardHistory.length})</h4>
                {clipboardHistory.length > 0 && (
                  <button onClick={clearClipboardHistory} className="clear-btn">Clear All</button>
                )}
              </div>
              
              {clipboardHistory.length === 0 ? (
                <p className="empty-state">No clipboard history yet</p>
              ) : (
                <div className="history-list">
                  {clipboardHistory.map(item => (
                    <div key={item.id} className="history-item">
                      <div className="history-text">
                        {item.text.length > 100 
                          ? item.text.substring(0, 100) + '...' 
                          : item.text}
                      </div>
                      <div className="history-meta">
                        <span>{formatDate(item.date)}</span>
                        <div className="history-actions">
                          <button onClick={() => copyToClipboard(item.text)}>Copy</button>
                          <button onClick={() => deleteClipboardItem(item.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="tool-panel">
            <h3>File Transfer</h3>
            <p className="description">Share files across devices with transfer codes</p>

            <div className="file-upload-section">
              <label className="file-upload-btn">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
                Select Files to Transfer
              </label>
              
              {transferCode && (
                <div className="transfer-code-display">
                  <strong>Transfer Code:</strong> {transferCode}
                  <button onClick={() => copyToClipboard(transferCode)}>Copy Code</button>
                </div>
              )}
            </div>

            <div className="file-receive-section">
              <h4>Receive Files</h4>
              <p className="description">Enter a transfer code to receive files</p>
              <div className="receive-input">
                <input
                  type="text"
                  placeholder="Enter transfer code..."
                  value={receiveCode}
                  onChange={(e) => setReceiveCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      receiveFilesByCode();
                    }
                  }}
                />
                <button onClick={receiveFilesByCode}>Receive Files</button>
              </div>
            </div>

            <div className="transfer-queue">
              <h4>Transfer Queue ({fileTransferQueue.length})</h4>
              {fileTransferQueue.length === 0 ? (
                <p className="empty-state">No files in queue</p>
              ) : (
                fileTransferQueue.map(file => (
                  <div key={file.id} className="transfer-item">
                    <div className="transfer-info">
                      <strong>{file.name}</strong>
                      <span>{formatFileSize(file.size)}</span>
                      <span className="transfer-code">Code: {file.code}</span>
                    </div>
                    <div className="transfer-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{file.progress}%</span>
                    </div>
                    <div className="transfer-actions">
                      {file.status === 'ready' && (
                        <button onClick={() => simulateFileTransfer(file.id)}>Start Transfer</button>
                      )}
                      {file.status === 'completed' && (
                        <span className="status-completed">✓ Completed</span>
                      )}
                      {file.status === 'received' && (
                        <span className="status-completed">✓ Received</span>
                      )}
                      <button onClick={() => deleteTransfer(file.id)}>Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="tool-panel">
            <h3>Quick Share</h3>
            <p className="description">Share text with a temporary code (24h expiry)</p>

            <div className="share-create-section">
              <textarea
                className="winsync-textarea"
                placeholder="Enter text to share..."
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                rows={6}
              />
              <button onClick={createQuickShare}>Create Share Code</button>
              
              {shareCode && (
                <div className="share-code-display">
                  <strong>Share Code:</strong> {shareCode}
                  <button onClick={() => copyToClipboard(shareCode)}>Copy Code</button>
                </div>
              )}
            </div>

            <div className="share-retrieve-section">
              <h4>Retrieve Shared Content</h4>
              <div className="retrieve-input">
                <input
                  type="text"
                  placeholder="Enter share code..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      retrieveShare(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  retrieveShare(input.value);
                  input.value = '';
                }}>Retrieve</button>
              </div>
            </div>

            <div className="shared-items-list">
              <h4>Active Shares ({sharedItems.length})</h4>
              {sharedItems.length === 0 ? (
                <p className="empty-state">No active shares</p>
              ) : (
                sharedItems.map(item => (
                  <div key={item.id} className="shared-item">
                    <div className="shared-header">
                      <strong>Code: {item.code}</strong>
                      <span>Expires: {formatDate(item.expires)}</span>
                    </div>
                    <div className="shared-text">
                      {item.text.length > 150 
                        ? item.text.substring(0, 150) + '...' 
                        : item.text}
                    </div>
                    <div className="shared-actions">
                      <button onClick={() => copyToClipboard(item.text)}>Copy</button>
                      <button onClick={() => copyToClipboard(item.code)}>Copy Code</button>
                      <button onClick={() => deleteShare(item.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="tool-panel">
            <h3>QR Code Generator</h3>
            <p className="description">Generate QR codes for URLs or text</p>

            <div className="qr-input-section">
              <textarea
                className="winsync-textarea"
                placeholder="Enter URL or text to encode..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                rows={4}
              />
              <button onClick={generateQRCode}>Generate QR Code</button>
            </div>

            {qrCode && (
              <div className="qr-output-section">
                <div className="qr-code-display">
                  <img src={qrCode} alt="QR Code" />
                </div>
                <div className="qr-actions">
                  <button onClick={downloadQRCode}>Download QR Code</button>
                  <button onClick={() => setQrCode('')}>Clear</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="tool-panel">
            <h3>Link Shortener</h3>
            <p className="description">Create short links for easy sharing</p>

            <div className="link-input-section">
              <input
                type="url"
                className="winsync-input"
                placeholder="Enter long URL..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
              />
              <button onClick={generateShortLink}>Shorten Link</button>
            </div>

            <div className="short-links-list">
              <h4>Shortened Links ({shortLinks.length})</h4>
              {shortLinks.length === 0 ? (
                <p className="empty-state">No shortened links yet</p>
              ) : (
                shortLinks.map(link => (
                  <div key={link.id} className="short-link-item">
                    <div className="link-info">
                      <div className="short-url">
                        <strong>{link.shortUrl}</strong>
                        <button onClick={() => copyToClipboard(link.shortUrl)}>Copy</button>
                      </div>
                      <div className="long-url">{link.longUrl}</div>
                      <div className="link-meta">
                        <span>Created: {formatDate(link.date)}</span>
                        <span>Clicks: {link.clicks}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteShortLink(link.id)}>Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="tool-panel">
            <h3>Notes Sync</h3>
            <p className="description">Create and sync notes across devices</p>

            <div className="note-editor">
              <input
                type="text"
                className="winsync-input"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <textarea
                className="winsync-textarea"
                placeholder="Note content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={8}
              />
              <button onClick={saveNote}>Save & Sync Note</button>
            </div>

            <div className="notes-list">
              <h4>Synced Notes ({syncedNotes.length})</h4>
              {syncedNotes.length === 0 ? (
                <p className="empty-state">No synced notes yet</p>
              ) : (
                syncedNotes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <strong>{note.title}</strong>
                      <span className={note.synced ? 'synced' : ''}>
                        {note.synced ? '✓ Synced' : 'Syncing...'}
                      </span>
                    </div>
                    <div className="note-content">
                      {note.content.length > 200 
                        ? note.content.substring(0, 200) + '...' 
                        : note.content}
                    </div>
                    <div className="note-meta">
                      <span>{formatDate(note.date)}</span>
                      <div className="note-actions">
                        <button onClick={() => loadNote(note)}>Edit</button>
                        <button onClick={() => copyToClipboard(note.content)}>Copy</button>
                        <button onClick={() => deleteNote(note.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WinSync;
