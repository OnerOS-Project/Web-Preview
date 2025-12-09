import React, { useState } from 'react';
import './devzone.css';

function DevZone() {
  const [activeTab, setActiveTab] = useState('json');
  
  // JSON Formatter State
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Base64 State
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [base64Mode, setBase64Mode] = useState('encode');

  // Color Converter State
  const [colorInput, setColorInput] = useState('#3b82f6');
  const [colorOutputs, setColorOutputs] = useState({
    hex: '#3b82f6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)'
  });

  // Regex Tester State
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestString, setRegexTestString] = useState('');
  const [regexMatches, setRegexMatches] = useState([]);

  // Hash Generator State
  const [hashInput, setHashInput] = useState('');
  const [hashOutputs, setHashOutputs] = useState({
    md5: '',
    sha1: '',
    sha256: ''
  });

  // Code Snippet State
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLanguage, setSnippetLanguage] = useState('javascript');
  const [savedSnippets, setSavedSnippets] = useState(() => {
    const saved = localStorage.getItem('devzone_snippets');
    return saved ? JSON.parse(saved) : [];
  });

  // JSON Formatter Functions
  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (e) {
      setJsonError('Invalid JSON: ' + e.message);
      setJsonOutput('');
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
      setJsonError('');
    } catch (e) {
      setJsonError('Invalid JSON: ' + e.message);
      setJsonOutput('');
    }
  };

  // Base64 Functions
  const handleBase64 = () => {
    try {
      if (base64Mode === 'encode') {
        setBase64Output(btoa(base64Input));
      } else {
        setBase64Output(atob(base64Input));
      }
    } catch (e) {
      setBase64Output('Error: ' + e.message);
    }
  };

  // Color Converter Functions
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const convertColor = (hex) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setColorOutputs({
        hex: hex,
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      });
    }
  };

  // Regex Tester Functions
  const testRegex = () => {
    try {
      const regex = new RegExp(regexPattern, regexFlags);
      const matches = [];
      let match;
      
      if (regexFlags.includes('g')) {
        while ((match = regex.exec(regexTestString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(regexTestString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      setRegexMatches(matches);
    } catch (e) {
      setRegexMatches([{ error: e.message }]);
    }
  };

  // Hash Generator Functions
  const generateHashes = async (text) => {
    // Simple hash implementations (for demo purposes)
    // In production, use crypto library
    
    const simpleHash = (str, seed = 0) => {
      let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
      for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
    };

    setHashOutputs({
      md5: simpleHash(text, 1),
      sha1: simpleHash(text, 2).padStart(40, '0'),
      sha256: simpleHash(text, 3).padStart(64, '0')
    });
  };

  // Code Snippet Functions
  const saveSnippet = () => {
    if (!snippetTitle || !snippetCode) {
      alert('Please provide both title and code');
      return;
    }

    const newSnippet = {
      id: Date.now(),
      title: snippetTitle,
      code: snippetCode,
      language: snippetLanguage,
      date: new Date().toISOString()
    };

    const updated = [...savedSnippets, newSnippet];
    setSavedSnippets(updated);
    localStorage.setItem('devzone_snippets', JSON.stringify(updated));
    
    setSnippetTitle('');
    setSnippetCode('');
    alert('Snippet saved!');
  };

  const deleteSnippet = (id) => {
    const updated = savedSnippets.filter(s => s.id !== id);
    setSavedSnippets(updated);
    localStorage.setItem('devzone_snippets', JSON.stringify(updated));
  };

  const loadSnippet = (snippet) => {
    setSnippetTitle(snippet.title);
    setSnippetCode(snippet.code);
    setSnippetLanguage(snippet.language);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <div className="devzone-container">
      <div className="devzone-header">
        <h2>DevZone - Developer Tools</h2>
      </div>

      <div className="devzone-tabs">
        <button 
          className={activeTab === 'json' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('json')}
        >
          JSON Formatter
        </button>
        <button 
          className={activeTab === 'base64' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('base64')}
        >
          Base64
        </button>
        <button 
          className={activeTab === 'color' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('color')}
        >
          Color Converter
        </button>
        <button 
          className={activeTab === 'regex' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('regex')}
        >
          Regex Tester
        </button>
        <button 
          className={activeTab === 'hash' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('hash')}
        >
          Hash Generator
        </button>
        <button 
          className={activeTab === 'snippets' ? 'tab-active' : ''} 
          onClick={() => setActiveTab('snippets')}
        >
          Code Snippets
        </button>
      </div>

      <div className="devzone-content">
        {activeTab === 'json' && (
          <div className="tool-panel">
            <h3>JSON Formatter</h3>
            <textarea
              className="devzone-input"
              placeholder="Paste your JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
            />
            <div className="button-group">
              <button onClick={formatJSON}>Format (Beautify)</button>
              <button onClick={minifyJSON}>Minify</button>
              <button onClick={() => setJsonInput('')}>Clear</button>
              <button onClick={() => copyToClipboard(jsonOutput)}>Copy Output</button>
            </div>
            {jsonError && <div className="error-message">{jsonError}</div>}
            {jsonOutput && (
              <textarea
                className="devzone-output"
                value={jsonOutput}
                readOnly
                rows={10}
              />
            )}
          </div>
        )}

        {activeTab === 'base64' && (
          <div className="tool-panel">
            <h3>Base64 Encoder/Decoder</h3>
            <div className="mode-selector">
              <label>
                <input
                  type="radio"
                  value="encode"
                  checked={base64Mode === 'encode'}
                  onChange={(e) => setBase64Mode(e.target.value)}
                />
                Encode
              </label>
              <label>
                <input
                  type="radio"
                  value="decode"
                  checked={base64Mode === 'decode'}
                  onChange={(e) => setBase64Mode(e.target.value)}
                />
                Decode
              </label>
            </div>
            <textarea
              className="devzone-input"
              placeholder={base64Mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              rows={6}
            />
            <div className="button-group">
              <button onClick={handleBase64}>{base64Mode === 'encode' ? 'Encode' : 'Decode'}</button>
              <button onClick={() => setBase64Input('')}>Clear</button>
              <button onClick={() => copyToClipboard(base64Output)}>Copy Output</button>
            </div>
            {base64Output && (
              <textarea
                className="devzone-output"
                value={base64Output}
                readOnly
                rows={6}
              />
            )}
          </div>
        )}

        {activeTab === 'color' && (
          <div className="tool-panel">
            <h3>Color Converter</h3>
            <div className="color-input-group">
              <input
                type="color"
                value={colorInput}
                onChange={(e) => {
                  setColorInput(e.target.value);
                  convertColor(e.target.value);
                }}
              />
              <input
                type="text"
                value={colorInput}
                onChange={(e) => {
                  setColorInput(e.target.value);
                  convertColor(e.target.value);
                }}
                placeholder="#3b82f6"
              />
            </div>
            <div className="color-preview" style={{ backgroundColor: colorInput }}></div>
            <div className="color-outputs">
              <div className="color-output-item">
                <label>HEX:</label>
                <input type="text" value={colorOutputs.hex} readOnly />
                <button onClick={() => copyToClipboard(colorOutputs.hex)}>Copy</button>
              </div>
              <div className="color-output-item">
                <label>RGB:</label>
                <input type="text" value={colorOutputs.rgb} readOnly />
                <button onClick={() => copyToClipboard(colorOutputs.rgb)}>Copy</button>
              </div>
              <div className="color-output-item">
                <label>HSL:</label>
                <input type="text" value={colorOutputs.hsl} readOnly />
                <button onClick={() => copyToClipboard(colorOutputs.hsl)}>Copy</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'regex' && (
          <div className="tool-panel">
            <h3>Regex Tester</h3>
            <div className="regex-inputs">
              <div className="input-group">
                <label>Pattern:</label>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="Enter regex pattern..."
                />
              </div>
              <div className="input-group">
                <label>Flags:</label>
                <input
                  type="text"
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  placeholder="g, i, m, etc."
                  style={{ width: '100px' }}
                />
              </div>
            </div>
            <textarea
              className="devzone-input"
              placeholder="Enter test string..."
              value={regexTestString}
              onChange={(e) => setRegexTestString(e.target.value)}
              rows={6}
            />
            <button onClick={testRegex}>Test Regex</button>
            {regexMatches.length > 0 && (
              <div className="regex-results">
                <h4>Matches: {regexMatches[0].error ? 0 : regexMatches.length}</h4>
                {regexMatches[0].error ? (
                  <div className="error-message">{regexMatches[0].error}</div>
                ) : (
                  regexMatches.map((match, i) => (
                    <div key={i} className="match-item">
                      <strong>Match {i + 1}:</strong> "{match.match}" at index {match.index}
                      {match.groups.length > 0 && (
                        <div>Groups: {match.groups.join(', ')}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hash' && (
          <div className="tool-panel">
            <h3>Hash Generator</h3>
            <textarea
              className="devzone-input"
              placeholder="Enter text to hash..."
              value={hashInput}
              onChange={(e) => {
                setHashInput(e.target.value);
                generateHashes(e.target.value);
              }}
              rows={6}
            />
            <div className="hash-outputs">
              <div className="hash-output-item">
                <label>MD5-like:</label>
                <input type="text" value={hashOutputs.md5} readOnly />
                <button onClick={() => copyToClipboard(hashOutputs.md5)}>Copy</button>
              </div>
              <div className="hash-output-item">
                <label>SHA1-like:</label>
                <input type="text" value={hashOutputs.sha1} readOnly />
                <button onClick={() => copyToClipboard(hashOutputs.sha1)}>Copy</button>
              </div>
              <div className="hash-output-item">
                <label>SHA256-like:</label>
                <input type="text" value={hashOutputs.sha256} readOnly />
                <button onClick={() => copyToClipboard(hashOutputs.sha256)}>Copy</button>
              </div>
            </div>
            <p className="hash-note">Note: These are demo hashes for UI purposes only</p>
          </div>
        )}

        {activeTab === 'snippets' && (
          <div className="tool-panel">
            <h3>Code Snippets</h3>
            <div className="snippet-form">
              <input
                type="text"
                placeholder="Snippet title..."
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
              />
              <select value={snippetLanguage} onChange={(e) => setSnippetLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash</option>
              </select>
              <textarea
                placeholder="Enter your code snippet..."
                value={snippetCode}
                onChange={(e) => setSnippetCode(e.target.value)}
                rows={8}
              />
              <button onClick={saveSnippet}>Save Snippet</button>
            </div>
            
            <div className="snippets-list">
              <h4>Saved Snippets ({savedSnippets.length})</h4>
              {savedSnippets.length === 0 ? (
                <p>No snippets saved yet</p>
              ) : (
                savedSnippets.map(snippet => (
                  <div key={snippet.id} className="snippet-item">
                    <div className="snippet-header">
                      <strong>{snippet.title}</strong>
                      <span className="snippet-language">{snippet.language}</span>
                    </div>
                    <pre className="snippet-code">{snippet.code}</pre>
                    <div className="snippet-actions">
                      <button onClick={() => loadSnippet(snippet)}>Load</button>
                      <button onClick={() => copyToClipboard(snippet.code)}>Copy</button>
                      <button onClick={() => deleteSnippet(snippet.id)}>Delete</button>
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

export default DevZone;
