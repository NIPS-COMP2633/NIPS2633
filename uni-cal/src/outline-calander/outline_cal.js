import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './outline_cal.css';
import { processImportData, STORAGE_KEY } from '../utils/dataProcessor';

function BookmarkletPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [importStatus, setImportStatus] = useState('listening'); // listening, received, processing, success, error
  const [importedData, setImportedData] = useState(null);
  const [processedEvents, setProcessedEvents] = useState([]);
  const [allImportedCourses, setAllImportedCourses] = useState([]); // Accumulate all course data
  const [receivedCourses, setReceivedCourses] = useState([]); // Accumulate course titles
  const [error, setError] = useState(null);
  const bookmarkletLinkRef = useRef(null);

  // Bookmarklet code - copies course data to clipboard
  const bookmarkletCode = `javascript:(function(){try{const htmlData={timestamp:Date.now(),url:window.location.href,html:document.body.innerHTML};navigator.clipboard.writeText(JSON.stringify(htmlData)).then(()=>{alert('Course data saved\\n \\n Switch to the Uni-Cal tab');}).catch(()=>{const textarea=document.createElement('textarea');textarea.value=JSON.stringify(htmlData);document.body.appendChild(textarea);textarea.select();document.execCommand('copy');document.body.removeChild(textarea);alert('Course data copied to clipboard!\\n\\n1. Switch to the Uni-Cal tab\\n2. Click "Import from Clipboard"');});}catch(error){alert('Error: '+error.message);}})();`;

  /* READABLE VERSION:
  (function() {
    try {
      const htmlData = {
        timestamp: Date.now(),
        url: window.location.href,
        html: document.body.innerHTML
      };
      navigator.clipboard.writeText(JSON.stringify(htmlData))
        .then(() => {
          alert('Course data copied to clipboard!\n\n1. Switch to the Uni-Cal tab\n2. Click "Import from Clipboard"');
        })
        .catch(() => {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = JSON.stringify(htmlData);
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('Course data copied to clipboard!\n\n1. Switch to the Uni-Cal tab\n2. Click "Import from Clipboard"');
        });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  })();
  */


  // Set href using ref to avoid React warning about javascript: URLs
  useEffect(() => {
    if (bookmarkletLinkRef.current) {
      bookmarkletLinkRef.current.href = bookmarkletCode;
    }
  }, [bookmarkletCode]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check if a course is a duplicate
  const isDuplicateCourse = (newCourse) => {
    return allImportedCourses.some(existingCourse => {
      // Match by title and code combination
      const titleMatch = existingCourse.title.toLowerCase().trim() === newCourse.title.toLowerCase().trim();
      const codeMatch = existingCourse.code?.toLowerCase().trim() === newCourse.code?.toLowerCase().trim();
      
      // Consider it a duplicate if both title and code match (or if code is missing, just title)
      if (newCourse.code && existingCourse.code) {
        return titleMatch && codeMatch;
      }
      return titleMatch;
    });
  };

  // Auto-check clipboard when window gains focus
  useEffect(() => {
    let lastClipboardCheck = null;

    const handleWindowFocus = async () => {
      // Only auto-check when in listening state (ready for import)
      if (importStatus !== 'listening' && importStatus !== 'success') {
        return;
      }

      try {
        // Try to read clipboard automatically
        const clipboardText = await navigator.clipboard.readText();
        
        // Don't process if clipboard is empty or unchanged
        if (!clipboardText || clipboardText === lastClipboardCheck) {
          return;
        }

        lastClipboardCheck = clipboardText;

        // Try to parse as JSON
        const data = JSON.parse(clipboardText);
        
        // Check if it looks like our bookmarklet data
        if (data.html && data.url && data.timestamp) {
          console.log('Auto-detected course data in clipboard!');
          
          // Automatically trigger import
          setError(null);
          setImportStatus('processing');
          parseAndProcessHTML(data.html, data.url);
        }
      } catch (error) {
        // Silently fail - clipboard might not have valid data or permission denied
        // User can still use manual import button
        console.log('Auto-clipboard check skipped:', error.message);
      }
    };

    // Listen for window focus events
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [importStatus]);

  // Handle importing data from clipboard
  const handleImportFromClipboard = async () => {
    try {
      setError(null);
      setImportStatus('processing');
      
      // Read from clipboard
      const clipboardText = await navigator.clipboard.readText();
      
      if (!clipboardText) {
        throw new Error('Clipboard is empty. Make sure you clicked the bookmarklet first.');
      }
      
      // Parse the JSON data
      const data = JSON.parse(clipboardText);
      
      // Validate it has the expected structure
      if (!data.html || !data.url || !data.timestamp) {
        throw new Error('Invalid data format. Make sure you copied data from the bookmarklet.');
      }
      
      console.log('Received HTML from clipboard:', data.url);
      parseAndProcessHTML(data.html, data.url);
      
    } catch (error) {
      console.error('Error importing from clipboard:', error);
      if (error.message.includes('Clipboard is empty') || error.message.includes('Invalid data format')) {
        setError(error.message);
      } else if (error instanceof SyntaxError) {
        setError('Invalid data in clipboard. Make sure you copied from the bookmarklet.');
      } else {
        setError('Failed to read from clipboard: ' + error.message);
      }
      setImportStatus('error');
    }
  };

  // Clear imported data and reset state
  const handleClearData = () => {
    setImportStatus('listening');
    setImportedData(null);
    setProcessedEvents([]);
    setAllImportedCourses([]);
    setReceivedCourses([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Manual check for data (for testing purposes)
  const handleManualCheck = () => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const rawData = JSON.parse(storedData);
        processImportedData(rawData);
      } catch (err) {
        setError('Failed to parse stored data: ' + err.message);
        setImportStatus('error');
      }
    } else {
      alert('No data found in localStorage. Make sure the bookmarklet has been run on a D2L page.');
    }
  };

  // Handle export to Google Calendar (placeholder for now)
  const handleExportToCalendar = async () => {
    try {
      setImportStatus('processing');
      
      // TODO: Implement Google Calendar API integration
      // For now, just download as JSON
      const dataStr = JSON.stringify(processedEvents, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'uni-cal-events.json';
      link.click();
      URL.revokeObjectURL(url);
      
      alert('Events exported! Google Calendar integration coming soon.\n\nFor now, events have been downloaded as JSON.');
      
      // Clear data after successful export
      setTimeout(handleClearData, 1000);
    } catch (error) {
      setError('Failed to export events: ' + error.message);
      setImportStatus('error');
    }
  };

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

  // Parse HTML and extract course data
  const parseAndProcessHTML = (html, sourceUrl) => {
    try {
      setImportStatus('received');
      setError(null);

      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Extract course data from the HTML
      const courseTitle = tempDiv.querySelector('h1')?.textContent?.trim() || 'Unnamed Course';
      const courseCode = tempDiv.querySelector('.d2l-course-code, .course-code')?.textContent?.trim() || '';
      
      let scheduleData = {
        code: courseCode || 'UNKNOWN',
        title: courseTitle,
        days: '',
        startTime: '',
        endTime: '',
        location: '',
        instructor: ''
      };

      const pageText = tempDiv.innerText || tempDiv.textContent;

      console.log('Extracted from HTML:', {
        title: courseTitle,
        code: courseCode,
        pageLength: pageText.length
      });

      // Extract time (e.g., "1:00 PM - 2:30 PM")
      const timeMatch = pageText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      if (timeMatch) {
        scheduleData.startTime = timeMatch[1];
        scheduleData.endTime = timeMatch[2];
      }

      // Extract days
      const daysMatch = pageText.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun|M|T|W|R|F|S|U)/gi);
      if (daysMatch && daysMatch.length > 0) {
        const dayMap = {
          'sunday': '1', 'sun': '1', 'u': '1',
          'monday': '2', 'mon': '2', 'm': '2',
          'tuesday': '3', 'tue': '3', 't': '3',
          'wednesday': '4', 'wed': '4', 'w': '4',
          'thursday': '5', 'thu': '5', 'r': '5',
          'friday': '6', 'fri': '6', 'f': '6',
          'saturday': '7', 'sat': '7', 's': '7'
        };
        const uniqueDays = new Set();
        daysMatch.forEach(day => {
          const normalized = day.toLowerCase();
          if (dayMap[normalized]) {
            uniqueDays.add(dayMap[normalized]);
          }
        });
        scheduleData.days = Array.from(uniqueDays).sort().join(' ');
      }

      // Extract location
      const locationMatch = pageText.match(/(?:Room|Location|Building)\s*:?\s*([A-Z]{1,3}\s*\d{1,4}[A-Z]?)/i);
      if (locationMatch) {
        scheduleData.location = locationMatch[1];
      }

      // Extract instructor
      const instructorMatch = pageText.match(/(?:Instructor|Professor|Teacher)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
      if (instructorMatch) {
        scheduleData.instructor = instructorMatch[1];
      }

      console.log('Final schedule data:', scheduleData);

      // Warn if critical data is missing
      if (!scheduleData.startTime || !scheduleData.endTime) {
        console.warn('No schedule times found in HTML. Course will be imported but may need manual time entry.');
      }

      // Create the import data structure
      const importData = {
        timestamp: Date.now(),
        source: sourceUrl,
        timezone: 'America/Edmonton',
        courses: [scheduleData]
      };

      // Process using existing pipeline
      processImportedData(importData);

    } catch (error) {
      console.error('Error parsing HTML:', error);
      setError('Failed to parse course data: ' + error.message);
      setImportStatus('error');
    }
  };

  // Process imported data
  const processImportedData = (rawData) => {
    try {
      setImportStatus('received');
      setError(null);
      
      setImportedData(rawData);
      
      // Check for duplicates before adding
      if (rawData.courses && rawData.courses.length > 0) {
        const newCourses = rawData.courses.filter(course => {
          const isDuplicate = isDuplicateCourse(course);
          if (isDuplicate) {
            console.warn('Duplicate course detected and skipped:', course.title, course.code);
          }
          return !isDuplicate;
        });
        
        // If all courses are duplicates, silently skip
        if (newCourses.length === 0) {
          console.log('All courses already imported, skipping...');
          setImportStatus('listening');
          return;
        }
        
        // Add only non-duplicate courses
        setAllImportedCourses(prev => [...prev, ...newCourses]);
        
        // Add course titles to the received list
        const newCourseTitles = newCourses.map(c => ({
          title: c.title || c.code || 'Unnamed Course',
          code: c.code,
          timestamp: rawData.timestamp
        }));
        setReceivedCourses(prev => [...prev, ...newCourseTitles]);
      }
      
      // Process the data
      setImportStatus('processing');
      const result = processImportData(rawData);
      
      if (result.success) {
        setProcessedEvents(prev => [...prev, ...result.events]);
        setImportStatus('success');
        
        // Reset to listening after 2 seconds to allow importing more courses
        setTimeout(() => {
          if (importStatus === 'success') {
            setImportStatus('listening');
          }
        }, 2000);
        
        // Optional: Show browser notification if tab is not focused
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Uni-Cal: Course Data Received', {
            body: `Successfully imported ${result.courseCount} course(s)`,
            icon: '/favicon.ico'
          });
        }
      } else {
        setError(result.error || 'Failed to process course data');
        setImportStatus('error');
      }
    } catch (err) {
      console.error('Error processing import data:', err);
      setError('Failed to parse course data: ' + err.message);
      setImportStatus('error');
    }
  };

  return (
    <div className="bookmarklet-page">
      <div className="button-group">
        <button type="button" className="skip-btn" onClick={() => navigate('/')}>Skip This Step</button>
      </div>
      <div className="bookmarklet-container">
        <h1>Install Uni-Cal Bookmarklet</h1>
        <p className="instructions">
          Install in 30 seconds! Just drag a button to your bookmarks bar.
        </p>

        {/* Import Preview Section */}
        {importedData && processedEvents.length > 0 && (
          <div className="import-preview">
            <h2>Course Preview ({processedEvents.length} Course{processedEvents.length !== 1 ? 's' : ''})</h2>
            <p className="preview-info">
              Review the course details below before exporting to your calendar:
            </p>
            <div className="courses-list">
              {allImportedCourses.map((course, idx) => (
                <div key={idx} className="course-card">
                  <h3>{course.title}</h3>
                  <div className="course-details">
                    <div className="detail-row">
                      <strong>Code:</strong> <span>{course.code}</span>
                    </div>
                    {course.days && (
                      <div className="detail-row">
                        <strong>Days:</strong> <span>{course.days}</span>
                      </div>
                    )}
                    {course.startTime && course.endTime && (
                      <div className="detail-row">
                        <strong>Time:</strong> <span>{course.startTime} - {course.endTime}</span>
                      </div>
                    )}
                    {(!course.startTime || !course.endTime) && (
                      <div className="detail-row warning">
                        <strong>Time:</strong> <span>Not found - will use default (9 AM - 10 AM)</span>
                      </div>
                    )}
                    {course.location && (
                      <div className="detail-row">
                        <strong>Location:</strong> <span>{course.location}</span>
                      </div>
                    )}
                    {course.instructor && (
                      <div className="detail-row">
                        <strong>Instructor:</strong> <span>{course.instructor}</span>
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
            <li><strong>Find you ouline on D2L</strong> - Navigate to your course outline page in a new tab (<a href="https://learn.mru.ca/d2l/home" target="_blank" rel="noopener noreferrer">learn.mru.ca</a>)</li>
            <li><strong>Click the Bookmarklet</strong> - Once you are at the page with your outline, click the "Uni-Cal Importer" button in your bookmarks bar on the D2L page</li>
            <li><strong>Switch Back Here</strong> - Come back to this Uni-Cal tab, and tada! Your course is there!</li>
            <li><strong>Review & Repear</strong> - Check the course details, and continue adding until you're done </li>
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
    </div>
  );
}

export default BookmarkletPage;
