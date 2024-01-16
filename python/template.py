import yfinance as yf
import sys

def analyse(ticker, time_slot):
    pass

if __name__ == "__main__":
    # Check if the correct number of command-line arguments is provided
    if len(sys.argv) > 3 or len(sys.argv) < 2:
        raise Exception("Manglende argumenter")

    # Extract command-line arguments
    ticker = sys.argv[1]
    time_slot = sys.argv[2]
    # osv...

    if time_slot == '1D':
        period = '1d'
    elif time_slot == '1W':
        period = '1wk'
    elif time_slot == '1M':
        period = '1mo'
    elif time_slot == 'YTD':
        period = 'ytd'
    elif time_slot == '1Y':
        period = '1y'
    elif time_slot == '3Y':
        period = '3y'
    elif time_slot == '5Y':
        period = '5y'
    elif time_slot == '10Y':
        period = '10y'
    else:
        raise Exception("Ikke støttet tidsvindu. Please choose from: 1D, 1W, 1M, YTD, 1Y, 3Y, 5Y, 10Y")
    
    #Kjør koden
    analyse(ticker, period)
