import React from 'react'
import type { TickerListItem } from '@shared-types/ticker'
import { useAppDispatch } from '@store/hooks'
import { selectTicker } from '@features/ticker-page'

interface TickerItemProps {
  ticker: TickerListItem
}

export default function TickerItem({ ticker }: TickerItemProps) {
  const dispatch = useAppDispatch()
  return (
    <li style={itemRow} onClick={() => dispatch(selectTicker(ticker.symbol))}>
      <div style={leftBlock}><span style={symbol}>{ticker.symbol}</span></div>
      <div style={rightBlock}>
        <span style={price}>{ticker.price.toFixed(2)}</span>
      </div>
    </li>
  )
}

const itemRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 8px',
  borderBottom: '1px solid #f0f0f0',
}

const leftBlock: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
}

const rightBlock: React.CSSProperties = {
  minWidth: 100,
  textAlign: 'right',
}

const symbol: React.CSSProperties = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  fontWeight: 700,
}

// removed name

const price: React.CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
} 