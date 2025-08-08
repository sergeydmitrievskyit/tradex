const express = require('express');
const cors = require('cors');
const http = require('http');
const { startWsStreamer } = require('./ws-streamer');
const { TickerStorage } = require('./services/tickerStorage');
const { getPopularMockTickers } = require('./services/mockData');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// In-memory storage
const tickerStorage = new TickerStorage();

app.get('/api/tickers', (req, res) => {
  const list = tickerStorage.getAllArray().map((t) => ({ symbol: t.symbol, price: t.price, delta: t.delta ?? 0, percent: t.percent ?? 0 }))
  res.json({ tickers: list })
})

app.get('/api/tickers/:symbol', (req, res) => {
  const symbol = String(req.params.symbol || '').toUpperCase()
  const item = tickerStorage.getBySymbol(symbol)
  if (!item) return res.status(404).json({ error: 'Not found' })
  const history = tickerStorage.getHistory(symbol)
  res.json({ ...item, history })
})

function initialLoad() {
  const tickers = getPopularMockTickers();
  tickerStorage.setAll(tickers);
  // Seed 24h history for every symbol (1-minute step)
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const stepMs = 60 * 1000;
  for (const t of tickers) {
    const points = [];
    let current = Number(t.price) || 0;
    for (let ts = now - oneDayMs; ts <= now; ts += stepMs) {
      const delta = current * (Math.random() - 0.5) * 0.002; // +/-0.2%
      current = Math.max(0, +(current + delta).toFixed(2));
      points.push({ t: ts, price: current });
    }
    tickerStorage.setHistory(t.symbol, points);
  }
  console.log(`Loaded ${tickerStorage.size()} mock tickers with seeded 24h history`);
}

function startMockPriceStream(streamer) {
  const intervalMs = Number(process.env.MOCK_TICK_MS || 1000);
  setInterval(() => {
    const list = tickerStorage.getAllArray();
    if (!Array.isArray(list) || list.length === 0) return;
    const idx = Math.floor(Math.random() * list.length);
    const { symbol, price } = list[idx];
    const base = Number(price) || 0;
    // Random walk: +/- up to 1% per tick
    const delta = base * (Math.random() - 0.5) * 0.02;
    const next = Math.max(0, +(base + delta).toFixed(2));
    const diff = +(next - base).toFixed(2)
    const percent = base ? +(((next - base) / base) * 100).toFixed(3) : 0
    tickerStorage.updatePrice(symbol, next, diff, percent);
    const now = Date.now();
    tickerStorage.appendHistory(symbol, now, next);
    tickerStorage.pruneHistory(symbol, now - 24 * 60 * 60 * 1000);
    try {
      streamer.broadcast({ type: 'ticker:update', symbol, price: next, delta: diff, percent })
    } catch {}
  }, intervalMs);
}

function startFastSymbolStream(streamer, symbol, intervalMs = 1000) {
  const sym = String(symbol).toUpperCase()
  setInterval(() => {
    const item = tickerStorage.getBySymbol(sym)
    if (!item) return
    const base = Number(item.price) || 0
    const delta = base * (Math.random() - 0.5) * 0.02 // +/-1%
    const next = Math.max(0, +(base + delta).toFixed(2))
    const diff = +(next - base).toFixed(2)
    const percent = base ? +(((next - base) / base) * 100).toFixed(3) : 0
    tickerStorage.updatePrice(sym, next, diff, percent)
    const now = Date.now()
    tickerStorage.appendHistory(sym, now, next)
    tickerStorage.pruneHistory(sym, now - 24 * 60 * 60 * 1000)
    try {
      streamer.broadcast({ type: 'ticker:update', symbol: sym, price: next, delta: diff, percent })
    } catch {}
  }, intervalMs)
}

// Каждую минуту добавляем точку истории для каждого символа и чистим старше 24ч
function startHistoryMaintenance() {
  const stepMs = 60 * 1000;
  setInterval(() => {
    const now = Date.now();
    const olderThan = now - 24 * 60 * 60 * 1000;
    const list = tickerStorage.getAllArray();
    for (const { symbol, price } of list) {
      tickerStorage.appendHistory(symbol, now, Number(price) || 0);
      tickerStorage.pruneHistory(symbol, olderThan);
    }
  }, stepMs);
}

const server = http.createServer(app);
const streamer = startWsStreamer(server, tickerStorage);

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
  console.log(`WebSocket listening on ws://localhost:${port}/ws`);
  initialLoad();
  startMockPriceStream(streamer);
  startHistoryMaintenance();
  // Demo: ускоренные апдейты для AAPL раз в секунду
  startFastSymbolStream(streamer, 'AAPL', 1000)
}); 