import sys 
import os
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt 
from flask import request 
import psycopg2

# Session is a temporary binding to our DB
from datetime import date, timedelta, datetime as dt
import plotly.graph_objects as go

from selenium import webdriver 
from selenium.webdriver.common.keys import Keys   
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

def stockData(symbol):
    ticks = yf.Ticker(symbol)
    currentDate = date.today()
    enddate = currentDate.strftime('%Y-%m-%d')
    four_yrs = currentDate - timedelta(days=1460)
    five_days = currentDate - timedelta(days=5)
    startdate = four_yrs.strftime('%Y-%m-%d')
    xdata_df = yf.download(symbol, period= '5d', interval ='1m')
    ydata_df = yf.download(symbol, start=startdate, end=enddate)
    ydata_df.columns = ["OPEN", "HIGH", "LOW", "CLOSE", "Adj Close", "Volume"]
    fig = go.Figure(data=go.Ohlc(x=xdata_df['Date'],
                open=xdata_df['Open'],
                high=xdata_df['High'],
                low=xdata_df['Low'],
                close=xdata_df['Close'],
                increasing_line_color= 'cyan', decreasing_line_color= 'gray'))

    fig.update_layout(
        title='Intraday',
        yaxis_title=f'{symbol} Stock',
        shapes = [dict(
            x0=five_days, x1=enddate, y0=0, y1=1, xref='x', yref='paper',
            line_width=2)],
        annotations=[dict(
            x=enddate, y=0.05, xref='x', yref='paper',
            showarrow=False, xanchor='left', text='Increase Period Begins')],
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
    )
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(showgrid=False)

    fig.update_layout(autosize=False, width=800, height=500)

    fig.write_html('templates/ticker.html')

    # creating the requisite CandleStick
    # stockv = yf.Ticker(stock)
    # sdate = (stockstdate)
    # edate = (stockedate)
    # data_df = yf.download(stock, start=sdate, end=edate)
    # data_df2 = data_df.reset_index(drop=False)

    # data_df2.columns = [ "Date", "OPEN", "HIGH", "LOW", "CLOSE", "ADJ Close", "Volume"]
    # data_df2 = data_df2.round({"OPEN": 2, "HIGH": 2, "LOW": 2, "CLOSE": 2})


    # fig = go.Figure(data=[go.Candlestick(x=data_df2["Date"],
    #             open=data_df2['OPEN'], high=data_df2['HIGH'],
    #             low=data_df2['LOW'], close=data_df2['CLOSE'])
    #                   ])

    # fig.update_layout(
    #  title="Requested Stock Info",
    #  yaxis_title=f"{stock}",
    #  paper_bgcolor='rgba(0,0,0,0)',
    #  plot_bgcolor='rgba(0,0,0,0)'
    #  )
    # fig.update_xaxes(showgrid=False)
    # fig.update_yaxes(showgrid=False)

    # fig.update_layout(autosize=False, width=800, height=500)


    daily_close = ydata_df[['Adj Close']]
    daily_pct_change = daily_close.pct_change()
    daily_pct_change.fillna(0, inplace=True)
    #daily_pct_change
    min_periods = 2

    # Calculate the volatility
    vol = (daily_pct_change.rolling(min_periods).std() * np.sqrt(min_periods))
    vol.columns = ["VOLATILITY"]
    vol.fillna(0, inplace=True)
    out = ticks.info.get('sharesOutstanding')
    daily_turnover = ydata_df[['Volume']]
    turnover = (daily_turnover/out) 
    turnover.columns = ["TURNOVER"]

    ydata_df["TURNOVER"] = turnover["TURNOVER"]
    ydata_df["VOLATILITY"] = vol["VOLATILITY"]
    data_df = ydata_df.drop(columns = ["Adj Close", "Volume"])

    df = data_df.reset_index()
    df = df.rename(columns = {"Date": "TIMESTAMP"})

    new_df = df.round({"OPEN": 2, "HIGH": 2, "LOW": 2, "CLOSE": 2})
    new_df



    TIMESTAMP = new_df["TIMESTAMP"].to_list()
    OPEN = new_df["OPEN"].to_list()
    HIGH = new_df["HIGH"].to_list()
    LOW = new_df["LOW"].to_list()
    CLOSE = new_df["CLOSE"].to_list()
    TURNOVER = new_df["TURNOVER"].to_list()
    VOLATILITY = new_df["VOLATILITY"].to_list()
    vol_dict = {"TIMESTAMP": TIMESTAMP, "OPEN": OPEN, "HIGH": HIGH, "LOW ": LOW , "CLOSE": CLOSE, "TURNOVER": TURNOVER, "VOLATILITY": VOLATILITY,}
    ticker_df = pd.DataFrame(vol_dict)
    return ticker_df

