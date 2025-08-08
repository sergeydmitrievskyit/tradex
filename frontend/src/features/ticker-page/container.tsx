import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { selectSelectedSymbol, setTickerDetail, selectSelectedTickerDetail, updateDetailSnapshot, appendHistoryPoint } from './slice'
import { connectTickerWs, type WSMessage } from '@services/ticker/ws'
import { useGetTickerBySymbolQuery } from '@services/ticker/api'
import Chart24h from './components/Chart24h'

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'
}

export default function TickerPageContainer() {
  const dispatch = useAppDispatch()
  const selectedSymbol = useAppSelector(selectSelectedSymbol)
  const selectedTickerDetail = useAppSelector(selectSelectedTickerDetail)

  // Подгружаем детальную информацию по выбранному тикеру
  const { data: detailData, isLoading, isFetching } = useGetTickerBySymbolQuery(selectedSymbol!, {
    skip: !selectedSymbol,
  })

  useEffect(() => {
    if (detailData) {
      dispatch(setTickerDetail(detailData))
    }
  }, [detailData, dispatch])

  useEffect(() => {
    let lastAppendTs = 0
    const disconnect = connectTickerWs(getApiBaseUrl(), (msg: WSMessage) => {
      if (msg.type === 'ticker:update') {
        dispatch(updateDetailSnapshot({ symbol: msg.symbol, price: msg.price, delta: (msg as any).delta, percent: (msg as any).percent }))
        const nowTs = Date.now()
        if (nowTs - lastAppendTs >= 10_000) {
          lastAppendTs = nowTs
          dispatch(appendHistoryPoint({ symbol: msg.symbol, t: nowTs, price: msg.price }))
        }
      } else if (msg.type === 'history:append') {
        // если сервер когда-то начнёт слать 10s точки — примем их
        dispatch(appendHistoryPoint({ symbol: msg.symbol, t: msg.t, price: msg.price }))
      }
    })
    return () => disconnect()
  }, [dispatch])

  if (selectedSymbol && (isLoading || isFetching)) {
    return (
      <div style={{ padding: 16, color: '#6b7280' }}>
        Loading {selectedSymbol}...
      </div>
    )
  }

  if (!selectedTickerDetail) {
    return (
      <div style={{ padding: 16, color: '#6b7280' }}>
        Select a ticker on the left to see details
      </div>
    )
  }

  const colorFor = (v: number) => (v > 0 ? '#16a34a' : v < 0 ? '#dc2626' : '#6b7280')

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{selectedTickerDetail.name}</h2>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontSize: 32, fontVariantNumeric: 'tabular-nums' as const }}>
          {selectedTickerDetail.price.toFixed(2)}
        </div>
        {typeof selectedTickerDetail.delta === 'number' && (
          <div style={{ color: colorFor(selectedTickerDetail.delta), fontVariantNumeric: 'tabular-nums' as const }}>
            {selectedTickerDetail.delta > 0 ? '+' : ''}{selectedTickerDetail.delta.toFixed(2)}
          </div>
        )}
        {typeof selectedTickerDetail.percent === 'number' && (
          <div style={{ color: colorFor(selectedTickerDetail.percent), fontVariantNumeric: 'tabular-nums' as const }}>
            {selectedTickerDetail.percent > 0 ? '+' : ''}{selectedTickerDetail.percent.toFixed(2)}%
          </div>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <Chart24h data={selectedTickerDetail.history ?? []} />
      </div>
    </div>
  )
}


