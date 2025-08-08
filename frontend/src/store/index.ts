import { configureStore } from '@reduxjs/toolkit'
import { tickerApi } from '@services/ticker/api'
import tickersReducer from '@features/tickers-list/slice'
import tickerPageReducer from '@features/ticker-page/slice'

export const store = configureStore({
  reducer: {
    tickers: tickersReducer,
    tickerPage: tickerPageReducer,
    [tickerApi.reducerPath]: tickerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tickerApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 