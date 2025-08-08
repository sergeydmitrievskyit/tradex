import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { TickerListItem, TickerDetailed } from '@shared-types/ticker'

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'
}

export const tickerApi = createApi({
  reducerPath: 'tickerApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getApiBaseUrl()}/api` }),
  endpoints: (builder) => ({
    getTickers: builder.query<TickerListItem[], void>({
      query: () => ({ url: 'tickers' }),
      transformResponse: (response: { tickers: TickerListItem[] }) => response.tickers,
    }),
    getTickerBySymbol: builder.query<TickerDetailed, string>({
      query: (symbol) => ({ url: `tickers/${symbol}` }),
    }),
  }),
})

export const { useGetTickersQuery, useGetTickerBySymbolQuery } = tickerApi