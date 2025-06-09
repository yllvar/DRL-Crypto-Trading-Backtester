// Data fetcher for cryptocurrency historical data
const ccxt = require("ccxt")

class CryptoDataFetcher {
  constructor() {
    this.exchange = new ccxt.binance({
      sandbox: true, // Use sandbox for testing
      enableRateLimit: true,
    })
  }

  async fetchOHLCV(symbol = "BTC/USDT", timeframe = "1h", since = undefined, limit = 1000) {
    try {
      const ohlcv = await this.exchange.fetchOHLCV(symbol, timeframe, since, limit)
      return ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
        timestamp: new Date(timestamp).toISOString(),
        open,
        high,
        low,
        close,
        volume,
        // Technical indicators can be calculated here
        sma_20: this.calculateSMA(close, 20),
        rsi: this.calculateRSI(close, 14),
      }))
    } catch (error) {
      console.error("Error fetching OHLCV data:", error)
      throw error
    }
  }

  calculateSMA(prices, period) {
    // Simple Moving Average calculation
    if (prices.length < period) return null
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }

  calculateRSI(prices, period = 14) {
    // Relative Strength Index calculation
    if (prices.length < period + 1) return null

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / avgLoss

    return 100 - 100 / (1 + rs)
  }

  async getMultipleAssets(symbols = ["BTC/USDT", "XRP/USDT"], timeframe = "1h", limit = 1000) {
    const promises = symbols.map((symbol) => this.fetchOHLCV(symbol, timeframe, undefined, limit))
    const results = await Promise.all(promises)

    return symbols.reduce((acc, symbol, index) => {
      acc[symbol] = results[index]
      return acc
    }, {})
  }
}

// Usage example
async function main() {
  const fetcher = new CryptoDataFetcher()

  try {
    console.log("Fetching cryptocurrency data...")
    const data = await fetcher.getMultipleAssets(["BTC/USDT", "XRP/USDT"], "1h", 100)

    console.log("BTC Data Sample:", data["BTC/USDT"].slice(0, 5))
    console.log("XRP Data Sample:", data["XRP/USDT"].slice(0, 5))

    return data
  } catch (error) {
    console.error("Failed to fetch data:", error)
  }
}

if (require.main === module) {
  main()
}

module.exports = { CryptoDataFetcher }