def stockDataBY(symbol):
    
    ticks = yf.Ticker(symbol)
    currentDate = date.today()
    enddate = currentDate.strftime('%Y-%m-%d')
    five_yrs = currentDate - timedelta(days=1825)
    startdate = five_yrs.strftime('%Y-%m-%d')
    ydata_df = yf.download(symbol, start=startdate, end=enddate)
    date_list = pd.bdate_range(start=startdate, end=enddate, freq='BY')
    ticked_off = [ydata_df.loc[ydata_df.index == date] for date in date_list]
    ticker_5yr_df = pd.concat([ticked_off[0], ticked_off[1], ticked_off[2], ticked_off[3], ticked_off[4]])
    return ydata_df, ticker_5yr_df

def get_financial_report(ticker):
    driver = webdriver.Firefox(executable_path= "geckodriver.exe")
    driver.maximize_window()
    driver.get('https://www.marketwatch.com/investing/stock/'+ticker+'/financials')
    timeout = 20
#     ''''
#     Find an ID on the page and wait before executing anything until found. After searching multiple times, 
#     You will be prompted to subscribe so there was a need to close out the subscribe overlay. 
#     ''''
    try:
        WebDriverWait(driver, timeout).until(EC.visibility_of_element_located((By.ID, "cx-scrim-wrapper")))
    except TimeoutException:
        driver.quit()
    subscribe = driver.find_element_by_xpath('/html/body/footer/div[2]/div/div/div[1]')
    subscribe.click()
    
