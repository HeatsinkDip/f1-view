# Session Page Troubleshooting Guide

## Testing the "Full Analysis" Feature

The "View Full Analysis" button should take you to:
```
/session/2025/Lusail/Race
```

### Quick Test

1. **Open your browser** to http://localhost:3000
2. **Go to Dashboard**
3. **Click "View Full Analysis"** on the Last Race card
4. **Expected**: Session page loads with telemetry data
5. **If it doesn't work**: Check below

---

## Common Issues & Fixes

### Issue 1: Page Loads but Shows "No Data"
**Cause**: Using 2025 data (season hasn't started)
**Fix**: Use 2024 data instead

Try this URL directly:
```
http://localhost:3000/session/2024/Lusail/Race
```

### Issue 2: Page Doesn't Load at All
**Cause**: Frontend not running or crashed
**Fix**: Check terminal for errors, restart if needed

### Issue 3: Infinite Loading
**Cause**: Backend downloading data (first time)
**Fix**: Wait 30-60 seconds, or run `warm_cache.py` (already done ✅)

### Issue 4: Error Message Shown
**Cause**: API connection issue
**Fix**: 
1. Check backend is running on port 8001
2. Check `.env.local` has correct API URL
3. Hard refresh browser (Cmd+Shift+R)

---

## Manual Test Commands

Test backend endpoints:
```bash
# Test session data
curl http://localhost:8001/api/session/2024/Lusail/Race

# Test drivers
curl http://localhost:8001/api/session/2024/Lusail/Race/drivers

# Test track data
curl http://localhost:8001/api/track/2024/Lusail/Race
```

All should return JSON data.

---

## What to Check in Browser

1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for red errors
4. Go to **Network** tab
5. Refresh page
6. Check if API calls are failing (red)

---

## Expected Behavior

When working correctly, the session page should show:
- ✅ Track map visualization
- ✅ Driver selection dropdown
- ✅ Telemetry charts (speed, throttle, brake)
- ✅ Weather data
- ✅ Strategy predictor
- ✅ Tyre analysis
- ✅ Team radio
- ✅ Race control messages

---

## Quick Fix

If nothing works, try:
1. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear cache**: Open in Incognito/Private mode
3. **Restart frontend**: Ctrl+C in terminal, then `npm run dev`
4. **Check URL**: Make sure it's `/session/2024/Lusail/Race` (not 2025)

---

## Need More Help?

Please provide:
1. What URL are you trying to access?
2. What do you see on the page?
3. Any error messages in browser console?
4. Screenshot if possible
