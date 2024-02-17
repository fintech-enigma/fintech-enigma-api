import yfinance as yf
import sys
import datetime as dt
from dateutil.relativedelta import relativedelta

def analyse(ticker, time_slot):
    end_t = dt.datetime.today().date()

    if time_slot == '1d':
        days = int(time_slot[:-1])
        start_t = end_t - dt.timedelta(days = days)

    elif time_slot.endswith('wk'):
        weeks = int(time_slot[:-2])
        start_t = end_t - dt.timedelta(weeks = weeks)

    elif time_slot.endswith('mo'):
        months = int(time_slot[:-2])
        start_t = end_t - relativedelta(months = months)

    elif time_slot.endswith('y'):
        years = int(time_slot[:-1])
        start_t = end_t - relativedelta(years = years)

    elif time_slot == "ytd":
        start_t = dt.datetime(2024, 1, 1)
        
    else: 
        raise Exception("Invalid time slot format")
    
    data = yf.download(ticker, start_t, end_t)['Adj Close'].ffill()

    normalized_data = data / data.iloc[0]

    print(list(normalized_data.index))
    print(list(normalized_data))

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
    
    #Kjør koden
    analyse(ticker, time_slot)