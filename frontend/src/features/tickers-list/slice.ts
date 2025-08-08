import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { TickerListItem } from '@shared-types/ticker'
import type { RootState } from '@store/index'

export interface TickersState {
  tickers: TickerListItem[]
}

const initialState: TickersState = {
  tickers: [],
}

const tickersSlice = createSlice({
  name: 'tickers',
  initialState,
  reducers: {
            setTickers(state, action: PayloadAction<TickerListItem[]>) {
      state.tickers = action.payload
    },
    updateTickerPrice(state, action: PayloadAction<{ symbol: string; price: number }>) {
      const { symbol, price } = action.payload
      state.tickers = state.tickers.map((t) =>
        t.symbol === symbol ? { ...t, price } : t
      )
    },
  },
})

export const { setTickers, updateTickerPrice } = tickersSlice.actions

export const selectTickers = (state: RootState) => state.tickers.tickers

export default tickersSlice.reducer 