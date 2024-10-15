import pandas_ta as ta
import alpaca_trade_api as tradeapi
import pandas as pd
import os
from dotenv import load_dotenv
from alpaca_trade_api.rest import TimeFrame
import datetime as dt
import pytz
from time import sleep
import pymongo
from pymongo import MongoClient


load_dotenv()
API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
END_POINT = os.getenv("ALPACA_END_POINT")

MONGO_KEY = os.getenv("API_KEY")

client = MongoClient(MONGO_KEY)
db = client['Cluster0']
collection = db['EMA-SMA']

cash = float(collection.find().to_list()[-1]['price'])
position_market_value = 0
portfolio_value = cash


# Create the Alpaca API client
api = tradeapi.REST(API_KEY, SECRET_KEY, END_POINT, api_version="v2")

GMT = pytz.timezone("GMT")
trade_active = False

def trading_logic(ticker: str)->None:
    time_now = dt.datetime.now(tz=GMT)
    time_15_min_ago = time_now - dt.timedelta(minutes=15)
    time_1_hr_ago = time_now - dt.timedelta(hours=1)
    global trade_active
    bars = api.get_bars(ticker, TimeFrame.Minute, 
            start=time_1_hr_ago.isoformat(), 
            end=time_15_min_ago.isoformat(), 
            adjustment="raw"
            ).df


    bars = pd.DataFrame(bars)
    # Convert to DataFrame
    data = pd.DataFrame({
        "time": bars.index,
        "close": bars.close
    })
    data.set_index("time", inplace=True)


    data["ema_12"] = ta.ema(data["close"], length=12)
    data["sma_12"] = ta.sma(data["close"],length=12)

    current = data.iloc[-1]
    if current["ema_12"] is None:
        print ("ema_12 is none") 
    if current["sma_12"] is None:
        print("sma_12 is none")
    if current["sma_12"] > current["ema_12"] and not trade_active:
        try:
            qty = cash // current["close"]
            api.submit_order(ticker, qty, "buy", "market", "day")
            trade_active = True
            print(f"Bought {ticker} at price {current['close']}, 12EMA:{current['ema_12']}, 12SMA: {current['sma_12']}")
        except:
            print("Something went wrong while buying...")
    elif current["sma_12"] < current["ema_12"] and trade_active:
        try:
            api.close_position(ticker)
            trade_active = False
            position_market_value = 0
            portfolio_value = float(api.get_account().portfolio_value)
            collection.insert_one({'price': portfolio_value, 'time': time_now.isoformat()})
            print(f"Sold {ticker} at price {current['close']}, 12EMA:{current['ema_12']}, 12SMA: {current['sma_12']}")
        except:
            print("Something went wrong while selling...")
    else:
        if trade_active:
            print(f"Possion of size 10 is active: {ticker}@{current['close']}, 12EMA is at {current['ema_12']}, 12SMA at {current['sma_12']}")
        else:
            print(f"We have no possition and price is at {current['close']}, 12EMA is at {current['ema_12']}, 12SMA is at {current['sma_12']}")

if __name__ == "__main__":
    ticker = "AAPL"
    account = api.get_account()
    position_market_value = float(account.position_market_value)
    portfolio_value = float(account.portfolio_value)
    cash = portfolio_value - position_market_value

    if position_market_value > 0: trade_active = True

    while True:
        print(f"Checking {ticker}...")
        account = api.get_account()
        position_market_value = float(account.position_market_value)
        portfolio_value = float(account.portfolio_value)
        cash = portfolio_value - position_market_value
        trading_logic(ticker)
        sleep(60)
