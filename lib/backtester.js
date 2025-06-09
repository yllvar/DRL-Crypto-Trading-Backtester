// Comprehensive backtesting engine for DRL trading strategies
const { spawn } = require("child_process")
const fs = require("fs").promises

class DRLBacktester {
  constructor() {
    this.results = null
    this.trades = []
    this.metrics = {}
  }

  async runPythonModel(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const python = spawn("python", [scriptPath, ...args])
      let output = ""
      let error = ""

      python.stdout.on("data", (data) => {
        output += data.toString()
        console.log(data.toString())
      })

      python.stderr.on("data", (data) => {
        error += data.toString()
        console.error(data.toString())
      })

      python.on("close", (code) => {
        if (code === 0) {
          resolve(output)
        } else {
          reject(new Error(`Python script failed with code ${code}: ${error}`))
        }
      })
    })
  }

  async loadBacktestResults() {
    try {
      const data = await fs.readFile("backtest_results.json", "utf8")
      return JSON.parse(data)
    } catch (error) {
      console.error("Error loading backtest results:", error)
      return null
    }
  }

  calculatePerformanceMetrics(results) {
    const { trades, total_return, net_worth, initial_balance = 1000 } = results

    if (!trades || trades.length === 0) {
      return {
        totalReturn: total_return || 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        totalTrades: 0,
        avgTradeReturn: 0,
      }
    }

    // Calculate trade-by-trade returns
    const tradeReturns = []
    let runningBalance = initial_balance
    let maxBalance = initial_balance
    let maxDrawdown = 0
    let winningTrades = 0

    for (let i = 0; i < trades.length - 1; i += 2) {
      const buyTrade = trades[i]
      const sellTrade = trades[i + 1]

      if (buyTrade && sellTrade && buyTrade.action === "BUY" && sellTrade.action === "SELL") {
        const tradeReturn = (sellTrade.price - buyTrade.price) / buyTrade.price
        tradeReturns.push(tradeReturn)

        runningBalance *= 1 + tradeReturn

        if (runningBalance > maxBalance) {
          maxBalance = runningBalance
        }

        const currentDrawdown = (maxBalance - runningBalance) / maxBalance
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown
        }

        if (tradeReturn > 0) {
          winningTrades++
        }
      }
    }

    // Calculate Sharpe ratio (simplified)
    const avgReturn = tradeReturns.reduce((sum, ret) => sum + ret, 0) / tradeReturns.length || 0
    const returnStd = Math.sqrt(
      tradeReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / tradeReturns.length || 1,
    )
    const sharpeRatio = returnStd > 0 ? (avgReturn / returnStd) * Math.sqrt(252) : 0 // Annualized

    return {
      totalReturn: total_return || 0,
      sharpeRatio: sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      winRate: (winningTrades / (tradeReturns.length || 1)) * 100,
      totalTrades: trades.length,
      avgTradeReturn: avgReturn * 100,
    }
  }

  async runFullBacktest() {
    try {
      console.log("Starting DRL model training and backtesting...")

      // Run the Python DRL training script
      await this.runPythonModel("scripts/drl_model.py")

      // Load results
      const results = await this.loadBacktestResults()

      if (!results) {
        throw new Error("Failed to load backtest results")
      }

      // Calculate performance metrics
      const metrics = this.calculatePerformanceMetrics(results)

      console.log("\n=== Backtest Results ===")
      console.log(`Total Return: ${metrics.totalReturn.toFixed(2)}%`)
      console.log(`Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`)
      console.log(`Max Drawdown: ${metrics.maxDrawdown.toFixed(2)}%`)
      console.log(`Win Rate: ${metrics.winRate.toFixed(2)}%`)
      console.log(`Total Trades: ${metrics.totalTrades}`)
      console.log(`Average Trade Return: ${metrics.avgTradeReturn.toFixed(2)}%`)

      this.results = results
      this.metrics = metrics

      return {
        results,
        metrics,
      }
    } catch (error) {
      console.error("Backtest failed:", error)
      throw error
    }
  }

  generateReport() {
    if (!this.results || !this.metrics) {
      return "No backtest results available. Run backtest first."
    }

    const report = `
# DRL Trading Strategy Backtest Report

## Performance Summary
- **Total Return**: ${this.metrics.totalReturn.toFixed(2)}%
- **Sharpe Ratio**: ${this.metrics.sharpeRatio.toFixed(2)}
- **Maximum Drawdown**: ${this.metrics.maxDrawdown.toFixed(2)}%
- **Win Rate**: ${this.metrics.winRate.toFixed(2)}%
- **Total Trades**: ${this.metrics.totalTrades}

## Strategy Details
- **Algorithm**: Dueling Deep Q-Network (DQN)
- **Initial Balance**: $${this.results.initial_balance || 1000}
- **Final Net Worth**: $${this.results.net_worth.toFixed(2)}

## Key Insights
Based on the research paper findings:
- Dueling DQN shows superior performance, especially with XRP
- The model adapts well to cryptocurrency market volatility
- Risk-adjusted returns (Sharpe ratio) indicate strategy effectiveness

## Trade Analysis
${
  this.results.trades
    ? `
First 5 trades:
${this.results.trades
  .slice(0, 5)
  .map((trade) => `- ${trade.action} at $${trade.price.toFixed(2)} (Step ${trade.step})`)
  .join("\n")}
`
    : "No detailed trade data available"
}

Generated on: ${new Date().toISOString()}
    `

    return report
  }
}

// Usage example
async function main() {
  const backtester = new DRLBacktester()

  try {
    const { results, metrics } = await backtester.runFullBacktest()

    // Generate and save report
    const report = backtester.generateReport()
    await fs.writeFile("backtest_report.md", report)

    console.log("\nBacktest completed successfully!")
    console.log("Report saved to backtest_report.md")

    return { results, metrics }
  } catch (error) {
    console.error("Backtest execution failed:", error)
  }
}

if (require.main === module) {
  main()
}

module.exports = { DRLBacktester }
