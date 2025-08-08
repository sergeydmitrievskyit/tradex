const WebSocket = require('ws')

const FINNHUB_WS_BASE = 'wss://ws.finnhub.io'
const DEFAULT_TOKEN = process.env.FINNHUB_TOKEN || 'd2abmk1r01qoad6p2ibgd2abmk1r01qoad6p2ic0'
const MAX_SUBSCRIPTIONS = Number(process.env.FINNHUB_MAX_SUBS || 50)

function getSymbolsToSubscribe(tickers) {
  return tickers.slice(0, MAX_SUBSCRIPTIONS).map((t) => t.symbol)
}

function startFinnhubWs(getTickersFn, onTrade) {
  let ws = null
  let isClosing = false
  let reconnectDelayMs = 1000

  function connect() {
    const url = `${FINNHUB_WS_BASE}?token=${encodeURIComponent(DEFAULT_TOKEN)}`
    ws = new WebSocket(url)

    ws.on('open', () => {
      reconnectDelayMs = 1000
      const list = typeof getTickersFn === 'function' ? getTickersFn() : []
      const symbols = getSymbolsToSubscribe(Array.isArray(list) ? list : [])
      const msg = (symbol) => JSON.stringify({ type: 'subscribe', symbol })
      for (const s of symbols) {
        try {
          ws.send(msg(s))
        } catch {}
      }
    })

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString())
        console.log(data);
        if (data.type === 'trade' && Array.isArray(data.data)) {
          for (const tr of data.data) {
            const price = typeof tr.p === 'number' ? tr.p : Number(tr.p)
            const symbol = tr.s
            if (symbol && isFinite(price)) {
              onTrade(symbol, price)
            }
          }
        }
      } catch {
        // ignore
      }
    })

    ws.on('error', () => {
      // ignore; handled by close
    })

    ws.on('close', () => {
      if (isClosing) return
      setTimeout(connect, reconnectDelayMs)
      reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30000)
    })
  }

  function stop() {
    isClosing = true
    try {
      ws && ws.close()
    } catch {}
  }

  connect()
  return { stop }
}

module.exports = { startFinnhubWs, getSymbolsToSubscribe } 