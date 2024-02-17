import yfinance as yf
import sys
import datetime
import numpy as np
import matplotlib.pyplot as plt

def analyse(ticker, time_slot):
    end_date = datetime.date.today()  # End date today.
    year_start_date = datetime.date(end_date.year, 1, 1)  # Start date at the beginning of the current year.

    time_slots_mapping = {"1d": 1, "1wk": 7, "1mo": 30, "ytd": (end_date - year_start_date).days, "1y": 365, "3y": 3 * 365, "5y": 5 * 365, "10y": 10 * 365}

    if time_slot == "1d":
        start_date = end_date - datetime.timedelta(days=1)
        data = yf.download(ticker, start=start_date, end=end_date, interval='30m')
        thirty_min_return = data["Close"].pct_change().dropna()  # Calculates the daily returns.
        
        x_values = thirty_min_return.index
        y_values = thirty_min_return.values

        print(list(x_values))
        print(list(y_values))
        

    else:
        start_date = end_date - datetime.timedelta(days=time_slots_mapping[time_slot])  # Start date as one year ago from today.

        data = yf.download(ticker, start=start_date, end=end_date)  # Downloads stock information.
        num_trading_days = data.shape[0]  # Number of trading days last year.

        daily_returns = data["Adj Close"].pct_change().dropna()  # Calculates the daily returns.

    
        x_values = daily_returns.index
        y_values = daily_returns.values

        # print(x_values)
        # print(y_values)

        print(list(x_values))
        print(list(y_values))

if __name__ == "__main__":
    # Check if the correct number of command-line arguments is provided
    #if len(sys.argv) > 3 or len(sys.argv) < 2:
     #   raise Exception("Manglende argumenter")   

    if len(sys.argv) != 3:
        raise Exception("Manglende argumenter")

    # Extract command-line arguments
    ticker = sys.argv[1]
    time_slot = sys.argv[2]
    # osv...

    available_time_slot = "1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y".split(", ")

    if time_slot not in available_time_slot:
        raise Exception("Ikke støttet tidsvindu. Please choose from: 1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y")
    
    #Kjør koden
    analyse(ticker, time_slot)