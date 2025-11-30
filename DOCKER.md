# Docker Deployment Guide

## Quick Start

### Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:8001`

## Individual Services

### Backend Only

```bash
cd backend
docker build -t f1-view-backend .
docker run -p 8001:8001 f1-view-backend
```

### Frontend Only

```bash
docker build -t f1-view-frontend .
docker run -p 3000:3000 f1-view-frontend
```

## Production Deployment

### Using Docker Compose

1. Update `docker-compose.yml` with your domain
2. Configure environment variables
3. Run:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

Create a `.env` file:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8001

# Backend
PORT=8001
ALLOWED_ORIGINS=http://localhost:3000
FASTF1_CACHE_DIR=/app/cache
```

## Volumes

FastF1 cache is persisted in a Docker volume to avoid re-downloading data.

## Scaling

To scale the backend:

```bash
docker-compose up -d --scale backend=3
```

Add a load balancer (nginx) in front for production.
