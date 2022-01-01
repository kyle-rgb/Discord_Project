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
# import ETL
# # import yfinancex
# # import word_cloud




# Create an instance of Flask app
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/', methods=['POST']) 
def Stock_Select(): 
    return render_template('index.html')

@app.route('/profile/')
def profile():
    return render_template('profile.html')

@app.route('/StockETL/')
def StockETL():
    return render_template('charts/StockETL.html') # Candle Stick Figure from ETL.py y-finance's scrape; the placeholder for all candlesticks on prev. dashboard

@app.route('/dashboard')
def dash():

    return render_template('dashboard.html')

@app.route('/frequency/')
def sword():
    return render_template('charts/word.html')

@app.route('/lword/')
def hword():
    return render_template('charts/lword.html')


@app.route('/User-Profile/')
def user():
    return render_template('user.html')

@app.route('/gather-stock-data') 
def candle():
        return render_template("symbol.html")



if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug = True)


