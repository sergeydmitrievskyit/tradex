export type WSMessage =
  | { type: 'ping'; t: number }
  | { type: 'ticker:update'; symbol: string; price: number; delta?: number; percent?: number }
  | { type: 'history:append'; symbol: string; t: number; price: number }

type Listener = (msg: WSMessage) => void

let sharedWs: WebSocket | null = null
const listeners = new Set<Listener>()

function ensureWs(baseUrl: string): WebSocket {
  if (sharedWs && (sharedWs.readyState === WebSocket.OPEN || sharedWs.readyState === WebSocket.CONNECTING)) {
    return sharedWs
  }
  const url = baseUrl.replace('http', 'ws') + '/ws'
  const ws = new WebSocket(url)
  sharedWs = ws

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data as string)
      if (data?.type === 'ping' || data?.type === 'ticker:update' || data?.type === 'history:append') {
        listeners.forEach((cb) => {
          try {
            cb(data)
          } catch {}
        })
      }
    } catch {}
  }

  ws.onclose = () => {
    // Сохраняем ws = null. При следующей подписке или при активных подписчиках можно пересоздать.
    sharedWs = null
    // Простейший автопереподключатель, если есть слушатели
    if (listeners.size > 0) {
      setTimeout(() => {
        try {
          ensureWs(baseUrl)
        } catch {}
      }, 1000)
    }
  }

  return ws
}

// Подключение подписчика к shared WS. Возвращает функцию для отписки.
export function connectTickerWs(baseUrl: string, onMessage: (msg: WSMessage) => void) {
  ensureWs(baseUrl)
  listeners.add(onMessage)
  return () => {
    listeners.delete(onMessage)
    // Не закрываем соединение при отсутствии слушателей, чтобы избежать дребезга.
  }
}