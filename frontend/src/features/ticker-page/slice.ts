import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@store/index'
import type { TickerDetailed } from '@shared-types/ticker'

export interface TickerPageState {
  selectedSymbol: string | null
  detail: TickerDetailed | null
}

const initialState: TickerPageState = {
  selectedSymbol: null,
  detail: null,
}

const tickerPageSlice = createSlice({
  name: 'tickerPage',
  initialState,
  reducers: {
    selectTicker(state, action: PayloadAction<string>) {
      state.selectedSymbol = action.payload
      // очистим текущую деталь до прихода новых данных
      state.detail = null
    },
    clearSelection(state) {
      state.selectedSymbol = null
      state.detail = null
    },
    setTickerDetail(state, action: PayloadAction<TickerDetailed>) {
      state.detail = action.payload
    },
    updateDetailSnapshot(
      state,
      action: PayloadAction<{ symbol: string; price: number; delta?: number; percent?: number }>
    ) {
      const { symbol, price, delta, percent } = action.payload
      if (state.detail && state.detail.symbol === symbol) {
        state.detail = { ...state.detail, price, delta, percent }
      }
    },
    appendHistoryPoint(state, action: PayloadAction<{ symbol: string; t: number; price: number }>) {
      const { symbol, t, price } = action.payload
      if (!state.detail || state.detail.symbol !== symbol) return
      const now = Date.now()
      const cutoff = now - 24 * 60 * 60 * 1000
      const prev = state.detail.history ?? []
      const next = [...prev, { t, price }].filter((p) => p.t >= cutoff)
      state.detail = { ...state.detail, history: next }
    },
  },
})

export const { selectTicker, clearSelection, setTickerDetail, updateDetailSnapshot, appendHistoryPoint } = tickerPageSlice.actions

export const selectSelectedSymbol = (state: RootState) => state.tickerPage.selectedSymbol
export const selectSelectedTickerDetail = (state: RootState) => state.tickerPage.detail

export default tickerPageSlice.reducer


