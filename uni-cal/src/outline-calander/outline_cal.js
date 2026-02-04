import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './outline_cal.css';
import { processImportData, parseHTMLForCourseData, STORAGE_KEY } from './utils/dataProcessor';
import { generateBookmarkletCode, copyToClipboard as copyText } from './utils/bookmarkletGenerator';
import { autoCheckClipboard } from './utils/clipboardHandler';
import { exportAllEvents } from '../client-side-scripts/outline_google_upoad';



function BookmarkletPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [importStatus, setImportStatus] = useState('listening');
  const [importedData, setImportedData] = useState(null);
  const [processedEvents, setProcessedEvents] = useState([]);
  const [allImportedCourses, setAllImportedCourses] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const bookmarkletLinkRef = useRef(null);
  const bookmarkletCode = generateBookmarkletCode();


  // Handle MRU events passed from login page
  useEffect(() => {
    if (location.state?.mruEvents && location.state.mruEvents.length > 0) {
      console.log('Received MRU events from login:', location.state.mruEvents);

      // Convert MRU events to course format
      const mruCourse = {
        title: 'MRU Class Schedule',
        events: location.state.mruEvents, // Array of event objects
        location: 'Various',
        instructor: 'From MRU Schedule Builder'
      };

      console.log('Formatted MRU course:', mruCourse);
      console.log('Number of MRU events:', mruCourse.events.length);

      setAllImportedCourses(prev => [...prev, mruCourse]);
      setProcessedEvents(prev => [...prev, mruCourse]);
      setImportStatus('success');

      // Clear the state to prevent re-processing on refresh
      window.history.replaceState({}, document.title);

      setTimeout(() => setImportStatus('listening'), 2000);
    }
  }, [location.state]);

  // Set bookmarklet href
  useEffect(() => {
    if (bookmarkletLinkRef.current) {
      bookmarkletLinkRef.current.href = bookmarkletCode;
    }
  }, [bookmarkletCode]);



  // Process imported data
  const processImportedData = useCallback(async (rawData) => {
    try {
      window.scrollTo(0, 0);
      setImportStatus('received');
      setImportedData(rawData);

      setImportStatus('processing');
      const result = await processImportData(rawData);

      if (result.success) {
        // Add the processed courses (duplicates already filtered)
        setAllImportedCourses(prev => [...prev, ...result.courses]);
        setProcessedEvents(prev => [...prev, ...result.courses]);
        setImportStatus('success');
        setTimeout(() => setImportStatus('listening'), 2000);
      } else {
        alert(result.error || 'Failed to process course data');
        setImportStatus('error');
      }
    } catch (err) {
      console.error('Error processing import data:', err);
      alert('Failed to parse course data: ' + err.message);
      setImportStatus('error');
    }
  }, []);



  // Auto-check clipboard when window gains focus
  useEffect(() => {
    let lastClipboardCheck = null;

    const handleWindowFocus = async () => {
      if (importStatus !== 'listening' && importStatus !== 'success') return;

      const { data, clipboardText } = await autoCheckClipboard(lastClipboardCheck);
      lastClipboardCheck = clipboardText;

      if (data) {
        // Extract course title early to check for duplicates BEFORE processing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.html;
        const courseTitle = tempDiv.querySelector('h1')?.textContent?.trim() || 'Unnamed Course';

        // Check if this course already exists
        const isDuplicate = allImportedCourses.some(course =>
          course.title.toLowerCase().trim() === courseTitle.toLowerCase().trim()
        );

        if (isDuplicate) {
          console.log(`Course "${courseTitle}" already imported, skipping...`);
          return;
        }

        setImportStatus('processing');
        const importData = parseHTMLForCourseData(data.html, data.url, data.pdfData);
        processImportedData(importData);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [importStatus, processImportedData, allImportedCourses]);



  // Clear all data
  const handleClearData = () => {
    setImportStatus('listening');
    setImportedData(null);
    setProcessedEvents([]);
    setAllImportedCourses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Export to calendar
  const handleExportToCalendar = async () => {
    try {
      setIsExporting(true);

      // Create 2D array: each element is an array of events from a course
      const allEventsArray = processedEvents.map(course => course.events || []);
      console.log('Exporting courses:', processedEvents.length);
      console.log('Total event arrays:', allEventsArray.length);
      console.log('Events per course:', allEventsArray.map(arr => arr.length));
      console.log('Complete 2D events array:', JSON.stringify(allEventsArray, null, 2));

      await exportAllEvents(allEventsArray);

      // Note: redirect happens in exportAllEvents, so this may not execute
      setTimeout(handleClearData, 1000);
    } catch (error) {
      setIsExporting(false);
      alert('Failed to export events: ' + error.message);
      setImportStatus('error');
    }
  };

  // Copy bookmarklet code
  const handleCopyBookmarklet = async () => {
    const success = await copyText(bookmarkletCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };



  return (
    <div className="bookmarklet-page">
      {/* Export Loading Overlay */}
      {isExporting && (
        <div className="export-overlay">
          <div className="export-modal">
            <div className="export-spinner"></div>
            <h2>Exporting to Google Calendar...</h2>
            <p>Please wait while we create your calendar and add your events.</p>
            <p className="export-hint">You will be redirected to Google Calendar when complete.</p>
          </div>
        </div>
      )}

      <div className="button-group">
        <button type="button" className="skip-btn" onClick={() => navigate('/')}>Skip and Export to Google Calander</button>
      </div>
      <div className="bookmarklet-container">
        <h1>Install Uni-Cal Bookmarklet</h1>
        <p className="instructions">
          Import events from course outlines. Uses AI: result may vary.
        </p>

        {/* Loading Indicator */}
        {importStatus === 'processing' && (
          <div className="import-loading">
            <div className="loading-spinner"></div>
            <h2>Processing Course Data...</h2>
            <p className="loading-info">
              Extracting course information using AI. This may take a few seconds.
            </p>
          </div>
        )}

        {/* Import Preview Section */}
        {processedEvents.length > 0 && (
          <div className="import-preview">
            <h2>Schedule Preview ({processedEvents.length} Import{processedEvents.length !== 1 ? 's' : ''})</h2>
            <p className="preview-info">
              Review the course details below before exporting to your calendar:
            </p>
            <div className="courses-list">
              {allImportedCourses.map((course, idx) => (
                <div key={idx} className={`course-card ${course.title === 'MRU Schedule' ? 'mru-schedule-card' : ''}`}>
                  <h3>{course.title}</h3>
                  <div className="course-details">
                    {course.events && course.events.length > 0 ? (
                      <div className="detail-row">
                        <strong>Events:</strong>
                        <div className="events-container">
                          {course.events.slice(0, 4).map((event, eventIdx) => (
                            <div key={eventIdx} className="event-item">
                              {event.summary}
                            </div>
                          ))}
                          {course.events.length > 4 && (
                            <div className="event-item">
                              ... and {course.events.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="detail-row warning">
                        <strong>Events:</strong> <span>No events found</span>
                      </div>
                    )}
                    {course.location && (
                      <div className="detail-row">
                        <strong>Location:</strong> <span>{course.location}</span>
                      </div>
                    )}
                    {course.instructor && (
                      <div className="detail-row">
                        <strong>Source:</strong> <span>{course.instructor}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="preview-actions">
              <button className="export-btn" onClick={handleExportToCalendar}>
                Export {processedEvents.length} Course{processedEvents.length !== 1 ? 's' : ''} to Google Calendar
              </button>
              <button className="clear-btn" onClick={handleClearData}>
                Clear All ({processedEvents.length} course{processedEvents.length !== 1 ? 's' : ''})
              </button>
            </div>
          </div>
        )}

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
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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
        </div>

        <div className="how-to-use">
          <h2>Step 3: Import your Courses</h2>
          <ol>
            <li><strong>Find you ouline on D2L</strong> - Navigate to your course outline page in a new tab <a className="mru_link" href="https://learn.mru.ca/d2l/home" target="_blank" rel="noopener noreferrer">learn.mru.ca</a></li>
            <li><strong>Click the Bookmarklet</strong> - Once you have found the page with your outline, click the "Uni-Cal Importer" button in your bookmarks bar on the D2L page</li>
            <li><strong>Switch Back Here</strong> - Come back to this Uni-Cal tab, and tada! Your course is there!</li>
            <li><strong>Review & Repeat</strong> - Check the course details, and continue adding until you're done </li>
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

        <details className="troubleshooting">
          <summary>Having trouble? Try the manual method</summary>
          <div className="method-card secondary">
            <h3> Alternative: Manual Install</h3>
            <div className="step-content">
              <p className="step-description">If dragging doesn't work, copy the code manually:</p>
              <div className="code-section">
                <button
                  className={`copy-button ${copied ? 'copied' : ''}`}
                  onClick={handleCopyBookmarklet}
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
    </div>
  );
}

export default BookmarkletPage;
