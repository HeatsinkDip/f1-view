# 🚀 Quick Start Guide

## Start Both Services (2 Terminals)

### Terminal 1: Backend
```bash
cd "/Users/dipayon/IUB Official/Projects/f1-view/backend"
source ../.venv/bin/activate
fastapi dev main.py --host 0.0.0.0 --port 8001
```

**Wait for:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

### Terminal 2: Frontend
```bash
cd "/Users/dipayon/IUB Official/Projects/f1-view"
npm run dev
```

**Wait for:**
```
✓ Ready in 1-2s
- Local: http://localhost:3000
```

## Open Your App
http://localhost:3000

## Troubleshooting

**Backend won't start?**
```bash
# Kill any stuck processes
lsof -ti:8001 | xargs kill -9
# Then try starting again
```

**Frontend won't start?**
```bash
# Kill any stuck processes
lsof -ti:3000 | xargs kill -9
# Then try starting again
```

**Dashboard not loading data?**
- Wait 30-60 seconds on first load (FastF1 downloading data)
- Check backend terminal for progress
- Hard refresh browser: Cmd+Shift+R

## Speed Up First Load

Run this ONCE to pre-download data:
```bash
cd "/Users/dipayon/IUB Official/Projects/f1-view/backend"
source ../.venv/bin/activate
python warm_cache.py
```

After this, data loads in 2-5 seconds instead of minutes!
