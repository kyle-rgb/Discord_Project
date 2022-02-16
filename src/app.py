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


def sent_help(s):
    if s >= .1200:
        return 'positive'
    elif s >= 0:
        return 'neutral'
    else:
        return 'negative' 

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
    ratings_parse = {'Very Bearish': 1, 'Bearish': 2, 'Neutral': 3, 'Bullish': 4, 'Very Bullish': 5}

    with sql.connect("../data/processed/temp_c.db") as con:
        available_companies = pd.read_sql("SELECT DISTINCT symbol from daily WHERE symbol NOT IN ('VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX', 'PT')", con=con).symbol.values
        c_data = pd.read_sql(f"SELECT * from mentions LIMIT 100", con=con, index_col='pk')
        articles_sent = pd.read_sql(f"SELECT month, symbol, COUNT(comments) article_count, AVG(comments) engagement, AVG(pos_sent) pos_sent_avg, AVG(neg_sent) neg_sent_avg, AVG(neu_sent) neu_sent_avg, AVG(comp_sent) comp_sent_avg FROM news_sentiment JOIN (SELECT pk, STRFTIME('%Y-%m', date) month, symbol, comments  FROM articles) USING (pk) WHERE month LIKE '2020%' OR month LIKE '2021%' GROUP BY month, symbol", con=con)
        comments_sent = pd.read_sql(f'SELECT date month, symbols symbol, pos_sent, neg_sent, neu_sent, comp_sent FROM symbol_comments', con=con, parse_dates={'month': '%Y-%m-%d  %H:%M:%S'})
        comments_sent = comments_sent.assign(symbol=lambda x: x.symbol.apply(str.split, sep=','))\
            .assign(month = lambda x: x.month.apply(dt.datetime.strftime, format='%b %Y')).explode('symbol')
        recommendations_sent = pd.read_sql(f"SELECT Date month, symbol, Firm, Action, new_grade, prev_grade FROM recommendations", con=con, parse_dates={'month': '%Y-%m-%d %H:%M:%S'})
        port = pd.read_sql("SELECT DATE(Date) date, Open, Close, Volatility, symbol FROM daily WHERE symbol NOT IN ('IT', 'PT', 'ON', 'ING', 'VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX')", con=con, parse_dates={'date': '%Y-%m-%d'})
        articles_pt = pd.read_sql(f"SELECT date, symbol, comments engagement, comp_sent FROM news_sentiment JOIN (SELECT pk, DATE(date) date, symbol, comments  FROM articles) USING (pk) WHERE date LIKE '2020%'", con=con, parse_dates={'date': '%Y-%m-%d'})

    corr_df = port.groupby(['symbol', pd.Grouper(key='date', freq='1M')]).agg({'Close': ['first', 'last']}).droplevel(0, axis=1)\
        .assign(mo_rt = lambda x: (x['last'] - x['first'])/x['first']).mo_rt.reset_index().assign(month=lambda x: x.date.apply(dt.datetime.strftime, format='%b %Y')).drop('date', axis=1)
    
    yearly_corr= port.groupby(['symbol', pd.Grouper(key='date', freq='1Y')]).agg({'Close': ['first', 'last']}).droplevel(0, axis=1)\
        .assign(year_rt = lambda x: (x['last'] - x['first'])/x['first']).year_rt.reset_index().assign(year=lambda x: x.date.apply(dt.datetime.strftime, format='%Y')).drop('date', axis=1)
    


    
    comments_sent = comments_sent.groupby(['month', 'symbol']).agg({'pos_sent': 'mean', 'neg_sent': 'mean', 'neu_sent': 'mean', 'comp_sent': ['mean', 'count']}).reset_index().droplevel(0, axis=1)
    
    comments_sent.columns = ['month', 'symbol', 'pos_sent_avg', 'neg_sent_avg', 'neu_sent_avg', 'comp_sent_avg','engagement']
    comments_sent = comments_sent.assign(article_count = lambda x: 1)

    articles_sent = articles_sent.assign(month = lambda x: x.month.apply(lambda m: month_parse[m.split(sep='-')[1]] + " " + m.split(sep='-')[0]))[lambda x: ~(x.symbol.isin({'PT', 'IT', "ON", "ING"}))]
    

    corr_df2 = comments_sent.loc[:, [ 'month', 'symbol', 'comp_sent_avg', 'pos_sent_avg','engagement', 'article_count']].merge(articles_sent.loc[:, ['comp_sent_avg', 'pos_sent_avg', 'engagement', 'month', 'symbol', 'article_count']], 'inner', on=['month', 'symbol'], suffixes=('_chat', '_news'))\
        .merge(corr_df, 'inner', on=['month', 'symbol'])
    recommendations_sent = recommendations_sent.assign(new_grade = lambda x: x.new_grade.apply(lambda g: ratings_parse[g])).assign(prev_grade = lambda x: x.prev_grade.apply(lambda g: ratings_parse[g])).groupby(['symbol', pd.Grouper(key='month', freq='1M'), 'Firm']).mean()
    recommendations_sent = recommendations_sent.reset_index()#.assign(year=lambda x: x.month.apply(dt.datetime.strftime, format='%Y')).assign(month=lambda x: x.month.apply(dt.datetime.strftime, format='%b %Y'))
    #corr_df2= corr_df2.merge(recommendations_sent, 'inner', on=['month', 'symbol'])
    corr_df = corr_df.assign(date = lambda x: x.month.apply(dt.datetime.strptime, args=['%b %Y'])).assign(year = lambda x: x.date.apply(lambda l: l.year).apply(str))
    recommendations_sent = recommendations_sent.sort_values('month')
    corr_df = corr_df.merge(yearly_corr, 'inner', ['year', 'symbol']).sort_values(['date', 'symbol'])
    # print(corr_df)
    # test = pd.merge_ordered(corr_df2, recommendations_sent, on='date', fill_method='ffill', right_by='symbol')
    test = pd.merge_asof(corr_df, recommendations_sent, direction='backward', tolerance=pd.Timedelta(365, 'days'), left_on='date', right_on='month',left_by='symbol', right_by='symbol')
    #print(test.dropna().assign(a = lambda x: x.year_rt * x.new_grade).sort_values('a', ascending=False)).assign(a = lambda x: x.year_rt * x.new_grade).sort_values('a', ascending=False).assign(g = lambda x: x.new_grade-x.prev_grade)\
    inital_ratings = test.dropna().drop_duplicates(subset=['month_y', 'Firm', 'new_grade'])[lambda x: (x.date < dt.datetime(2020, 4, 30))].groupby('symbol').agg({'new_grade': ['mean', 'count']})#.groupby('Firm').agg({'a': ['mean', 'count']})[lambda b: b.iloc[:, 1] > 10].sort_values([('a', 'count')]))
    
    # print(test.dropna()[lambda x: (x.date < dt.datetime(2020, 12, 31))])
    # print(corr_df2.sort_values('comp_sent_avg_chat'))

    # print(recommendations_sent.groupby('symbol').count().shape)
    # print([x for x in available_companies if x not in recommendations_sent.groupby('symbol').count().index])
    #print(articles_sent)
    #print(articles_sent.merge(corr_df, 'inner', ['month', 'symbol']).loc[:, ['month', 'symbol', 'article_count','engagement', 'comp_sent_avg', 'mo_rt', 'year_rt']]\
    #    [lambda x: x.month == 'May 2020'].sort_values('article_count', ascending=False).head(20).corr())
    # print(test.dropna().loc[:, ['symbol', 'mo_rt', 'Firm', 'new_grade', 'prev_grade']])
    
    
    #new_recs = recommendations_sent.merge(corr_df2, 'inner', ['symbol', 'month']).loc[:, ['symbol', 'month', 'Firm', 'new_grade', 'prev_grade','mo_rt', 'year']].merge(yearly_corr, 'inner', on=['symbol', 'year']).loc[:, ['symbol', 'month', 'year','Firm', 'new_grade', 'prev_grade','mo_rt', 'year_rt']]
    #print(recommendations_sent)
    
    #print(new_recs.shape)


    with sql.connect("../data/processed/discord.db") as con:
        pop_emote = pd.read_sql("SELECT * FROM chatEmotes WHERE unicode_name NOT LIKE '%skin_tone:' ORDER BY count DESC LIMIT 26", con=con)
        pop_emote = pop_emote.assign(code = lambda x: x.emote.apply(lambda x: "U+{:X}".format(ord(x)))).to_json(orient='records')
        comments_ = pd.read_sql("SELECT comp_sent, neg_sent, neu_sent, pos_sent,  STRFTIME('%Y-%m-%d', timestamp) date FROM comments", con=con, parse_dates={'date': '%Y-%m-%d'})


    comments_pt = comments_.assign(TYPE=lambda x: x.comp_sent.apply(sent_help)).groupby([pd.Grouper(key='date', freq='1M'), 'TYPE']).count().reset_index()\
        .assign(month=lambda x: x.date.apply(dt.datetime.strftime, format='%b %Y'))\
            .loc[:, ['comp_sent', 'month', 'TYPE']].pivot(index='month', values='comp_sent', columns='TYPE').T.loc[:, ['May 2020', 'Jun 2020', 'Jul 2020', 'Aug 2020', 'Sep 2020', 'Oct 2020', 'Nov 2020', 'Dec 2020']]
            
    articles_pt = articles_pt.assign(TYPE=lambda x: x.comp_sent.apply(sent_help)).groupby([pd.Grouper(key='date', freq='1M'), 'TYPE']).count().reset_index()\
        .assign(month=lambda x: x.date.apply(dt.datetime.strftime, format='%b %Y')).sort_values('date')\
            .loc[:, ['comp_sent', 'month', 'TYPE']].pivot(index='month', values='comp_sent', columns='TYPE').fillna(0).T.loc[:, ['May 2020', 'Jun 2020', 'Jul 2020', 'Aug 2020', 'Sep 2020', 'Oct 2020', 'Nov 2020', 'Dec 2020']]
            
    print(comments_pt)
    print(articles_pt)


    obj_dict = {"cos": list(available_companies), "c_data":c_data.to_json(orient='records'), 'pop_emote': pop_emote, 'arts': articles_sent.to_json(orient='records', double_precision=4),\
        'port': port.to_json(orient='records', double_precision=4), 'articlesSent': articles_sent.to_json(orient='records', double_precision=4),\
             'commentsSent': comments_sent.to_json(orient='records', double_precision=4), 'articles_pt': articles_pt.to_json(orient='split', double_precision=1), 'comments_pt': comments_pt.to_json(orient='split', double_precision=1)}
    
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


