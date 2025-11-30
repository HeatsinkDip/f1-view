# ⚡ Quick Performance Fix

## The Problem
Your website is slow because FastF1 downloads **50-200MB** of race data on the first request. This takes 2-5 minutes.

## ✅ Immediate Solution

Run this **ONE TIME** to pre-download the data:

```bash
cd "/Users/dipayon/IUB Official/Projects/f1-view/backend"
source ../.venv/bin/activate
python warm_cache.py
```

This will:
- Download Qatar GP data (2-5 minutes)
- Cache it locally
- **Future loads will be 2-5 seconds instead of 2-5 minutes!**

## After Running the Script

1. Restart your backend (Ctrl+C, then run again)
2. Refresh your browser (Cmd+Shift+R)
3. Data should load in **2-5 seconds** ✅

## Why This Happens

- **First load**: FastF1 downloads from F1 servers (slow)
- **Cached loads**: Reads from local disk (fast)
- This is a **one-time** download per race/session

## Alternative: Use 2024 Data

If 2025 data isn't available yet, the dashboard will automatically fall back to 2024 Qatar GP data (already cached if you ran the script).

---

**Run the warm_cache.py script now to fix the slow loading!**
