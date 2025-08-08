# Tradex

Full‑stack trading dashboard: React + TypeScript + Redux Toolkit (frontend) and Node.js + Express (backend). Realtime price updates via WebSocket. Mock data is used to accelerate development.

## 1) Run with Docker

Requirements: Docker Desktop (or Docker Engine) with Docker Compose v2.

Commands:

```bash
cd /Users/sergeydmitrievskiy/Frontend/tradex
docker compose build
docker compose up -d
```

Access:
- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/api/health
- Backend tickers: http://localhost:4000/api/tickers

Notes:
- Frontend container uses `VITE_API_URL=http://backend:4000` to reach backend by service name inside Docker network.
- Stop stack: `docker compose down`
- Logs: `docker compose logs -f backend` / `docker compose logs -f frontend`

## 2) Run locally (no Docker)

Terminal A (backend):
```bash
cd backend
npm install
npm run dev
```

Terminal B (frontend):
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:4000 npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/api/health

## 3) Project structure

```
tradex/
  backend/
    src/
      index.js              # Express app, REST routes, WS streamer setup
      ws-streamer.js        # WebSocket server (/ws), broadcast helpers
      services/
        tickerStorage.js    # In‑memory tickers with price, delta, percent, history (24h window)
        mockData.js         # 10 popular US stocks seed
        finnhubAdapter.js   # (optional) Finnhub REST helpers
        finnhubWs.js        # (optional) Finnhub WS helpers
    Dockerfile

  frontend/
    src/
      App.tsx
      services/
        ticker/
          api.ts            # RTK Query endpoints (tickers list, ticker detail)
          ws.ts             # Shared WS client for realtime updates
      features/
        tickers-list/       # Left menu: symbols list with live prices
          slice.ts
          components/
          container.tsx
        ticker-page/        # Detail page with realtime price and 24h chart
          slice.ts          # selectedSymbol + detail (price, delta, percent, history)
          components/
            Chart24h.tsx    # 1h back + 1h forward, 10s granularity, fixed Y domain
          container.tsx
    Dockerfile

  docker-compose.yml        # Orchestrates backend and frontend
  README.md
```

Key endpoints:
- `GET /api/tickers` → `{ tickers: Array<{ symbol, price, delta, percent }> }`
- `GET /api/tickers/:symbol` → `{ symbol, name, price, delta, percent, history: Array<{ t, price }> }`
- WS `/ws` → messages `{ type: 'ticker:update', symbol, price, delta, percent }`
