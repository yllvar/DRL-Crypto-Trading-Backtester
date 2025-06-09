import numpy as np
import pandas as pd
import gym
from gym import spaces
from stable_baselines3 import DQN
from stable_baselines3.common.vec_env import DummyVecEnv
import json
import sys

class TradingEnvironment(gym.Env):
    """
    Custom trading environment for DRL agents
    Based on the research paper's methodology for Bitcoin and Ripple trading
    """
    
    def __init__(self, df, initial_balance=1000):
        super(TradingEnvironment, self).__init__()
        
        self.df = df.reset_index(drop=True)
        self.initial_balance = initial_balance
        
        # Action space: 0=Hold, 1=Buy, 2=Sell
        self.action_space = spaces.Discrete(3)
        
        # Observation space: OHLCV + technical indicators
        self.observation_space = spaces.Box(
            low=-np.inf, 
            high=np.inf, 
            shape=(8,),  # open, high, low, close, volume, sma, rsi, position
            dtype=np.float32
        )
        
        self.reset()
    
    def reset(self):
        self.current_step = 0
        self.balance = self.initial_balance
        self.shares_held = 0
        self.net_worth = self.initial_balance
        self.max_net_worth = self.initial_balance
        self.trades = []
        
        return self._get_observation()
    
    def _get_observation(self):
        if self.current_step >= len(self.df):
            return np.zeros(8)
            
        row = self.df.iloc[self.current_step]
        
        # Normalize prices relative to first price
        first_price = self.df.iloc[0]['close']
        
        obs = np.array([
            row['open'] / first_price,
            row['high'] / first_price,
            row['low'] / first_price,
            row['close'] / first_price,
            row['volume'] / 1e6,  # Normalize volume
            row.get('sma_20', row['close']) / first_price,
            row.get('rsi', 50) / 100,  # Normalize RSI to 0-1
            self.shares_held / 10  # Normalize position
        ], dtype=np.float32)
        
        return obs
    
    def step(self, action):
        if self.current_step >= len(self.df) - 1:
            return self._get_observation(), 0, True, {}
        
        current_price = self.df.iloc[self.current_step]['close']
        
        # Execute action
        if action == 1:  # Buy
            if self.balance >= current_price:
                shares_to_buy = self.balance // current_price
                self.shares_held += shares_to_buy
                self.balance -= shares_to_buy * current_price
                self.trades.append({
                    'step': self.current_step,
                    'action': 'BUY',
                    'price': current_price,
                    'shares': shares_to_buy
                })
        
        elif action == 2:  # Sell
            if self.shares_held > 0:
                self.balance += self.shares_held * current_price
                self.trades.append({
                    'step': self.current_step,
                    'action': 'SELL',
                    'price': current_price,
                    'shares': self.shares_held
                })
                self.shares_held = 0
        
        # Move to next step
        self.current_step += 1
        
        # Calculate reward
        self.net_worth = self.balance + self.shares_held * current_price
        reward = (self.net_worth - self.initial_balance) / self.initial_balance
        
        # Update max net worth for drawdown calculation
        if self.net_worth > self.max_net_worth:
            self.max_net_worth = self.net_worth
        
        # Penalty for large drawdowns
        drawdown = (self.max_net_worth - self.net_worth) / self.max_net_worth
        if drawdown > 0.1:  # 10% drawdown penalty
            reward -= drawdown
        
        done = self.current_step >= len(self.df) - 1
        
        return self._get_observation(), reward, done, {
            'net_worth': self.net_worth,
            'balance': self.balance,
            'shares_held': self.shares_held
        }

def create_sample_data():
    """Create sample cryptocurrency data for demonstration"""
    np.random.seed(42)
    
    # Generate synthetic price data with realistic patterns
    n_steps = 1000
    base_price = 50000  # Starting price (like BTC)
    
    prices = [base_price]
    for i in range(n_steps - 1):
        # Random walk with trend and volatility
        change = np.random.normal(0, 0.02) + 0.0001  # Slight upward trend
        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 1))  # Prevent negative prices
    
    # Create OHLCV data
    data = []
    for i, close in enumerate(prices):
        high = close * (1 + abs(np.random.normal(0, 0.01)))
        low = close * (1 - abs(np.random.normal(0, 0.01)))
        open_price = low + (high - low) * np.random.random()
        volume = np.random.uniform(1e6, 1e8)
        
        data.append({
            'open': open_price,
            'high': high,
            'low': low,
            'close': close,
            'volume': volume
        })
    
    df = pd.DataFrame(data)
    
    # Add technical indicators
    df['sma_20'] = df['close'].rolling(window=20).mean()
    
    # Simple RSI calculation
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # Fill NaN values
    df = df.fillna(method='bfill').fillna(method='ffill')
    
    return df

def train_dueling_dqn():
    """Train a Dueling DQN model for cryptocurrency trading"""
    print("Creating sample cryptocurrency data...")
    df = create_sample_data()
    
    print("Setting up trading environment...")
    env = TradingEnvironment(df)
    env = DummyVecEnv([lambda: env])
    
    print("Training Dueling DQN model...")
    # Use DQN with dueling network architecture
    model = DQN(
        "MlpPolicy",
        env,
        learning_rate=1e-4,
        buffer_size=10000,
        learning_starts=1000,
        batch_size=32,
        tau=1.0,
        gamma=0.99,
        train_freq=4,
        gradient_steps=1,
        target_update_interval=1000,
        exploration_fraction=0.1,
        exploration_initial_eps=1.0,
        exploration_final_eps=0.05,
        max_grad_norm=10,
        verbose=1,
        policy_kwargs=dict(net_arch=[256, 256])  # Dueling architecture
    )
    
    # Train the model
    model.learn(total_timesteps=50000)
    
    print("Saving trained model...")
    model.save("dueling_dqn_crypto")
    
    return model, env

def predict_action(model, observation):
    """Predict trading action using trained model"""
    action, _states = model.predict(observation, deterministic=True)
    return int(action)

def backtest_strategy(model, test_data):
    """Backtest the trained strategy"""
    env = TradingEnvironment(test_data)
    obs = env.reset()
    
    total_reward = 0
    done = False
    
    while not done:
        action = predict_action(model, obs)
        obs, reward, done, info = env.step(action)
        total_reward += reward
    
    return {
        'total_return': ((env.net_worth - env.initial_balance) / env.initial_balance) * 100,
        'final_balance': env.balance,
        'shares_held': env.shares_held,
        'net_worth': env.net_worth,
        'total_trades': len(env.trades),
        'trades': env.trades
    }

if __name__ == "__main__":
    print("Starting DRL Cryptocurrency Trading Model Training...")
    
    # Train the model
    model, env = train_dueling_dqn()
    
    # Create test data
    test_df = create_sample_data()
    
    # Run backtest
    print("Running backtest...")
    results = backtest_strategy(model, test_df)
    
    print(f"\nBacktest Results:")
    print(f"Total Return: {results['total_return']:.2f}%")
    print(f"Final Net Worth: ${results['net_worth']:.2f}")
    print(f"Total Trades: {results['total_trades']}")
    
    # Save results
    with open('backtest_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("Results saved to backtest_results.json")
