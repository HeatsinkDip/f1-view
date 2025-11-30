# Production Environment Variables

## For Vercel Deployment

Set this in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://f1-view-production.up.railway.app/api
```

Make sure to set it for:
- ✅ Production
- ✅ Preview
- ✅ Development

## For Local Development

Your `.env.local` file should have:

```
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

## How It Works

The frontend will automatically use:
- **Production (Vercel)**: Railway backend URL
- **Local**: localhost backend URL

No code changes needed - it's all environment-based!
