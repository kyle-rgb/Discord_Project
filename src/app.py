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
import csv, json, zipfile
import sqlite3 as sql, pandas as pd, time, datetime as dt
from api_key import cryptor
from trader import apiHelper, new_port
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

@app.route('/AppAPI')
def gather_chart_data():
    cl_time = time.perf_counter()
    methods = request.args.get("method").split(',')
    min_samples = list(map(int, request.args.get('min_samples').split(',')))
    sentiment_threshold = list(map(float, request.args.get('threshold').split(',')))
    args = []
    method_indexer = {'recommendations': {'sent_name': 'new_sent', 'range_i': 2, 'range_j': 3,'div': 1}, 'comments': {'sent_name': 'comp_sent', 'range_i': 0, 'range_j': 1, 'div': 100}, 'articles': {'sent_name': 'comp_sent', 'range_i': 1, 'range_j': 5,'div': 100}}
    print(methods)
    for i, m in enumerate(methods):
        args.append({'name': m, 'sent_name': method_indexer[m].get('sent_name'), 'min_samples': min_samples[method_indexer[m].get('range_i')], 'min_sent': sentiment_threshold[method_indexer[m].get('range_j')]/method_indexer[m].get('div')})

    print(args)
    # support sentiment sentiment ranges, sentiment-thresholds, named calls]
    tada = apiHelper(wanted_sentiments=args)
    tada = tada.to_json(orient='records', double_precision=4)


    return tada

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

@app.route('/wordcloud/')
def cloud():
    month_parse = {'01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'}

    with sql.connect("../data/processed/temp_c.db") as con:
        available_companies = pd.read_sql("SELECT DISTINCT symbol from daily WHERE symbol NOT IN ('VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX', 'PT')", con=con).symbol.values
        c_data = pd.read_sql(f"SELECT * from mentions LIMIT 100", con=con, index_col='pk')
        articles_sent = pd.read_sql(f"SELECT month, symbol, COUNT(comments) article_count, AVG(comments) engagement, AVG(pos_sent) pos_sent_avg, AVG(neg_sent) neg_sent_avg, AVG(neu_sent) neu_sent_avg, AVG(comp_sent) comp_sent_avg FROM news_sentiment JOIN (SELECT pk, STRFTIME('%Y-%m', date) month, symbol, comments  FROM articles) USING (pk) WHERE month LIKE '2020%' OR month LIKE '2021%' GROUP BY month, symbol", con=con)
        comments_sent = pd.read_sql(f'SELECT date month, symbols symbol, pos_sent, neg_sent, neu_sent, comp_sent FROM symbol_comments', con=con, parse_dates={'month': '%Y-%m-%d  %H:%M:%S'})
        comments_sent = comments_sent.assign(symbol=lambda x: x.symbol.apply(str.split, sep=','))\
            .assign(month = lambda x: x.month.apply(dt.datetime.strftime, format='%b %Y')).explode('symbol')
        port = pd.read_sql("SELECT DATE(Date) date, Open, Close, Volatility, symbol FROM daily WHERE symbol NOT IN ('IT', 'PT', 'ON')", con=con, parse_dates={'date': '%Y-%m-%d'})
    
    comments_sent = comments_sent.groupby(['month', 'symbol']).agg({'pos_sent': 'mean', 'neg_sent': 'mean', 'neu_sent': 'mean', 'comp_sent': ['mean', 'count']}).reset_index().droplevel(0, axis=1)
    comments_sent.columns = ['month', 'symbol', 'pos_sent_avg', 'neg_sent_avg', 'neu_sent_avg', 'comp_sent_avg','engagement']
    comments_sent = comments_sent.assign(article_count = lambda x: 1)
    articles_sent = articles_sent.assign(month = lambda x: x.month.apply(lambda m: month_parse[m.split(sep='-')[1]] + " " + m.split(sep='-')[0]))[lambda x: ~(x.symbol.isin({'PT', 'IT', "ON", "ING"}))]
    

    with sql.connect("../data/processed/discord.db") as con:
        pop_emote = pd.read_sql("SELECT * FROM chatEmotes WHERE unicode_name NOT LIKE '%skin_tone:' ORDER BY count DESC LIMIT 26", con=con)
        pop_emote = pop_emote.assign(code = lambda x: x.emote.apply(lambda x: "U+{:X}".format(ord(x)))).to_json(orient='records')
        


    obj_dict = {"cos": list(available_companies), "c_data":c_data.to_json(orient='records'), 'pop_emote': pop_emote, 'arts': articles_sent.to_json(orient='records', double_precision=4),\
        'port': port.to_json(orient='records', double_precision=4), 'articlesSent': articles_sent.to_json(orient='records', double_precision=4), 'commentsSent': comments_sent.to_json(orient='records', double_precision=4)}
    
    return render_template('wordcloud.html', obj_dict=obj_dict)

