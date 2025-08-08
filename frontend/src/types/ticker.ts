export interface TickerListItem {
  symbol: string
  price: number
}

export interface TickerDetailed {
  symbol: string
  name: string
  price: number
  history?: Array<{ t: number; price: number }>
  delta?: number
  percent?: number
}