#     ''''
#     For the income statement, balance sheet, and cashflow;  you can scrape the tables and tranpose them to 
#     the years going 5 years back, for any calculations that might need to be done in the future. We kept all information
#     including empty columns just in case companies had more detailed reports and information. However for the 
#     most part all have the same format on market watch making it easily updateable and great for a search bar. 
#     ''''

    income_table = driver.find_element_by_class_name("overflow--table").get_attribute('innerHTML')
    income  = pd.read_html(income_table)
    income_df = income[0]
    income_df.drop(columns=['5-year trend'], axis=1, inplace=True)
    income_df2 = income_df.T
    income_new_col = income_df2.iloc[0,:].values
    income_df2.columns= income_new_col
    income_df2.drop(index='Item  Item', inplace=True)
    income_df2.rename(columns={'Sales/Revenue  Sales/Revenue': 'Sales/Revenue' , 
                               'Sales Growth  Sales Growth': 'Sales Growth',
           'Cost of Goods Sold (COGS) incl. D&A  Cost of Goods Sold (COGS) incl. D&A': 'Cost of Goods Sold (COGS) incl. D&A',
           'COGS Growth  COGS Growth': 'COGS Growth', 'COGS excluding D&A  COGS excluding D&A': 'COGS excluding D&A',
           'Depreciation & Amortization Expense  Depreciation & Amortization Expense': 'Depreciation & Amortization Expense',
           'Depreciation  Depreciation': 'Depreciation',
           'Amortization of Intangibles  Amortization of Intangibles': 'Amortization of Intangibles',
           'Gross Income  Gross Income': 'Gross Income',
           'Gross Income Growth  Gross Income Growth': 'Gross Income Growth',
           'Gross Profit Margin  Gross Profit Margin': 'Gross Profit Margin',
           'SG&A Expense  SG&A Expense': 'SG&A Expense', 'SGA Growth  SGA Growth': 'SGA Growth',
           'Research & Development  Research & Development': 'Research & Development',
           'Other SG&A  Other SG&A':  'Other SG&A',
           'Other Operating Expense  Other Operating Expense': 'Other Operating Expense',
           'Unusual Expense  Unusual Expense': 'Unusual Expense',
           'EBIT after Unusual Expense  EBIT after Unusual Expense': 'EBIT after Unusual Expense',
           'Non Operating Income/Expense  Non Operating Income/Expense': 'Non Operating Income/Expense',
           'Non-Operating Interest Income  Non-Operating Interest Income': 'Non-Operating Interest Income',
           'Equity in Affiliates (Pretax)  Equity in Affiliates (Pretax)': 'Equity in Affiliates (Pretax)',
           'Interest Expense  Interest Expense': 'Interest Expense',
           'Interest Expense Growth  Interest Expense Growth': 'Interest Expense Growth',
           'Gross Interest Expense  Gross Interest Expense': 'Gross Interest Expense',
           'Interest Capitalized  Interest Capitalized': 'Interest Capitalized',
           'Pretax Income  Pretax Income': 'Pretax Income',
           'Pretax Income Growth  Pretax Income Growth': 'Pretax Income Growth',
           'Pretax Margin  Pretax Margin': 'Pretax Margin', 'Income Tax  Income Tax': 'Income Tax',
           'Income Tax - Current Domestic  Income Tax - Current Domestic': 'Income Tax - Current Domestic',
           'Income Tax - Current Foreign  Income Tax - Current Foreign': 'Income Tax - Current Foreign',
           'Income Tax - Deferred Domestic  Income Tax - Deferred Domestic': 'Income Tax - Deferred Domestic',
           'Income Tax - Deferred Foreign  Income Tax - Deferred Foreign': 'Income Tax - Deferred Foreign',
           'Income Tax Credits  Income Tax Credits': 'Income Tax Credits',
           'Equity in Affiliates  Equity in Affiliates': 'Equity in Affiliates',
           'Other After Tax Income (Expense)  Other After Tax Income (Expense)': 'Other After Tax Income (Expense)',
           'Consolidated Net Income  Consolidated Net Income': 'Consolidated Net Income',
           'Minority Interest Expense  Minority Interest Expense': 'Minority Interest Expense',
           'Net Income  Net Income': 'Net Income', 'Net Income Growth  Net Income Growth': 'Net Income Growth',
           'Net Margin Growth  Net Margin Growth': 'Net Margin Growth',
           'Extraordinaries & Discontinued Operations  Extraordinaries & Discontinued Operations': 'Extraordinaries & Discontinued Operations',
           'Extra Items & Gain/Loss Sale Of Assets  Extra Items & Gain/Loss Sale Of Assets': 'Extra Items & Gain/Loss Sale Of Assets',
           'Cumulative Effect - Accounting Chg  Cumulative Effect - Accounting Chg': 'Cumulative Effect - Accounting Chg',
           'Discontinued Operations  Discontinued Operations': 'Discontinued Operations',
           'Net Income After Extraordinaries  Net Income After Extraordinaries': 'Net Income After Extraordinaries',
           'Preferred Dividends  Preferred Dividends': 'Preferred Dividends',
           'Net Income Available to Common  Net Income Available to Common': 'Net Income Available to Common',
           'EPS (Basic)  EPS (Basic)': 'EPS (Basic)', 'EPS (Basic) Growth  EPS (Basic) Growth': 'EPS (Basic) Growth',
           'Basic Shares Outstanding  Basic Shares Outstanding': 'Basic Shares Outstanding',
           'EPS (Diluted)  EPS (Diluted)': 'EPS (Diluted)',
           'EPS (Diluted) Growth  EPS (Diluted) Growth': 'EPS (Diluted) Growth',
           'Diluted Shares Outstanding  Diluted Shares Outstanding': 'Diluted Shares Outstanding',
           'EBITDA  EBITDA': 'EBITDA', 'EBITDA Growth  EBITDA Growth': 'EBITDA Growth',
           'EBITDA Margin  EBITDA Margin': 'EBITDA Margin'}, inplace=True)
    #income_df2.to_csv('../data/interim/income_statement.csv')
    
    driver.get('https://www.marketwatch.com/investing/stock/'+ticker+'/financials/balance-sheet')
    balance_sheet_table = [table.get_attribute('innerHTML') for table in driver.find_elements_by_class_name("overflow--table")]
    balance_sheet = pd.read_html(balance_sheet_table[0])
    balance_sheet1 = pd.read_html(balance_sheet_table[1])
    balance_sheet_df = pd.concat([balance_sheet[0], balance_sheet1[0]])
    balance_sheet_df.drop(columns=['5-year trend'], axis=1, inplace=True)
    balance_sheet_df2 = balance_sheet_df.T
    balance_sheet_col = balance_sheet_df2.iloc[0,:].values
    balance_sheet_df2.columns= balance_sheet_col
    balance_sheet_df2.drop(index='Item  Item', inplace=True)
    balance_sheet_df2.rename(columns={'Cash & Short Term Investments  Cash & Short Term Investments': 'Cash & Short Term Investments',
           'Cash & Short Term Investments Growth  Cash & Short Term Investments Growth': 'Short Term Investments Growth',
           'Cash Only  Cash Only': 'Cash Only',
           'Short-Term Investments  Short-Term Investments': 'Short-Term Investments',
           'Cash & ST Investments / Total Assets  Cash & ST Investments / Total Assets': 'Cash & ST Investments / Total Assets',
           'Total Accounts Receivable  Total Accounts Receivable': 'Total Accounts Receivable',
           'Total Accounts Receivable Growth  Total Accounts Receivable Growth': 'Total Accounts Receivable Growth',
           'Accounts Receivables, Net  Accounts Receivables, Net': 'Accounts Receivables, Net',
           'Accounts Receivables, Gross  Accounts Receivables, Gross': 'Accounts Receivables, Gross',
           'Bad Debt/Doubtful Accounts  Bad Debt/Doubtful Accounts': 'Bad Debt/Doubtful Accounts',
           'Other Receivable  Other Receivable': 'Other Receivable',
           'Accounts Receivable Turnover  Accounts Receivable Turnover': 'Accounts Receivable Turnover',
           'Inventories  Inventories': 'Inventories', 'Finished Goods  Finished Goods': 'Finished Goods',
           'Work in Progress  Work in Progress': 'Work in Progress', 'Raw Materials  Raw Materials': 'Raw Materials',
           'Progress Payments & Other  Progress Payments & Other': 'Progress Payments & Other',
           'Other Current Assets  Other Current Assets': 'Other Current Assets',
           'Miscellaneous Current Assets  Miscellaneous Current Assets': 'Miscellaneous Current Assets',
           'Total Current Assets  Total Current Assets': 'Total Current Assets',
           'Net Property, Plant & Equipment  Net Property, Plant & Equipment': 'Net Property, Plant & Equipment',
           'Property, Plant & Equipment - Gross  Property, Plant & Equipment - Gross': 'Property, Plant & Equipment - Gross',
           'Buildings  Buildings': 'Buildings', 'Land & Improvements  Land & Improvements': 'Land & Improvements',
           'Computer Software and Equipment  Computer Software and Equipment': 'Computer Software and Equipment',
           'Other Property, Plant & Equipment  Other Property, Plant & Equipment': 'Other Property, Plant & Equipment',
           'Accumulated Depreciation  Accumulated Depreciation': 'Accumulated Depreciation',
           'Total Investments and Advances  Total Investments and Advances': 'Total Investments and Advances',
           'Other Long-Term Investments  Other Long-Term Investments': 'Other Long-Term Investments',
           'Long-Term Note Receivables  Long-Term Note Receivables': 'Long-Term Note Receivables',
           'Intangible Assets  Intangible Assets': 'Intangible Assets', 'Net Goodwill  Net Goodwill': 'Net Goodwill',
           'Net Other Intangibles  Net Other Intangibles': 'Net Other Intangibles',
           'Other Assets  Other Assets': 'Other Assets', 'Total Assets  Total Assets': 'Total Assets',
           'Total Assets Growth  Total Assets Growth': 'Total Assets Growth','ST Debt & Current Portion LT Debt  ST Debt & Current Portion LT Debt':'ST Debt & Current Portion LT Debt',
           'Short Term Debt  Short Term Debt': 'Short Term Debt',
           'Current Portion of Long Term Debt  Current Portion of Long Term Debt': 'Current Portion of Long Term Debt',
           'Accounts Payable  Accounts Payable': 'Accounts Payable',
           'Accounts Payable Growth  Accounts Payable Growth': 'Accounts Payable Growth',
           'Income Tax Payable  Income Tax Payable': 'Income Tax Payable',
           'Other Current Liabilities  Other Current Liabilities': 'Other Current Liabilities',
           'Dividends Payable  Dividends Payable': 'Dividends Payable',
           'Accrued Payroll  Accrued Payroll': 'Accrued Payroll',
           'Miscellaneous Current Liabilities  Miscellaneous Current Liabilities': 'Miscellaneous Current Liabilities',
           'Total Current Liabilities  Total Current Liabilities': 'Total Current Liabilities',
           'Long-Term Debt  Long-Term Debt': 'Long-Term Debt',
           'Long-Term Debt excl. Capitalized Leases  Long-Term Debt excl. Capitalized Leases': 'Long-Term Debt excl. Capitalized Leases',
           'Non-Convertible Debt  Non-Convertible Debt': 'Non-Convertible Debt',
           'Convertible Debt  Convertible Debt': 'Convertible Debt',
           'Capitalized Lease Obligations  Capitalized Lease Obligations': 'Capitalized Lease Obligations',
           'Provision for Risks & Charges  Provision for Risks & Charges': 'Provision for Risks & Charges',
           'Deferred Taxes  Deferred Taxes': 'Deferred Taxes',
           'Deferred Taxes - Credits  Deferred Taxes - Credits': 'Deferred Taxes - Credits',
           'Deferred Taxes - Debit  Deferred Taxes - Debit': 'Deferred Taxes - Debit',
           'Other Liabilities  Other Liabilities': 'Other Liabilities',
           'Other Liabilities (excl. Deferred Income)  Other Liabilities (excl. Deferred Income)': 'Other Liabilities (excl. Deferred Income)',
           'Deferred Income  Deferred Income': 'Deferred Income',
           'Total Liabilities  Total Liabilities': 'Total Liabilities',
           'Non-Equity Reserves  Non-Equity Reserves': 'Non-Equity Reserves',
           'Total Liabilities / Total Assets  Total Liabilities / Total Assets': 'Total Liabilities / Total Assets',
           'Preferred Stock (Carrying Value)  Preferred Stock (Carrying Value)': 'Preferred Stock (Carrying Value)',
           'Redeemable Preferred Stock  Redeemable Preferred Stock': 'Redeemable Preferred Stock',
           'Non-Redeemable Preferred Stock  Non-Redeemable Preferred Stock': 'Non-Redeemable Preferred Stock',
           'Common Equity (Total)  Common Equity (Total)': 'Common Equity (Total)',
           'Common Equity / Total Assets  Common Equity / Total Assets': 'Common Equity / Total Assets',
           'Common Stock Par/Carry Value  Common Stock Par/Carry Value': 'Common Stock Par/Carry Value',
           'Retained Earnings  Retained Earnings': 'Retained Earnings',
           'ESOP Debt Guarantee  ESOP Debt Guarantee': 'ESOP Debt Guarantee',
           'Cumulative Translation Adjustment/Unrealized For. Exch. Gain  Cumulative Translation Adjustment/Unrealized For. Exch. Gain': 'Cumulative Translation Adjustment/Unrealized For. Exch. Gain',
           'Unrealized Gain/Loss Marketable Securities  Unrealized Gain/Loss Marketable Securities': 'Unrealized Gain/Loss Marketable Securities',
           'Revaluation Reserves  Revaluation Reserves':  'Revaluation Reserves',
           'Treasury Stock  Treasury Stock': 'Treasury Stock',
           "Total Shareholders' Equity  Total Shareholders' Equity": 'Total Shareholders Equity',
           "Total Shareholders' Equity / Total Assets  Total Shareholders' Equity / Total Assets": 'Total Shareholders Equity / Total Assets',
           'Accumulated Minority Interest  Accumulated Minority Interest': 'Accumulated Minority Interest',
           'Total Equity  Total Equity': 'Total Equity',
           "Liabilities & Shareholders' Equity  Liabilities & Shareholders' Equity": 'Liabilities & Shareholders Equity'}, inplace=True)
    #balance_sheet_df2.to_csv('../data/interim/balance_sheet.csv')
    
