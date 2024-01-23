import yfinance as yf
import sys
import datetime
import numpy as np
import matplotlib.pyplot as plt

def analyse(ticker, time_slot):
    end_date = datetime.date.today()  # End date today.
    year_start_date = datetime.date(end_date.year, 1, 1)  # Start date at the beginning of the current year.

    time_slots_mapping = {"1D": 1, "1W": 7, "1M": 30, "YTD": (end_date - year_start_date).days, "1Y": 365, "3Y": 3 * 365, "5Y": 5 * 365, "10Y": 10 * 365}

    if time_slot == "1D":
        start_date = end_date - datetime.timedelta(days=1)
        data = yf.download(ticker, start=start_date, end=end_date, interval='30m')
        thirty_min_return = data["Close"].pct_change().dropna()  # Calculates the daily returns.

        x_values = thirty_min_return.index
        y_values = thirty_min_return.values

        print(list(x_values))
        print(y_values)
        

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
        print(y_values)

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

    available_time_slot = "1D, 1W, 1M, YTD, 1Y, 3Y, 5Y, 10Y".split(", ")

    if time_slot not in available_time_slot:
        raise Exception("Ikke støttet tidsvindu. Please choose from: 1D, 1W, 1M, YTD, 1Y, 3Y, 5Y, 10Y")
    
    #Kjør koden
    analyse(ticker, time_slot)