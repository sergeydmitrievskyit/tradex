const { WebSocketServer } = require('ws')

function startWsStreamer(server, tickerStorage) {
  const wss = new WebSocketServer({ server, path: '/ws' })

  function broadcast(obj) {
    const payload = JSON.stringify(obj)
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(payload)
      }
    })
  }

  const heartbeat = setInterval(() => broadcast({ type: 'ping', t: Date.now() }), 30000)

  // Remove mock periodic updates; updates come from finnhub now

  wss.on('connection', () => {})

  wss.on('close', () => {
    clearInterval(heartbeat)
  })

  return {
    broadcast,
    sendUpdate(symbol, price) {
      broadcast({ type: 'ticker:update', symbol, price })
    },
  }
}

module.exports = { startWsStreamer } 