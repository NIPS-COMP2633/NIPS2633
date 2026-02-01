import React, { useState, useRef, useEffect } from 'react';
import './outline_cal.css';

function BookmarkletPage() {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const bookmarkletLinkRef = useRef(null);

  // Example bookmarklet code - this extracts calendar data
  const bookmarkletCode = `javascript:(function(){const events=[];document.querySelectorAll('.calendar-event').forEach(el=>{events.push({title:el.textContent,time:el.dataset.time});});alert('Found '+events.length+' events');})();`;

  // Set href using ref to avoid React warning about javascript: URLs
  useEffect(() => {
    if (bookmarkletLinkRef.current) {
      bookmarkletLinkRef.current.href = bookmarkletCode;
    }
  }, [bookmarkletCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bookmarkletCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    });
  };

  return (
    <div className="bookmarklet-page">
      <div className="bookmarklet-container">
        <h1>Install Uni-Cal Bookmarklet</h1>
        <p className="instructions">
          Install in 30 seconds! Just drag a button to your bookmarks bar.
        </p>

        <div className="show-bookmarks-bar">
          <h2>Step 1: Show Your Bookmarks Bar</h2>
          <p>Press the keyboard shortcut for your browser:</p>
          <div className="shortcut-grid">
            <div className="shortcut-item">
              <strong>Chrome/Edge</strong>
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>
              <span className="mac">(Mac: <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>)</span>
            </div>
            <div className="shortcut-item">
              <strong>Firefox</strong>
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>
              <span className="mac">(Mac: <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>)</span>
            </div>
            <div className="shortcut-item">
              <strong>Safari</strong>
              <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>
            </div>
          </div>
          <p className="helper-text">Your bookmarks bar should now be visible at the top of your browser!</p>
        </div>

        <div className="installation-methods">
          <div className="method-card primary">
            <h2>Step 2: Drag This Button</h2>
            <div className="step-content">
              <p className="step-description">Click and drag this button to your bookmarks bar:</p>
              <a 
                ref={bookmarkletLinkRef}
                className="bookmarklet-link draggable"
                draggable="true"
                onClick={(e) => e.preventDefault()}
              >
                <span className="drag-icon"></span>
                Uni-Cal Importer
                <span className="drag-icon"></span>
              </a>
              <div className="drag-animation">
                <div className="arrow-container">
                  <div className="arrow">↑</div>
                  <div className="arrow">↑</div>
                  <div className="arrow">↑</div>
                </div>
                <p>Drag up to your bookmarks bar</p>
              </div>
            </div>
          </div>

          <details className="troubleshooting">
            <summary>Having trouble? Try the manual method</summary>
            <div className="method-card secondary">
              <h3> Alternative: Manual Install</h3>
              <div className="step-content">
                <p className="step-description">If dragging doesn't work, copy the code manually:</p>
                <div className="code-section">
                  <button 
                    className={`copy-button ${copied ? 'copied' : ''}`}
                    onClick={copyToClipboard}
                  >
                    {copied ? '✓ Copied!' : 'Copy Code'}
                  </button>
                  <button 
                    className="toggle-code-button"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? 'Hide Code' : 'View Code'}
                  </button>
                </div>
                {showCode && (
                  <div className="code-display">
                    <code>{bookmarkletCode}</code>
                  </div>
                )}
                <ol className="manual-steps">
                  <li>Click "Copy Code" above</li>
                  <li>Right-click your bookmarks bar → Add Page/Bookmark</li>
                  <li>Name: "Uni-Cal Importer"</li>
                  <li>URL/Location: Paste the code (make sure it starts with <code>javascript:</code>)</li>
                  <li>Save</li>
                </ol>
              </div>
            </div>
          </details>
        </div>

        <div className="how-to-use">
          <h2>How to Use</h2>
          <ol>
            <li><strong>Open</strong> your university's D2L page (<a href="https://learn.mru.ca/d2l/home">learn.mru.ca</a>)</li>
            <li><strong>Navigate</strong> to each course outline you wish to import</li>
            <li><strong>click</strong> the "Uni-Cal Importer" button in your bookmarks bar to add</li>
            <li><strong>Done.</strong> the events will be added to your Google Calendar automatically</li>
          </ol>
        </div>

        <div className="compatibility-info">
          <h3>Browser Compatibility</h3>
          <div className="browser-grid">
            <div className="browser-item">✓ Chrome</div>
            <div className="browser-item">✓ Firefox</div>
            <div className="browser-item">✓ Safari</div>
            <div className="browser-item">✓ Edge</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookmarkletPage;
