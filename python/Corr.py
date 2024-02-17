import sys

import yfinance as yf
import datetime as dt
import numpy as np

def correlation(ticker1, ticker2, time_slot):
    tick1 = yf.Ticker(ticker1)
    tick2 = yf.Ticker(ticker2)

    # Extracting closing price
    data1 = yf.download(ticker1, period=time_slot)["Adj Close"]
    data2 = yf.download(ticker2, period=time_slot)["Adj Close"]

    # Finding timestamps not contained in both sets
    l1 = set(data1.index)
    l2 = set(data2.index)
    l3 = l1 ^ l2 
    timestamps = [dt.datetime.strftime(item, "%Y-%m-%d") for item in list(l3)]

    # Removing them if possible
    for ts in timestamps:
        try:
            data1.drop(index=ts, inplace=True)
        except:
            data2.drop(index=ts, inplace=True)

    corr_coef = np.corrcoef(data1, data2)[1,0]
    return corr_coef

if __name__ == "__main__":
    # Redefinition for ease of use
    argv = sys.argv
    argc = len(argv)

    if argc != 4:
        raise Exception(f"ERROR: Received {argc} args. Expected 4.")
        exit(1)

    ticker1 = sys.argv[1]
    ticker2 = sys.argv[3]
    time_slot = sys.argv[2]
    available_time_slots = ["1d", "5d", "1wk", "1mo", "3mo", "6mo", "1y",
                           "3y", "5y", "10y", "ytd", "max"]

    if time_slot not in available_time_slots:
        raise Exception("ERROR: Time slot not available. Choose one of", ", ".join(available_time_slots))

    if time_slot == "1wk":
        time_slot = "5d"
    result = correlation(ticker1, ticker2, time_slot)
    print(result)