import React, { useEffect } from 'react'
import TickersList from './components/TickersList'
import { useGetTickersQuery } from '@services/ticker/api'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { selectTickers, setTickers, updateTickerPrice } from './slice'
import { connectTickerWs, type WSMessage } from '@services/ticker/ws'
import { selectSelectedSymbol, selectTicker } from '@features/ticker-page'

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'
}

export default function TickersListContainer() {
  const dispatch = useAppDispatch()
  const { data, isLoading, error } = useGetTickersQuery()
  const tickers = useAppSelector(selectTickers)
  const selectedSymbol = useAppSelector(selectSelectedSymbol)

  useEffect(() => {
    if (data) dispatch(setTickers(data))
  }, [data, dispatch])

  // При первом заходе выбираем первый тикер автоматически
  useEffect(() => {
    if (!selectedSymbol && data && data.length > 0) {
      dispatch(selectTicker(data[0].symbol))
    }
  }, [selectedSymbol, data, dispatch])

  useEffect(() => {
    const disconnect = connectTickerWs(getApiBaseUrl(), (msg: WSMessage) => {
      if (msg.type === 'ticker:update') {
        dispatch(updateTickerPrice({ symbol: msg.symbol, price: msg.price }))
      }
    })
    return () => disconnect()
  }, [dispatch])

  return <TickersList tickers={tickers} isLoading={isLoading} error={error ? 'Loading error' : null} />
} 