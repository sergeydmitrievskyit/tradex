const FINNHUB_BASE = 'https://finnhub.io/api/v1'
// Note: token provided per user request; consider moving to env var in production
const DEFAULT_TOKEN = 'd2aptr1r01qgk9ug3qagd2aptr1r01qgk9ug3qb0'

async function fetchUSSymbols(limit = 100, token = process.env.FINNHUB_TOKEN || DEFAULT_TOKEN) {
  const url = `${FINNHUB_BASE}/stock/symbol?exchange=AS&token=${encodeURIComponent(token)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Finnhub symbols request failed: ${res.status}`)
  }
  const data = await res.json()
  // Map to our Ticker shape { symbol, name, price }
  const mapped = data
    .filter((it) => typeof it.symbol === 'string' && it.symbol)
    .slice(0, limit)
    .map((it) => ({ symbol: it.symbol, name: it.description || it.symbol, price: 0 }))
  return mapped
}

module.exports = { fetchUSSymbols } 