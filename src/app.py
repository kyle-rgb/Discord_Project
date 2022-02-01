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
import csv, json
import sqlite3 as sql, pandas as pd, time
from api_key import cryptor
from trader import new_port
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

    with sql.connect("../data/interim/companies.db") as con:
        available_companies = pd.read_sql("SELECT DISTINCT symbol from daily WHERE symbol NOT IN ('VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX')", con=con).symbol.values
        c_data = pd.read_sql(f"SELECT * from mentions LIMIT 100", con=con, index_col='pk')

    obj_dict = {"cos": list(available_companies), "c_data":c_data.to_json(orient='records')}
    
    return render_template('wordcloud.html', obj_dict=obj_dict)

@app.route('/gather-stock-data') 
def candle():
        wanted_stock = request.args.get("ticker")     
        with sql.connect("../data/interim/companies.db") as con:
            info = pd.read_sql(f"SELECT * FROM info JOIN (SELECT shortName compName, sector, symbol compSymbol FROM info WHERE compName LIKE '%Vanguard%' OR '%SPDR%') USING (sector) WHERE symbol='{wanted_stock}'", con=con, index_col='pk')
            daily_comps = pd.read_sql(f"SELECT * FROM daily WHERE symbol IN ('{info.compSymbol.values[0]}', 'SPY')", con=con).drop_duplicates(subset=['symbol', 'Date']).to_json(orient="records", double_precision=6)
            daily_data = pd.read_sql(f"SELECT * FROM daily WHERE symbol = '{wanted_stock}'", con=con).to_json(orient="records", double_precision=6)
            recomends = pd.read_sql(f"SELECT * from recommendations WHERE symbol = '{wanted_stock}'", con=con, parse_dates={'Date': '%Y-%m-%d %H:%M:%S'})
            recomends = recomends.assign(Date = lambda x: x.Date.apply(datetime.strftime, format='%Y-%m-%d')).to_json(orient='records')
            comments = pd.read_sql(f"SELECT * from symbol_comments", con=con)
            comp_sentiment = comments.comp_sent.mean()
            arts = pd.read_sql(f"SELECT pk, date, symbol, pos_sent, neg_sent, neu_sent, comp_sent from articles WHERE symbol = '{wanted_stock}'", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})

        with sql.connect("../data/raw/crypt.db") as con:
            second_arts = pd.read_sql(f"SELECT pk, date, symbol, pos_sent, neg_sent, neu_sent, comp_sent FROM crypt_articles WHERE symbol = '{wanted_stock}';", con=con)#.applymap(cryptor.decrypt)
            decrypt_cols = [x for x in second_arts.columns if x not in ['pk', 'pos_sent', "neu_sent", "neg_sent", "comp_sent"]]
            for col in decrypt_cols:
                second_arts.loc[:, col] = second_arts.loc[:, col].apply(bytes).apply(cryptor.decrypt).apply(str, encoding='utf-8')
                if col == 'date':
                    second_arts.loc[:, col] = second_arts.loc[:, col].apply(str.split, sep=" ").apply(lambda x: x[0]).apply(pd.to_datetime)

        
        arts = pd.concat([arts, second_arts], axis=0, ignore_index=True).sort_values('date').reset_index(drop=True).assign(date = lambda x: x.date.apply(datetime.strftime, format='%Y-%m-%d'))\
            .to_json(orient='records', double_precision=4)
        info = info.to_json(orient="records")
        comments=comments[lambda x: x.symbols.str.contains(wanted_stock)].loc[:, ['id', 'timestamp', 'symbols', 'pos_sent', 'neg_sent', 'neu_sent', 'comp_sent']].to_json(orient='records', double_precision=4)
        obj_dict = {"daily_data": daily_data, 'rec': recomends, 'articles': arts, "comp_sent_avg": comp_sentiment, "comments": comments,
        "daily_comps": daily_comps, 'info': info}
        
        return render_template("symbol.html", obj_dict=obj_dict)


@app.route('/emote/')
def emote():
    with sql.connect('data/discord.db') as con:
        pop_emote = pd.read_sql("SELECT * FROM chatEmotes WHERE unicode_name NOT LIKE '%skin_tone:' ORDER BY count DESC LIMIT 26", con=con)
        pop_emote = pop_emote.assign(code = lambda x: x.emote.apply(lambda x: "U+{:X}".format(ord(x))))
    obj_dict = {"emoji_data": pop_emote.to_json(orient="records")}
    return render_template('emote.html', obj_dict=obj_dict)


@app.route('/portfolio/')
def portfolio():
    with sql.connect('../data/interim/companies.db') as con:
        port = pd.read_sql(f"SELECT * FROM daily", con=con)
    obj_dict = {"port": port.to_json(orient="records", double_precision=2)}
    print(sys.getsizeof(obj_dict))
    return render_template('template.html', obj_dict=obj_dict)

@app.route('/templateVue/')
def tempateVue():
    with sql.connect('../data/interim/companies.db') as con:
        port = pd.read_sql(f"SELECT * FROM daily ORDER BY Date", con=con).drop_duplicates(subset=['Date', 'symbol'])
        recommends = pd.read_sql(f"SELECT Date, symbol, Firm, new_grade, prev_grade, Action from recommendations ORDER BY Date", con=con)
        arts =pd.read_sql("SELECT date, symbol, publisher, pos_sent, neu_sent, neg_sent, comp_sent FROM articles ORDER BY date", con=con)
        crypt_arts = pd.read_sql("SELECT date, symbol, publisher,pos_sent, neu_sent, neg_sent, comp_sent  FROM news_sentiment ORDER BY date", con=con)
        articles = pd.concat([arts, crypt_arts], axis=0, ignore_index=True).to_json(orient="records", double_precision=4)
        comments = pd.read_sql(f"SELECT timestamp, channel, symbols, pos_sent, neu_sent, neg_sent, comp_sent from symbol_comments ORDER BY timestamp", con=con)
        comments.loc[:, "symbols"] = comments.symbols.apply(lambda x: x.replace('BTC', 'BTC-USD'))
        companies = tuple(port.symbol.unique())
        c_data = pd.read_sql(f"SELECT * from mentions WHERE symbol IN {companies}", con=con, index_col='pk')

        
    obj_dict = {"port": new_port.to_json(orient="records", double_precision=6), "c_data": c_data.to_json(orient="records", double_precision=2),
    "recommends": recommends.to_json(orient='records'), "articles": articles, "comments": comments.to_json(orient="records", double_precision=4)}

    return render_template('templateVUE.html', obj_dict=obj_dict)




if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug = True)


