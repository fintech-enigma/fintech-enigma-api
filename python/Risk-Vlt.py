from datetime import datetime, timedelta
import numpy as np
import yfinance as yf
import sys


def analyse(ticker, tidsperiode):
    
    end_date = datetime.now()
    fortegnelse = {"1d":1/365, "1wk":7/365, "1mo":30/365, "1y":1, "3y":3, "5y":5, "10y":10}
    if tidsperiode == "ytd":
        year_str = str(datetime.now())[:4]
        start_date = (year_str + "-01-01")
        
    else:
        start_date = end_date - fortegnelse[tidsperiode]*timedelta(days = 365)
    
    stock_data = yf.download(ticker, start=start_date, end=end_date)

    close_prices = stock_data['Close']

    daily_price_changes = close_prices.pct_change().dropna()

    daily_std_dev = daily_price_changes.std()*np.sqrt(252)



    yearly_return = np.mean(daily_price_changes) * 252

    return {"dev": daily_std_dev, "ret": yearly_return}





if __name__ == "__main__":
    # Check if the correct number of command-line arguments is provided
    if len(sys.argv) > 3 or len(sys.argv) < 2:
        raise Exception("Manglende argumenter")

    # Extract command-line arguments
    ticker = sys.argv[1]
    time_slot = sys.argv[2]
    # osv...

    available_time_slot = "1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y".split(", ")

    if time_slot not in available_time_slot:
        raise Exception("Ikke støttet tidsvindu. Please choose from: 1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y")
    
    
    print(analyse(ticker, time_slot))
