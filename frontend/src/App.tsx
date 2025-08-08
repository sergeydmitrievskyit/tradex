import React from 'react'
import TickersList from '@features/tickers-list'
import TickerPage from '@features/ticker-page'

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', height: '100vh' }}>
      <div style={{ display: 'flex', height: '100%' }}>
        <aside style={{ width: 320, borderRight: '1px solid #e5e7eb', padding: 12, overflow: 'auto' }}>
          <TickersList />
        </aside>
        <main style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: 16 }}>
            <TickerPage />
          </div>
        </main>
      </div>
    </div>
  )
}