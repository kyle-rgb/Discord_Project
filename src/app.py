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
import sqlite3 as sql, pandas as pd, time
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

@app.route('/mask/')
def mask():
    with sql.connect("../data/interim/stocks.db") as con:
            available_companies = pd.read_sql("SELECT DISTINCT company from daily WHERE company NOT IN ('VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX')", con=con).company.values
    
    with sql.connect("../data/interim/companies.db") as con:
        recomends = pd.read_sql("SELECT DISTINCT symbol from recommendations WHERE symbol NOT IN ('VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX')", con=con).symbol.values

    obj_dict = {"cos": list(available_companies), "rec": list(recomends)}

    return render_template('mask-test.html', obj_dict=obj_dict)

@app.route('/wordcloud/')
def cloud():

    with sql.connect("../data/interim/stocks.db") as con:
            available_companies = pd.read_sql("SELECT DISTINCT company from daily WHERE company NOT IN ('VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX')", con=con).company.values
            
    obj_dict = {"cos": list(available_companies)}
    
    return render_template('wordcloud.html', obj_dict=obj_dict)

@app.route('/gather-stock-data') 
def candle():
        wanted_stock = request.args.get("ticker")     
        with sql.connect("../data/interim/companies.db") as con:
            daily_data = pd.read_sql(f"SELECT * FROM daily WHERE symbol = '{wanted_stock}'", con=con).to_json(orient="records", double_precision=6)
            recomends = pd.read_sql(f"SELECT * from recommendations WHERE symbol = '{wanted_stock}'", con=con, parse_dates={'Date': '%Y-%m-%d %H:%M:%S'})
            recomends = recomends.assign(Date = lambda x: x.Date.apply(datetime.strftime, format='%Y-%m-%d')).to_json(orient='records')

        obj_dict = {"daily_data": daily_data, 'rec': recomends}
        return render_template("symbol.html", obj_dict=obj_dict)


@app.route('/emote/')
def emote():
    agg_dict = {}
    with sql.connect('data/discord.db') as con:
        pop_emote = pd.read_sql("SELECT * FROM chatEmotes WHERE unicode_name NOT LIKE '%skin_tone:' ORDER BY count DESC LIMIT 26", con=con)
        pop_emote = pop_emote.assign(code = lambda x: x.emote.apply(lambda x: "U+{:X}".format(ord(x))))
    obj_dict = {"emoji_data": pop_emote.to_json(orient="records")}
    return render_template('emote.html', obj_dict=obj_dict)


if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug = True)