@app.route('/gather-stock-data') 
def candle():
        wanted_stock = request.args.get("ticker")     
        with sql.connect("../data/processed/temp_c.db") as con:
            info = pd.read_sql(f"SELECT * FROM info JOIN (SELECT shortName compName, sector, symbol compSymbol FROM info WHERE compName LIKE '%Vanguard%' OR '%SPDR%') USING (sector) WHERE symbol='{wanted_stock}'", con=con, index_col='pk')
            daily_comps = pd.read_sql(f"SELECT * FROM daily WHERE symbol IN ('{info.compSymbol.values[0]}', 'SPY')", con=con).drop_duplicates(subset=['symbol', 'Date']).to_json(orient="records", double_precision=6)
            daily_data = pd.read_sql(f"SELECT * FROM daily WHERE symbol = '{wanted_stock}'", con=con).to_json(orient="records", double_precision=6)
            recomends = pd.read_sql(f"SELECT * from recommendations WHERE symbol = '{wanted_stock}'", con=con, parse_dates={'Date': '%Y-%m-%d %H:%M:%S'})
            recomends = recomends.assign(Date = lambda x: x.Date.apply(datetime.strftime, format='%Y-%m-%d')).to_json(orient='records')
            comments = pd.read_sql(f"SELECT * from symbol_comments", con=con)
            comp_sentiment = comments.comp_sent.mean()
            arts =pd.read_sql(f"SELECT date, symbol, pos_sent, neu_sent, neg_sent, comp_sent, symbol FROM (SELECT * FROM news_sentiment JOIN (SELECT * FROM articles) USING (pk)) WHERE symbol ='{wanted_stock}'", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})
        
        arts = arts.iloc[:, :-1]
        arts = arts.assign(date = lambda x: x.date.apply(datetime.strftime, format='%Y-%m-%d'))\
            .to_json(orient='records', double_precision=4)
        
        info = info.to_json(orient="records")
        comments=comments[lambda x: x.symbols.str.contains(wanted_stock)].loc[:, ['date', 'symbols', 'pos_sent', 'neg_sent', 'neu_sent', 'comp_sent']].to_json(orient='records', double_precision=4)
        obj_dict = {"daily_data": daily_data, 'rec': recomends, 'articles': arts, "comp_sent_avg": comp_sentiment, "comments": comments,
        "daily_comps": daily_comps, 'info': info}
        
        return render_template("symbol.html", obj_dict=obj_dict)


@app.route('/emote/')
def emote():
    with sql.connect('../data/processed/discord.db') as con:
        pop_emote = pd.read_sql("SELECT * FROM chatEmotes WHERE unicode_name NOT LIKE '%skin_tone:' ORDER BY count DESC LIMIT 26", con=con)
        pop_emote = pop_emote.assign(code = lambda x: x.emote.apply(lambda x: "U+{:X}".format(ord(x)))).to_json(orient='records')
    obj_dict = {"emoji_data": pop_emote}
    return render_template('emote.html', obj_dict=obj_dict)


@app.route('/portfolio/')
def portfolio():
    with sql.connect('../data/processed/temp_c.db') as con:
        port = pd.read_sql(f"SELECT * FROM daily", con=con).drop_duplicates(subset=['Date', 'symbol'])
    obj_dict = {"port": port.to_json(orient="records", double_precision=2)}
    return render_template('template.html', obj_dict=obj_dict)

@app.route('/templateVue/')
def tempateVue():
    with sql.connect('../data/processed/temp_c.db') as con:
        port = pd.read_sql(f"SELECT * FROM daily ORDER BY Date", con=con).drop_duplicates(subset=['Date', 'symbol'])
        recommends = pd.read_sql(f"SELECT Date, symbol, Firm, new_grade, prev_grade, Action from recommendations ORDER BY Date", con=con)
        articles =pd.read_sql("SELECT date, symbol, publisher, pos_sent, neu_sent, neg_sent, comp_sent FROM (SELECT * FROM news_sentiment JOIN (SELECT * FROM articles) USING (pk))", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})
        comments = pd.read_sql(f"SELECT date, channel, symbols, pos_sent, neu_sent, neg_sent, comp_sent from symbol_comments ORDER BY date", con=con)
        comments.loc[:, "symbols"] = comments.symbols.apply(lambda x: x.replace('BTC', 'BTC-USD'))
        companies = tuple(port.symbol.unique())
        c_data = pd.read_sql(f"SELECT * from mentions WHERE symbol IN {companies}", con=con, index_col='pk')

    obj_dict = {"port": new_port.to_json(orient="records", double_precision=6), "c_data": c_data.to_json(orient="records", double_precision=2),
    "recommends": recommends.to_json(orient='records'), "articles": articles.to_json(orient="records", double_precision=4), "comments": comments.to_json(orient="records", double_precision=4)}
    
    return render_template('templateVUE.html', obj_dict=obj_dict)

if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug = True)


