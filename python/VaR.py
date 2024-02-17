import yfinance as yf
import sys
import numpy as np
import pandas as pd
import yfinance as yf
import datetime as dt
import matplotlib.pyplot as plt
from xml.etree import ElementTree as ET
from io import BytesIO

"""
This file takes the arguments ticker and days to calculate the VaR (Value at Risk). The VaR is printed as a number between -1 and 1 and represents a percentage. If the 1d VaR of a stock is -2.5%, there is a 5% probability of losing 2,5% of an investment
Arguments:
- Ticker: String, remember to use suffix '.OL' after ticker for stocks on the OSE
- days: String, user chooses between daily, 1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y VaR
"""

def calculate_var(returns, confidence_level=0.95):
    return np.percentile(returns, (1-confidence_level)*100)

if __name__ == "__main__":
    # Check if the correct number of command-line arguments is provided
    if len(sys.argv) > 3 or len(sys.argv) < 2:
        raise Exception("Manglende argumenter")

    # Extract command-line arguments
    ticker = sys.argv[1]
    time_slot = sys.argv[2]

    available_time_slot = "1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y".split(", ")

    if time_slot not in available_time_slot:
        raise Exception("Ikke støttet tidsvindu. Please choose from: 1d, 1wk, 1mo, ytd, 1y, 3y, 5y, 10y")
    
    today = dt.datetime.now()
    start_date = dt.datetime(2005, 12, 31)

    global_var = 0

    try:
        data = yf.download(ticker, start=start_date, end=today)
        if time_slot == '1d':
            data['1d'] = data['Adj Close'].pct_change()
            var = calculate_var(data['1d'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['1d'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for 1-Day Returns')
            

        elif time_slot == '1wk':
            data['1wk'] = data['Adj Close'].pct_change(periods=7)
            var = calculate_var(data['1wk'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['1wk'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for 7-Day Returns')
           

        elif time_slot == '1mo':
            data['1mo'] = data['Adj Close'].pct_change(periods=31)
            var = calculate_var(data['1mo'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['1mo'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for 1-month Returns')
            
        elif time_slot == 'ytd':
            year = today.year
            first = dt.datetime(year,1,1)
            diff = today.day - first.day
            data['ytd'] = data['Adj Close'].pct_change(periods=diff)
            var = calculate_var(data['ytd'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['ytd'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for year-to-date Returns')
            
        elif time_slot == '1y':
            data['1y'] = data['Adj Close'].pct_change(periods=365)
            var = calculate_var(data['1y'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['1y'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for 1-year Returns')
            
        elif time_slot == '3y':
            data['3y'] = data['Adj Close'].pct_change(periods=365*3)
            var = calculate_var(data['3y'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['3y'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for 3-year Returns')
            
        elif time_slot == '5y':
            data['5y'] = data['Adj Close'].pct_change(periods=365*5)
            var = calculate_var(data['5y'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['5y'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for 5-year Returns')
           
        elif time_slot == '10y':
            data['10y'] = data['Adj Close'].pct_change(periods=365*10)
            var = calculate_var(data['10y'].dropna())
            global_var = var

            figure = plt.figure(figsize=(10, 6))
            plt.hist(data['10y'], bins=100, density=True, alpha=0.8, color='b')
            plt.axvline(x=var, color='red', linestyle='--', label=f'95% VaR: {(var*100):.2f}%')
            plt.title('VaR Distribution for 10-year Returns')
            
        plt.xlabel('Returns')
        plt.ylabel('Frequency')
        plt.legend()
        plt.grid(True)

        try:
            buffer = BytesIO()
            plt.savefig(buffer, format="svg")
            buffer.seek(0)

            # Parse the XML from the buffer
            xml_data = buffer.getvalue().decode("utf-8")
            tree = ET.ElementTree(ET.fromstring(xml_data))

            # You can now use the 'tree' variable to access the XML structure
            # For example, to get the root element:
            root_element = tree.getroot()

            # Print or use the XML string as needed
            print(f"<valueatrisk>{global_var}</valueatrisk>")
            print(xml_data)
            # with open("../VaR.svg", "w", encoding="utf-8") as f:
            #     f.write(xml_data)
        except Exception as error:
            print(error)


        # print(var)

    

    except IndexError:
        print('Ikke nok data tilgjengelig til å regne VaR. Velg en kortere tidsperiode')
    except Exception as e:
        print(e)
    except:
        print('Noe er galt med ticker. Det kan også hende aksjen ikke er tilgjengelig på yfinance for øyeblikket')