# Uni-Cal Bookmarklet - Quick Testing Guide

## Pre-Testing Setup

1. **Start the Development Server**
   ```bash
   cd uni-cal
   npm start
   ```
   - App should open at http://localhost:3000
   - Navigate to `/bookmarklet` page

2. **Install the Bookmarklet**
   - Show your bookmarks bar (Ctrl+Shift+B / Cmd+Shift+B)
   - Drag the "Uni-Cal Importer" button to your bookmarks bar
   - Verify it appears in bookmarks

## Test Scenarios

### Test 1: Basic Data Extraction

**Steps:**
1. Keep Uni-Cal tab open at `/bookmarklet`
2. Open new tab and go to a D2L course outline page
3. Click the "Uni-Cal Importer" bookmarklet
4. You should see an alert with course data
5. Switch back to Uni-Cal tab

**Expected Results:**
- ✅ Status changes from "Listening" to "Received" to "Processing" to "Success"
- ✅ Course preview appears with course details
- ✅ Browser notification appears (if tab was in background)

**What to Check:**
- Course title extracted correctly
- Course code visible
- Time format parsed (e.g., "1:00 PM - 2:30 PM")
- Location shown (if available)
- Days of week identified

### Test 2: Error Handling - Wrong Page

**Steps:**
1. Open any non-D2L website (e.g., google.com)
2. Click the bookmarklet

**Expected Results:**
- ✅ Alert shows warning: "Please navigate to your D2L course outline page..."
- ✅ No data stored in localStorage
- ✅ Uni-Cal tab status remains "Listening"

### Test 3: Clear and Reset

**Steps:**
1. Complete Test 1 to import course data
2. Click "Clear & Start Over" button

**Expected Results:**
- ✅ Status returns to "Listening"
- ✅ Preview section disappears
- ✅ localStorage cleared (check in DevTools)

### Test 4: Export to Calendar

**Steps:**
1. Complete Test 1 to import course data
2. Click "Add to Google Calendar" button

**Expected Results:**
- ✅ JSON file downloads (temporary - until Google integration complete)
- ✅ Alert shows export confirmation
- ✅ Data clears after 1 second

### Test 5: Multiple Course Import

**Steps:**
1. Start at `/bookmarklet` page
2. Import first course from D2L (Test 1)
3. WITHOUT clearing, go to another course outline
4. Click bookmarklet again
5. Switch back to Uni-Cal

**Expected Results:**
- ⚠️ Currently: New course REPLACES old course (by design)
- ✅ Preview shows latest course data
- ✅ Status updates correctly

**Note:** Future enhancement could queue multiple courses

### Test 6: Browser Notifications

**Steps:**
1. Open `/bookmarklet` page
2. Allow notifications when prompted
3. Import course while Uni-Cal tab is in BACKGROUND (don't focus it)

**Expected Results:**
- ✅ Browser notification appears
- ✅ Notification shows course count
- ✅ Clicking notification doesn't error

### Test 7: Cross-Browser Testing

**Browsers to Test:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**For Each Browser:**
1. Install bookmarklet (drag & drop)
2. Run Test 1 (basic import)
3. Verify localStorage events work
4. Check console for errors

## Debugging Tools

### Check localStorage

Open DevTools Console and run:
```javascript
localStorage.getItem('uni-cal-import-data')
```

Should show JSON data after bookmarklet click.

### Monitor Storage Events

In Uni-Cal tab console:
```javascript
window.addEventListener('storage', (e) => {
  console.log('Storage event:', e.key, e.newValue);
});
```

### Clear localStorage Manually

```javascript
localStorage.removeItem('uni-cal-import-data');
```

## Common Issues & Solutions

### Issue: Bookmarklet doesn't extract data

**Check:**
- Is URL `learn.mru.ca/d2l`?
- Are you on a course outline page (not home page)?
- Check browser console for JavaScript errors

**Fix:**
- D2L HTML structure may have changed
- Update selectors in bookmarklet code
- Add more flexible parsing logic

### Issue: Uni-Cal doesn't receive data

**Check:**
- Is Uni-Cal tab still open?
- Check if localStorage is enabled
- Look for CORS or security errors

**Fix:**
- Refresh Uni-Cal page
- Check browser privacy settings
- Ensure both pages are on same domain (localhost)

### Issue: Status stuck on "Processing"

**Check:**
- Browser console for errors
- Data format in localStorage

**Fix:**
- Invalid data structure - check validation
- Add more robust error handling

## Next Steps After Testing

Once basic tests pass:

1. **Test with Real D2L Pages**
   - Use actual MRU D2L course outlines
   - Verify data extraction accuracy
   - Adjust parsing logic as needed

2. **Configure Google Calendar API**
   - Follow setup in BOOKMARKLET_GUIDE.md
   - Get OAuth credentials
   - Test full export flow

3. **Performance Testing**
   - Test with multiple courses
   - Verify memory doesn't leak
   - Check event listener cleanup

4. **Security Testing**
   - Test XSS prevention
   - Verify data sanitization
   - Check for injection vulnerabilities

## Test Data Template

For manual testing, you can inject test data directly:

```javascript
// Run in browser console on /bookmarklet page
const testData = {
  timestamp: Date.now(),
  source: 'test',
  timezone: 'America/Edmonton',
  courses: [{
    code: 'TEST101',
    title: 'Test Course',
    days: '2 4',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    location: 'Room 123',
    instructor: 'Dr. Test'
  }]
};

localStorage.setItem('uni-cal-import-data', JSON.stringify(testData));
// Manually trigger storage event (won't work in same tab)
// Open a new tab and set it there to test
```

## Reporting Issues

When reporting bugs, include:
- Browser name and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshot of issue

---

**Good luck testing!** 🚀
