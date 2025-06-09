"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, DollarSign, Activity, Brain, Target } from "lucide-react"

export default function DRLTradingDashboard() {
  const [isBacktesting, setIsBacktesting] = useState(false)
  const [backtestResults, setBacktestResults] = useState(null)

  // Sample data for demonstration
  const performanceData = [
    { date: "2024-01", portfolio: 1000, btc: 1000, xrp: 1000 },
    { date: "2024-02", portfolio: 1150, btc: 980, xrp: 1200 },
    { date: "2024-03", portfolio: 1320, btc: 1100, xrp: 1450 },
    { date: "2024-04", portfolio: 1180, btc: 950, xrp: 1380 },
    { date: "2024-05", portfolio: 1580, btc: 1200, xrp: 1720 },
    { date: "2024-06", portfolio: 1750, btc: 1150, xrp: 1950 },
  ]

  const algorithmComparison = [
    { algorithm: "Dueling DQN", btc: 15.2, xrp: 75.8, stability: 8.5 },
    { algorithm: "Double DQN", btc: 22.1, xrp: 45.3, stability: 7.8 },
    { algorithm: "Standard DQN", btc: -5.4, xrp: 28.7, stability: 6.2 },
    { algorithm: "A2C", btc: -12.8, xrp: 18.9, stability: 5.1 },
  ]

  const tradeSignals = [
    { timestamp: "2024-06-01 09:30", action: "BUY", asset: "XRP", price: 0.5234, confidence: 0.87 },
    { timestamp: "2024-06-01 11:45", action: "SELL", asset: "BTC", price: 67234.12, confidence: 0.92 },
    { timestamp: "2024-06-01 14:20", action: "BUY", asset: "BTC", price: 66890.45, confidence: 0.78 },
    { timestamp: "2024-06-01 16:15", action: "SELL", asset: "XRP", price: 0.5456, confidence: 0.85 },
  ]

  const runBacktest = async () => {
    setIsBacktesting(true)
    // Simulate backtesting process
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setBacktestResults({
      totalReturn: 75.8,
      sharpeRatio: 1.42,
      maxDrawdown: -8.3,
      winRate: 68.5,
      totalTrades: 247,
    })
    setIsBacktesting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-blue-600" />
            DRL Crypto Trading Backtester
          </h1>
          <p className="text-slate-600 text-lg">
            Deep Reinforcement Learning strategies for Bitcoin and Ripple trading
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$1,750</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +75% from initial
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Algorithm</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Dueling DQN</div>
              <p className="text-xs text-muted-foreground">Especially effective with XRP</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">1.42</div>
              <p className="text-xs text-muted-foreground">Risk-adjusted returns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">68.5%</div>
              <p className="text-xs text-muted-foreground">Successful trades</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
            <TabsTrigger value="signals">Trade Signals</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance Comparison</CardTitle>
                <CardDescription>Dueling DQN vs Buy & Hold strategies for BTC and XRP</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="portfolio" stroke="#2563eb" strokeWidth={3} name="DRL Portfolio" />
                    <Line type="monotone" dataKey="btc" stroke="#f59e0b" strokeWidth={2} name="BTC Buy & Hold" />
                    <Line type="monotone" dataKey="xrp" stroke="#10b981" strokeWidth={2} name="XRP Buy & Hold" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="algorithms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Performance Comparison</CardTitle>
                <CardDescription>Returns (%) for different DRL algorithms on BTC and XRP</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={algorithmComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="algorithm" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="btc" fill="#f59e0b" name="Bitcoin (%)" />
                    <Bar dataKey="xrp" fill="#10b981" name="Ripple (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {algorithmComparison.map((algo, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{algo.algorithm}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Bitcoin Performance:</span>
                      <Badge variant={algo.btc > 0 ? "default" : "destructive"}>
                        {algo.btc > 0 ? "+" : ""}
                        {algo.btc}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ripple Performance:</span>
                      <Badge variant={algo.xrp > 0 ? "default" : "destructive"}>+{algo.xrp}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Stability Score:</span>
                      <Badge variant="outline">{algo.stability}/10</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trade Signals</CardTitle>
                <CardDescription>Latest buy/sell signals generated by the Dueling DQN model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradeSignals.map((signal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={signal.action === "BUY" ? "default" : "secondary"}
                          className={signal.action === "BUY" ? "bg-green-500" : "bg-red-500"}
                        >
                          {signal.action}
                        </Badge>
                        <div>
                          <div className="font-medium">{signal.asset}</div>
                          <div className="text-sm text-muted-foreground">{signal.timestamp}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${signal.price.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(signal.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backtest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Run Backtest</CardTitle>
                <CardDescription>Test the Dueling DQN strategy on historical data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runBacktest} disabled={isBacktesting} className="w-full">
                  {isBacktesting ? "Running Backtest..." : "Start Backtest"}
                </Button>

                {backtestResults && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Return</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">+{backtestResults.totalReturn}%</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Max Drawdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{backtestResults.maxDrawdown}%</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Trades</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{backtestResults.totalTrades}</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Implementation Architecture</CardTitle>
                <CardDescription>How the DRL trading system works</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Data Collection</div>
                      <div className="text-sm text-muted-foreground">Fetch OHLCV data using ccxt library</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Model Prediction</div>
                      <div className="text-sm text-muted-foreground">Python DRL model generates trade signals</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Backtesting Engine</div>
                      <div className="text-sm text-muted-foreground">
                        Node.js processes signals and calculates performance
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-medium">Results Analysis</div>
                      <div className="text-sm text-muted-foreground">Performance metrics and visualization</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
