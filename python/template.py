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

    available_time_slot = "1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y".split(", ")

    if time_slot not in available_time_slot:
        raise Exception("Ikke støttet tidsvindu. Please choose from: 1D, 1W, 1M, YTD, 1Y, 3Y, 5Y, 10Y")
    
    #Kjør koden
    analyse(ticker, time_slot)