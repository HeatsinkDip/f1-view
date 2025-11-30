# Frontend Data Fetching Troubleshooting Guide

## Quick Diagnostic Checklist

### 1. Verify Backend is Running
Open: http://localhost:8001/docs
- ✅ Should see FastAPI documentation
- ❌ If not loading: Backend isn't running

### 2. Check Browser Console
1. Open http://localhost:3000
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Look for red errors
5. Go to **Network** tab
6. Refresh page
7. Check for failed requests (red)

### 3. Common Issues

**"Failed to fetch" errors:**
- Backend not running on port 8001
- CORS issue
- Wrong API URL in .env.local

**"Loading..." forever:**
- Backend is slow (FastF1 downloading data)
- First load: 30-60 seconds normal
- Check backend terminal for progress

**Old/cached data:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R
- Clear browser cache
- Restart frontend

### 4. Restart Services

**Backend:**
```bash
cd "/Users/dipayon/IUB Official/Projects/f1-view/backend"
source ../.venv/bin/activate
fastapi dev main.py --host 0.0.0.0 --port 8001
```

**Frontend:**
```bash
cd "/Users/dipayon/IUB Official/Projects/f1-view"
npm run dev
```

### 5. Environment Check

Verify `.env.local` contains:
```
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

## What to Report

Please provide:
1. What you see at http://localhost:8001/docs
2. Browser console errors (screenshot or copy)
3. Which data isn't loading (dashboard, session, etc.)
4. Backend terminal output
