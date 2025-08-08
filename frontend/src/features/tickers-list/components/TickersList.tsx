import React from 'react'
import type { TickerListItem } from '@shared-types/ticker'
import TickerItem from './TickerItem'

interface TickersListProps {
  tickers: TickerListItem[]
  isLoading: boolean
  error: string | null
}

export default function TickersList({ tickers, isLoading, error }: TickersListProps) {
  if (isLoading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {tickers.map((t) => (
        <TickerItem key={t.symbol} ticker={t} />
      ))}
    </ul>
  )
} 