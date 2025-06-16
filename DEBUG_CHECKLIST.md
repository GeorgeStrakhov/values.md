# Values.md Pipeline Debug Checklist

## Live Testing Protocol

### 1. Browser Setup
- Open browser dev tools console (F12)
- Navigate to the live values.md site
- Keep console open throughout testing

### 2. Complete Dilemma Flow
Start from `/explore` and complete dilemmas while watching for these console messages:

#### During Dilemma Completion:
```
💾 saveResponsesToDatabase called with: {sessionId, responsesCount, responses}
📤 Sending to /api/responses: [payload data]
✅ Responses saved to database successfully: [result]
```

#### On Results Page Load:
```
🔍 Results page - hydration complete, checking data: {sessionId, responsesCount, responses}
```

### 3. Error Indicators
Watch for these error patterns:

#### Store Issues:
- `⚠️ No responses to save to database`
- `❌ Failed to save responses to database: [status] [error]`
- `💥 Error saving responses to database: [error]`

#### Results Page Issues:
- `No session found. Please complete the dilemmas first.`
- Missing sessionId or empty responses array in hydration log

### 4. Success Indicators
- Database save logs show successful API calls
- Results page shows sessionId and response count > 0
- VALUES.md file generates without errors
- Enhanced features (chat, experiment) work properly

### 5. Common Failure Points
1. **Store Not Saving**: No `saveResponsesToDatabase` calls logged
2. **API Errors**: Network failures or 500 errors from `/api/responses`
3. **Hydration Issues**: Results page processing before store loads
4. **Session Mismatch**: Different sessionIds between store and API

### 6. Quick Fixes to Try
- **Clear localStorage**: If store seems corrupted
- **Hard refresh**: For hydration timing issues  
- **Check network tab**: For API call failures
- **Disable browser extensions**: For interference

### 7. Report Format
When reporting issues, include:
- Console log output (copy exact messages)
- Network tab showing API calls
- Current URL when error occurs
- Browser and any extensions used