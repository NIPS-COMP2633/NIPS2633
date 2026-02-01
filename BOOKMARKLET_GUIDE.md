# Uni-Cal Bookmarklet Implementation Guide

## Overview

The Uni-Cal bookmarklet allows users to import course schedules from D2L (Desire2Learn) directly into their Google Calendar with a single click. This implementation uses cross-tab communication via localStorage and browser storage events.

## Architecture

### Cross-Tab Communication Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   D2L Tab       │         │  Clipboard API   │         │   Uni-Cal Tab   │
│  (Course Page)  │────────▶│  (Data Bridge)   │────────▶│  (React App)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
      │                              │                            │
      │ 1. User clicks bookmarklet   │                            │
      │ 2. Extract course data        │                            │
      │ 3. Copy to clipboard ────────▶                             │
      │ 4. Alert user                 │                            │
      │                              │                            │ 5. User clicks Import
      │                              │ 6. Read clipboard ◀────────│
      │                              │                            │ 7. Process data
      │                              │                            │ 8. Display preview
      │                              │                            │ 9. Export to GCal
```

### Key Components

1. **Bookmarklet Script** (`outline_cal.js`)
   - Injected JavaScript that runs on D2L pages
   - Extracts course information (title, code, time, location, etc.)
   - Copies data to clipboard using Clipboard API with fallback
   - Provides user feedback via browser alerts

2. **Data Processor** (`utils/dataProcessor.js`)
   - Validates incoming data structure
   - Sanitizes HTML content to prevent XSS
   - Transforms D2L data to Google Calendar event format
   - Handles day mapping (numeric to RRULE format)

3. **React UI** (`outline_cal.js` component)
   - Provides "Import from Clipboard" button
   - Reads data from clipboard when user clicks import
   - Displays real-time status indicators
   - Shows course preview before import
   - Manages state and cleanup

4. **Google Calendar Integration** (`utils/googleCalendar.js`)
   - OAuth 2.0 authentication flow
   - Batch event creation for efficiency
   - Error handling and retry logic

## Data Flow Schema

### Storage Data Format

```json
{
  "timestamp": 1706745600000,
  "source": "https://learn.mru.ca/d2l/le/content/...",
  "timezone": "America/Edmonton",
  "courses": [
    {
      "code": "COMP2633",
      "title": "Software Engineering",
      "days": "2 4 6",
      "startTime": "1:00 PM",
      "endTime": "2:30 PM",
      "location": "MC 123",
      "instructor": "Dr. Smith",
      "startDate": null,
      "endDate": null
    }
  ]
}
```

### Google Calendar Event Format

```json
{
  "summary": "Software Engineering",
  "description": "Course code: COMP2633\nInstructor: Dr. Smith",
  "location": "MC 123",
  "start": {
    "dateTime": "2026-02-01T13:00:00-07:00",
    "timeZone": "America/Edmonton"
  },
  "end": {
    "dateTime": "2026-02-01T14:30:00-07:00",
    "timeZone": "America/Edmonton"
  },
  "recurrence": [
    "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"
  ]
}
```

## Security Considerations

### Implemented Safeguards

1. **XSS Prevention**
   - All user-generated content is sanitized using `sanitizeHTML()`
   - DOM manipulation uses `textContent` instead of `innerHTML`

2. **Data Validation**
   - Schema validation before processing
   - Type checking for all required fields
   - Error handling for malformed data

3. **Storage Security**
   - Data cleared after successful import
   - No sensitive credentials stored
   - localStorage scoped to same origin only

4. **OAuth Security**
   - Uses Google's official OAuth 2.0 flow
   - Tokens managed by Google Identity Services
   - Scopes limited to calendar.events only

## Setup Instructions

### For Users

1. Navigate to `/bookmarklet` page in Uni-Cal app
2. Drag the "Uni-Cal Importer" button to bookmarks bar
3. Open D2L course outline in new tab
4. Click bookmarklet in bookmarks bar (data copied to clipboard)
5. Switch back to Uni-Cal tab
6. Click "Import from Clipboard" button
7. Review course data and click "Add to Google Calendar"

### For Developers

#### Prerequisites
- Node.js 14+ and npm
- Google Cloud Console account
- D2L access for testing

#### Installation

```bash
cd uni-cal
npm install
```

#### Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
5. Copy Client ID and API Key
6. Update `uni-cal/src/utils/googleCalendar.js`:

```javascript
const GOOGLE_CONFIG = {
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  apiKey: 'YOUR_API_KEY',
  // ... rest of config
};
```

#### Running Development Server

```bash
npm start
# Opens http://localhost:3000
```

## Testing Guide

### Manual Testing Checklist

- [ ] Bookmarklet installation (drag & drop)
- [ ] Bookmarklet execution on D2L page
- [ ] Data extraction accuracy
- [ ] Cross-tab communication
- [ ] Data preview display
- [ ] Google Calendar authorization
- [ ] Event creation
- [ ] Error handling (wrong page, no data, etc.)
- [ ] State cleanup after import
- [ ] Browser notifications

### Browser Compatibility

Test on:
- ✅ Chrome/Edge (Chromium-based)
- ✅ Firefox
- ✅ Safari (note: may have stricter localStorage limits)

### Known Limitations

1. **D2L HTML Structure**: The bookmarklet uses pattern matching for course data extraction. D2L's HTML structure may vary between institutions or change over time.

2. **Storage Events**: Storage events don't fire in the same tab that makes the change - this is by design and why cross-tab communication is needed.

3. **Safari Restrictions**: Safari has stricter security policies for localStorage in certain contexts.

## Troubleshooting

### Bookmarklet doesn't work on D2L

**Symptoms**: Clicking bookmarklet shows error or does nothing

**Solutions**:
1. Verify you're on a D2L course outline page (URL contains `learn.mru.ca/d2l`)
2. Check browser console for errors (F12)
3. Ensure JavaScript is enabled
4. Try manual bookmark method if drag-and-drop failed

### Data not appearing in Uni-Cal tab

**Symptoms**: Bookmarklet runs but Uni-Cal doesn't show data after clicking Import

**Solutions**:
1. Verify the bookmarklet showed "copied to clipboard" confirmation
2. Make sure you clicked "Import from Clipboard" button
3. Check browser console for clipboard permission errors (F12)
4. Try granting clipboard permissions to the site
5. For older browsers, ensure clipboard API is supported

### Google Calendar export fails

**Symptoms**: Preview works but export gives error

**Solutions**:
1. Verify Google API credentials are configured
2. Check OAuth consent screen is published
3. Ensure user granted calendar permissions
4. Check browser console for specific error messages

### Course times not parsing correctly

**Symptoms**: Events show wrong times or dates

**Solutions**:
1. Check D2L page format - may need to adjust parsing logic
2. Verify timezone setting (default: America/Edmonton)
3. Review extracted data in preview before export

## Architecture Decisions

### Why Clipboard API?

**Alternatives Considered**:
- **localStorage + Storage Events**: Doesn't work across different domains (D2L vs localhost)
- **BroadcastChannel API**: Better API but limited browser support
- **SharedWorker**: More complex, not widely supported
- **Server-based polling**: Requires backend, adds latency
- **PostMessage**: Requires window reference, doesn't work across separate tabs

**Why Clipboard API won**:
- ✅ Universal browser support (with fallback)
- ✅ Works across any domains
- ✅ Simple and reliable
- ✅ No backend required
- ✅ Privacy-preserving (data never leaves user's device)
- ✅ Minimal user friction (one extra click)

### Why not direct API calls from bookmarklet?

Bookmarklets run in the context of the D2L page, which would require:
- Exposing API keys in the bookmarklet code (security risk)
- Handling CORS issues
- Maclipboard bridge pattern keeps credentials secure in the Uni-Cal app and avoids cross-origin issues entirely

The localStorage bridge pattern keeps credentials secure in the Uni-Cal app.

## Future Enhancements

### Planned Features
- [ ] Full Google Calendar OAuth integration
- [ ] Support for multiple semesters/terms
- [ ] Duplicate detection
- [ ] Edit course details before import
- [ ] Export to .ics file (universal calendar format)
- [ ] Support for other universities' LMS systems

### Potential Improvements
- Websocket-based real-time sync (if backend added)
- Chrome extension version (more powerful than bookmarklet)
- Mobile app integration
- Automated schedule updates

## Contributing

When contributing to the bookmarklet feature:

1. Test on all major browsers
2. Validate data sanitization for any new fields
3. Update this documentation
4. Add error handling for edge cases
5. Consider security implications

## License

See main repository LICENSE file.

## Support

For issues or questions:
- Check troubleshooting section above
- Review browser console for errors
- Open GitHub issue with details

---

**Last Updated**: February 1, 2026
**Version**: 1.0.0
