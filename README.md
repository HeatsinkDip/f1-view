# F1 View 🏎️

A premium Formula 1 data visualization and telemetry analysis platform built with Next.js and FastAPI.

![F1 View](https://img.shields.io/badge/F1-View-dc2626?style=for-the-badge&logo=formula1)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)

## ✨ Features

- **Live Race Data**: Real-time F1 schedule, standings, and race information for the 2025 season
- **Telemetry Analysis**: Interactive track maps with speed heatmaps and driver comparisons
- **Mission Control Dashboard**: Premium dark-mode interface with F1 broadcast aesthetics
- **Smart Session Detection**: Automatically displays the latest available data (Qualifying/Race)
- **Countdown Timer**: Accurate race start countdown using actual session times
- **Circuit Guide**: Interactive track maps with sector analysis and DRS zones
- **Advanced Widgets**: Strategy predictor, weather radar, tyre analysis, team radio, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd f1-view
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

4. **Start the backend**
```bash
# From the backend directory
fastapi dev main.py --host 0.0.0.0 --port 8001
```

5. **Start the frontend**
```bash
# From the root directory
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

## 📦 Deployment

### Quick Deploy Options

#### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Deploy to [Vercel](https://vercel.com) with one click
- **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)
- See [DEPLOY.md](./DEPLOY.md) for detailed instructions

#### Option 2: Docker
```bash
docker-compose up -d
```
See [DOCKER.md](./DOCKER.md) for container deployment

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Backend (.env)**
```env
PORT=8001
ALLOWED_ORIGINS=http://localhost:3000
FASTF1_CACHE_DIR=/tmp/fastf1_cache
```

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Data Source**: FastF1 (Official F1 telemetry library)
- **Caching**: In-memory session cache
- **CORS**: Configured for cross-origin requests

## 📖 Documentation

- [Deployment Guide](./DEPLOY.md) - Complete deployment instructions
- [Docker Guide](./DOCKER.md) - Containerized deployment
- [API Documentation](http://localhost:8001/docs) - Interactive API docs (when backend is running)

## 🎨 Features Breakdown

### Dashboard
- Next race countdown with accurate timing
- Latest race results and highlights
- Driver standings and constructor standings
- Circuit guide with interactive track map
- Rivalry watch and driver comparisons

### Session Analysis
- Full telemetry replay with playback controls
- Speed, throttle, and brake traces
- Driver vs driver comparisons
- Strategy predictor and weather radar
- Team radio highlights
- Tyre degradation analysis

### Smart Data Handling
- Automatically falls back to Qualifying data when Race hasn't started
- Handles future sessions gracefully with "Session Upcoming" screen
- Efficient caching to minimize API calls

## 🔧 Development

### Project Structure
```
f1-view/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   └── lib/              # Utilities and API client
├── backend/
│   └── main.py           # FastAPI server
├── public/               # Static assets
└── docker-compose.yml    # Docker configuration
```

### Key Commands

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server

# Backend
fastapi dev main.py  # Development server
uvicorn main:app     # Production server
```

## 🐛 Known Issues

- FastF1 data availability depends on official F1 timing data
- First load may be slow while caching session data
- Some historical races may have incomplete telemetry

## 📝 License

This project is for educational and personal use. F1 data is provided by FastF1 and is subject to Formula 1's terms of use.

## 🙏 Acknowledgments

- [FastF1](https://github.com/theOehrly/Fast-F1) - F1 telemetry data library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- Formula 1 - For the amazing sport

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ for F1 fans by F1 fans
