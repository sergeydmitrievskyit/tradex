class TickerStorage {
  constructor() {
    /** @type {Map<string, { symbol: string, name: string, price: number, delta?: number, percent?: number }>} */
    this.symbolToTicker = new Map()
    /** @type {Map<string, Array<{ t: number, price: number }>>} */
    this.symbolToHistory = new Map()
  }

  setAll(tickers) {
    this.symbolToTicker.clear()
    this.symbolToHistory.clear()
    for (const t of tickers) {
      this.symbolToTicker.set(t.symbol, { symbol: t.symbol, name: t.name, price: t.price ?? 0, delta: 0, percent: 0 })
      this.symbolToHistory.set(t.symbol, [])
    }
  }

  updateFromSymbolList(list) {
    const next = new Map()
    for (const it of list) {
      const existing = this.symbolToTicker.get(it.symbol)
      next.set(it.symbol, {
        symbol: it.symbol,
        name: it.name,
        price: existing ? existing.price : it.price ?? 0,
        delta: existing ? existing.delta : 0,
        percent: existing ? existing.percent : 0,
      })
    }
    this.symbolToTicker = next
  }

  updatePrice(symbol, price, delta, percent) {
    const existing = this.symbolToTicker.get(symbol)
    if (existing) {
      existing.price = price
      if (typeof delta === 'number') existing.delta = delta
      if (typeof percent === 'number') existing.percent = percent
      this.symbolToTicker.set(symbol, existing)
    } else {
      this.symbolToTicker.set(symbol, { symbol, name: symbol, price: price ?? 0, delta: delta ?? 0, percent: percent ?? 0 })
      if (!this.symbolToHistory.has(symbol)) this.symbolToHistory.set(symbol, [])
    }
  }

  getAllArray() {
    return Array.from(this.symbolToTicker.values())
  }

  getBySymbol(symbol) {
    return this.symbolToTicker.get(symbol) || null
  }

  setHistory(symbol, points) {
    this.symbolToHistory.set(symbol, Array.isArray(points) ? points.slice() : [])
  }

  appendHistory(symbol, t, price) {
    const arr = this.symbolToHistory.get(symbol) || []
    arr.push({ t, price })
    this.symbolToHistory.set(symbol, arr)
  }

  pruneHistory(symbol, olderThanMs) {
    const arr = this.symbolToHistory.get(symbol)
    if (!arr) return
    const filtered = arr.filter((p) => p.t >= olderThanMs)
    this.symbolToHistory.set(symbol, filtered)
  }

  getHistory(symbol) {
    return this.symbolToHistory.get(symbol) || []
  }

  size() {
    return this.symbolToTicker.size
  }
}

module.exports = { TickerStorage } 