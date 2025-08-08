const popularMockTickers = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 190.12 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 420.55 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 120.33 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 170.18 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', price: 135.47 },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', price: 136.02 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 485.76 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 245.91 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', price: 415.22 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 205.31 },
]

function getPopularMockTickers() {
  return popularMockTickers.map((t) => ({ ...t }))
}

module.exports = { getPopularMockTickers } 