#     timeout = 20
#     # Find an ID on the page and wait before executing anything until found: 
#     try:
#         WebDriverWait(driver, timeout).until(EC.visibility_of_element_located((By.ID, "cx-scrim-wrapper")))
#     except TimeoutException:
#         driver.quit()
#     subscribe = driver.find_element_by_xpath('/html/body/footer/div[2]/div/div/div[1]')
#     subscribe.click()

    driver.get('https://www.marketwatch.com/investing/stock/'+ticker+'/financials/cash-flow')
    cashflow_table = [table.get_attribute('innerHTML') for table in driver.find_elements_by_class_name("overflow--table")]
    cashflow = pd.read_html(cashflow_table[0])
    cashflow1 = pd.read_html(cashflow_table[1])
    cashflow_df = pd.concat([cashflow[0], cashflow1[0]]) 
    cashflow_df.drop(columns=['5-year trend'], axis=1, inplace=True)
    cashflow_df2 = cashflow_df.T
    cashflow_new_col = cashflow_df2.iloc[0,:].values
    cashflow_df2.columns= cashflow_new_col
    cashflow_df2.drop(index='Item  Item', inplace=True)
    cashflow_df2.rename(columns={'Net Income before Extraordinaries  Net Income before Extraordinaries': 'Net Income before Extraordinaries',
           'Net Income Growth  Net Income Growth': 'Net Income Growth',
           'Depreciation, Depletion & Amortization  Depreciation, Depletion & Amortization': 'Depletion & Amortization',
           'Depreciation and Depletion  Depreciation and Depletion': 'Depreciation and Depletion',
           'Amortization of Intangible Assets  Amortization of Intangible Assets': 'Amortization of Intangible Assets',
           'Deferred Taxes & Investment Tax Credit  Deferred Taxes & Investment Tax Credit': 'Deferred Taxes & Investment Tax Credit' ,
           'Deferred Taxes  Deferred Taxes': 'Deferred Taxes',
           'Investment Tax Credit  Investment Tax Credit': 'Investment Tax Credit',
           'Other Funds  Other Funds': 'Other Funds' ,
           'Funds from Operations  Funds from Operations': 'Funds from Operations',
           'Extraordinaries  Extraordinaries': 'Extraordinaries',
           'Changes in Working Capital  Changes in Working Capital': 'Changes in Working Capital',
           'Receivables  Receivables': 'Receivables', 'Accounts Payable  Accounts Payable': 'Accounts Payable',
           'Other Assets/Liabilities  Other Assets/Liabilities': 'Other Assets/Liabilities',
           'Net Operating Cash Flow  Net Operating Cash Flow': 'Net Operating Cash Flow',
           'Net Operating Cash Flow Growth  Net Operating Cash Flow Growth': 'Net Operating Cash Flow Growth',
           'Net Operating Cash Flow / Sales  Net Operating Cash Flow / Sales': 'Net Operating Cash Flow / Sales',
           'Capital Expenditures  Capital Expenditures': 'Capital Expenditures' ,
           'Capital Expenditures Growth  Capital Expenditures Growth': 'Capital Expenditures Growth',
           'Capital Expenditures / Sales  Capital Expenditures / Sales': 'Capital Expenditures / Sales',
           'Capital Expenditures (Fixed Assets)  Capital Expenditures (Fixed Assets)': 'Capital Expenditures (Fixed Assets)',
           'Capital Expenditures (Other Assets)  Capital Expenditures (Other Assets)': 'Capital Expenditures (Other Assets)',
           'Net Assets from Acquisitions  Net Assets from Acquisitions': 'Net Assets from Acquisitions',
           'Sale of Fixed Assets & Businesses  Sale of Fixed Assets & Businesses': 'Sale of Fixed Assets & Businesses',
           'Purchase/Sale of Investments  Purchase/Sale of Investments': 'Purchase/Sale of Investments',
           'Purchase of Investments  Purchase of Investments': 'Purchase of Investments',
           'Sale/Maturity of Investments  Sale/Maturity of Investments': 'Sale/Maturity of Investments',
           'Other Uses  Other Uses': 'Other Uses', 'Other Sources  Other Sources': 'Other Sources',
           'Net Investing Cash Flow  Net Investing Cash Flow': 'Net Investing Cash Flow',
           'Net Investing Cash Flow Growth  Net Investing Cash Flow Growth': 'Net Investing Cash Flow Growth',
           'Net Investing Cash Flow / Sales  Net Investing Cash Flow / Sales': 'Net Investing Cash Flow / Sales'}, inplace=True)
    #cashflow_df2.to_csv('../data/interim/cashflows.csv')
    driver.quit()
    return income_df2, balance_sheet_df2, cashflow_df2