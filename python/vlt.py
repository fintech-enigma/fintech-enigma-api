import yfinance as yf
import sys

def calculate_volatility(ticker, time_slot):
    # Define the time period for historical data
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
    else:
        print("Invalid time slot. Please choose from: 1D, 1W, 1M, YTD, 1Y, 3Y, 5Y")
        return

    # Fetch historical data
    stock_data = yf.download(ticker, period=period)

    # Calculate daily returns
    stock_data['Daily_Returns'] = stock_data['Adj Close'].pct_change()

    # Calculate volatility (standard deviation of daily returns)
    volatility = stock_data['Daily_Returns'].std()

    print(f"Volatility of {ticker} for the past {time_slot}: {volatility:.4f}")

if __name__ == "__main__":
    # Check if the correct number of command-line arguments is provided
    if len(sys.argv) != 3:
        print("Usage: python script.py <ticker> <time_slot>")
        sys.exit(1)

    # Extract command-line arguments
    ticker = sys.argv[1]
    time_slot = sys.argv[2]

    # Calculate and print the volatility
    calculate_volatility(ticker, time_slot)
