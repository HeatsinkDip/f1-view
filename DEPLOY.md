# F1 View - Deployment Guide

## 🚀 Quick Deploy

This guide will help you deploy F1 View to production.

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) - **RECOMMENDED**

#### Frontend (Vercel)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://your-backend.railway.app`)
6. Deploy!

#### Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select the `backend` directory
4. Railway will auto-detect Python
5. Add environment variables:
   - `PORT`: 8001
   - `ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://your-app.vercel.app`)
6. Deploy!

### Option 2: Docker (Self-Hosted)

See `DOCKER.md` for containerized deployment.

### Option 3: Traditional VPS (DigitalOcean, AWS, etc.)

See `VPS_DEPLOY.md` for manual server setup.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Backend (.env)
```
PORT=8001
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
FASTF1_CACHE_DIR=/tmp/fastf1_cache
```

## Production Checklist

- [ ] Update API URL in frontend environment
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Enable caching for FastF1 data
- [ ] Monitor backend performance
- [ ] Set up error tracking (optional: Sentry)

## Post-Deployment

1. Test all features with 2025 data
2. Verify countdown timer accuracy
3. Check telemetry loading performance
4. Ensure mobile responsiveness

## Support

For issues, check the main README or create a GitHub issue.
