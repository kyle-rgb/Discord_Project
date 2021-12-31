# Import Dependencies 
from flask import Flask, request, render_template, redirect, jsonify, url_for 
from flask_pymongo import PyMongo
import psycopg2
import sys
from datetime import datetime
from pymongo import MongoClient
from bson.json_util import dumps
from bson.objectid import ObjectId
# import datetime as dt
from dateutil.parser import parse
import sys
import numpy as np
import os
import csv
import ETL
import yfinancex
import word_cloud




# Create an instance of Flask app
app = Flask(__name__)

@app.route('/')
def index():
    # word_cloud.Word_Cloud() # Writes HTML Figure hword
    return render_template('index.html')

@app.route('/', methods=['POST']) 
def Stock_Select(): 
    ETL.Stock_Select(request)
    return render_template('index.html')

@app.route('/profile/')
def profile():
    return render_template('profile.html')

@app.route('/StockETL/')
def StockETL():
    return render_template('StockETL.html') # Candle Stick Figure from ETL.py y-finance's scrape; the placeholder for all candlesticks on prev. dashboard

@app.route('/Searched_Stock/')
def Searched_Stock():
    return render_template('Stocksearch.html')  # Candle in Dashboard Enviroment

@app.route('/Searched_Ticker/')
def mSearched_Stock():
    return render_template('ticker.html')

@app.route('/dashboard')
def dash():

    return render_template('dashboard.html')

@app.route('/frequency/')
def sword():
    return render_template('word.html')

@app.route('/hfrequency/')
def hword():
    return render_template('lword.html')


@app.route('/User-Profile/')
def user():
    return render_template('user.html')

@app.route('/gather-stock-data') 
def candle():
        yfinancex.updateTable(request)
        return render_template("symbol.html")

@app.route('/i7')
def index7():
    return render_template('candle.html') # test typography for template


if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug = True)


