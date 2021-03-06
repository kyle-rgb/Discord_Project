# Import Dependencies 
# Custom Methods
from trader import apiHelper, new_port
# Framework/Server 
from flask import Flask, request, render_template
# 3rd Party Data Handling
import sqlite3 as sql, pandas as pd,  numpy as np
# Utils
import datetime as dt, time, sys, os

def sent_help(s):
    if s >= .1200:
        return 'positive'
    elif s >= 0:
        return 'neutral'
    else:
        return 'negative' 

# Create an instance of Flask app
app = Flask(__name__)
 
@app.route('/AppAPI')
def gather_chart_data():
    cl_time = time.perf_counter()
    methods = request.args.get("method").split(',')
    min_samples = list(map(int, request.args.get('min_samples').split(',')))
    sentiment_threshold = list(map(float, request.args.get('threshold').split(',')))
    args = []
    method_indexer = {'recommendations': {'sent_name': 'new_sent', 'range_i': 2, 'range_j': 3,'div': 1}, 'comments': {'sent_name': 'comp_sent', 'range_i': 0, 'range_j': 1, 'div': 100}, 'articles': {'sent_name': 'comp_sent', 'range_i': 1, 'range_j': 5,'div': 100}}
    for i, m in enumerate(methods):
        args.append({'name': m, 'sent_name': method_indexer[m].get('sent_name'), 'min_samples': min_samples[method_indexer[m].get('range_i')], 'min_sent': sentiment_threshold[method_indexer[m].get('range_j')]/method_indexer[m].get('div')})
    # support sentiment sentiment ranges, sentiment-thresholds, named calls]
    api_return = apiHelper(wanted_sentiments=args)
    api_return = api_return[lambda x: x.shares > 0].to_json(orient='records', double_precision=4)
    return api_return

@app.route('/')
def cloud():
    month_parse = {'01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'}
    ratings_parse = {'Very Bearish': 1, 'Bearish': 2, 'Neutral': 3, 'Bullish': 4, 'Very Bullish': 5}

    with sql.connect("data/processed/temp_c.db") as con:
        available_companies = pd.read_sql("SELECT symbol, DATE(MIN(date)) starting_date from daily WHERE symbol NOT IN ('VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX', 'PT', 'IT', 'PT', 'ING', 'ON') GROUP BY symbol", con=con, parse_dates={'starting_date': '%Y-%m-%d'})
        available_companies_dates = available_companies
        available_companies = available_companies.symbol.values
        c_data = pd.read_sql(f"SELECT * from mentions LIMIT 100", con=con, index_col='pk')
        articles_sent = pd.read_sql(f"SELECT month, symbol, COUNT(comments) article_count, AVG(comments) engagement, AVG(pos_sent) pos_sent_avg, AVG(neg_sent) neg_sent_avg, AVG(neu_sent) neu_sent_avg, AVG(comp_sent) comp_sent_avg FROM news_sentiment JOIN (SELECT pk, STRFTIME('%Y-%m', date) month, symbol, comments  FROM articles) USING (pk) WHERE month LIKE '2020%' OR month LIKE '2021%' GROUP BY month, symbol", con=con)
        narticles = pd.read_sql(f"SELECT symbol, COUNT(comments) article_count, AVG(comments) engagement, AVG(pos_sent) pos_sent_avg, AVG(neg_sent) neg_sent_avg, AVG(neu_sent) neu_sent_avg, AVG(comp_sent) comp_sent_avg FROM news_sentiment JOIN (SELECT pk, DATE(date) month, symbol, comments  FROM articles) USING (pk) WHERE month > DATE('2020-04-31') GROUP BY symbol", con=con)
        comments_sent = pd.read_sql(f'SELECT date month, symbols symbol, pos_sent, neg_sent, neu_sent, comp_sent FROM symbol_comments', con=con, parse_dates={'month': '%Y-%m-%d  %H:%M:%S'})
        comments_sent = comments_sent.assign(symbol=lambda x: x.symbol.apply(str.split, sep=','))\
            .assign(month = lambda x: x.month.apply(dt.datetime.strftime, format='%b %Y')).explode('symbol')
        recommendations_sent = pd.read_sql(f"SELECT Date month, symbol, Firm, Action, new_grade, prev_grade FROM recommendations", con=con, parse_dates={'month': '%Y-%m-%d %H:%M:%S'})
        port = pd.read_sql("SELECT DATE(Date) date, Open, Close, Volatility, symbol FROM daily WHERE symbol NOT IN ('IT', 'PT', 'ON', 'ING', 'VPU', 'VNQ', 'VAW', 'VGT', 'VIS', 'VHT', 'VFH', 'VDE', 'VDC', 'VCR', 'VOX')", con=con, parse_dates={'date': '%Y-%m-%d'})
        articles_pt = pd.read_sql(f"SELECT date, symbol, comments engagement, comp_sent FROM news_sentiment JOIN (SELECT pk, DATE(date) date, symbol, comments  FROM articles) USING (pk) WHERE date LIKE '2020%'", con=con, parse_dates={'date': '%Y-%m-%d'})
        recsEval = pd.read_sql(f'SELECT * FROM recsEvaluation', con=con)
        company_pics = pd.read_sql('SELECT shortname name, longName, symbol, logo_url, sector, industry from info WHERE longName NOT LIKE \'Vanguard%\'', con=con)


    corr_df = port.groupby(['symbol', pd.Grouper(key='date', freq='1M')]).agg({'Close': ['first', 'last']}).droplevel(0, axis=1)\
        .assign(mo_rt = lambda x: (x['last'] - x['first'])/x['first']).mo_rt.reset_index().assign(month=lambda x: x.date.apply(dt.datetime.strftime, format='%b %Y')).drop('date', axis=1)
    

    yearly_corr= port.groupby(['symbol', pd.Grouper(key='date', freq='1Y')]).agg({'Close': ['first', 'last']}).droplevel(0, axis=1)\
        .assign(year_rt = lambda x: (x['last'] - x['first'])/x['first']).year_rt.reset_index().assign(year=lambda x: x.date.apply(dt.datetime.strftime, format='%Y')).drop('date', axis=1)
    
    info_corr= port.groupby(['symbol']).agg({'Close': ['first', 'last']}).droplevel(0, axis=1)\
        .assign(value = lambda x: (x['last'] - x['first'])/x['first']).value.reset_index()
    
    company_pics = company_pics.merge(info_corr, 'inner', on='symbol')

    ncomments = comments_sent.groupby(['symbol']).agg({'pos_sent': 'mean', 'neg_sent': 'mean', 'neu_sent': 'mean', 'comp_sent': ['mean', 'count']}).reset_index().droplevel(0, axis=1)
    ncomments.columns = ['symbol', 'pos_sent_avg', 'neg_sent_avg', 'neu_sent_avg', 'comp_sent_avg','engagement']
    comments_sent = comments_sent.groupby(['month', 'symbol']).agg({'pos_sent': 'mean', 'neg_sent': 'mean', 'neu_sent': 'mean', 'comp_sent': ['mean', 'count']}).reset_index().droplevel(0, axis=1)
    
    comments_sent.columns = ['month', 'symbol', 'pos_sent_avg', 'neg_sent_avg', 'neu_sent_avg', 'comp_sent_avg','engagement']
    comments_sent = comments_sent.assign(article_count = lambda x: 1)

    
    articles_sent = articles_sent.assign(month = lambda x: x.month.apply(lambda m: month_parse[m.split(sep='-')[1]] + " " + m.split(sep='-')[0]))[lambda x: ~(x.symbol.isin({'PT', 'IT', "ON", "ING"}))]
    narticles = narticles[lambda x: ~(x.symbol.isin({'PT', 'IT', "ON", "ING"}))]
    ntotals = narticles.merge(ncomments, on='symbol', how='inner', suffixes=('_news', '_chat'))
    nreturns = port[lambda x: (x.date > dt.datetime(2020, 4, 30)) & (x.date < dt.datetime(2021, 1, 1))].groupby('symbol').agg({'Close': ['first', 'last']}).droplevel(0, axis=1)\
        .assign(returns = lambda x: (x['last'] - x['first'])/x['first']).reset_index().loc[:, ['symbol', 'returns']]
   
    ntotals = ntotals.merge(nreturns, 'inner', 'symbol')



    recommendations_sent = recommendations_sent.assign(new_grade = lambda x: x.new_grade.apply(lambda g: ratings_parse[g])).assign(prev_grade = lambda x: x.prev_grade.apply(lambda g: ratings_parse[g]))
    recommendations_sent = recommendations_sent.groupby(['symbol', pd.Grouper(key='month', freq='1M'), 'Firm']).mean()
    recommendations_sent = recommendations_sent.reset_index()#.assign(year=lambda x: x.month.apply(dt.datetime.strftime, format='%Y')).assign(month=lambda x: x.month.apply(dt.datetime.strftime, format='%b %Y'))
    #corr_df2= corr_df2.merge(recommendations_sent, 'inner', on=['month', 'symbol'])
    corr_df = corr_df.assign(date = lambda x: x.month.apply(dt.datetime.strptime, args=['%b %Y'])).assign(year = lambda x: x.date.apply(lambda l: l.year).apply(str))
    recommendations_sent = recommendations_sent.sort_values('month')
    corr_df = corr_df.merge(yearly_corr, 'inner', ['year', 'symbol']).sort_values(['date', 'symbol'])
    corr_df2 = comments_sent.loc[:, [ 'month', 'symbol', 'comp_sent_avg', 'pos_sent_avg','engagement', 'article_count']].merge(articles_sent.loc[:, ['comp_sent_avg', 'pos_sent_avg', 'engagement', 'month', 'symbol', 'article_count']], 'inner', on=['month', 'symbol'], suffixes=('_chat', '_news'))\
        .merge(corr_df, 'inner', on=['month', 'symbol']).sort_values('date').reset_index(drop=True)[lambda x: x.date > dt.datetime(2020, 4, 30)]
    # test = pd.merge_ordered(corr_df2, recommendations_sent, on='date', fill_method='ffill', right_by='symbol')
    

    test = pd.merge_asof(corr_df, recommendations_sent, direction='backward', tolerance=pd.Timedelta(365, 'days'), left_on='date', right_on='month',left_by='symbol', right_by='symbol')
    initial_ratings = test.dropna().drop_duplicates(subset=['month_y', 'Firm', 'new_grade'])[lambda x: (x.date <= dt.datetime(2020, 4, 30))]\
        .groupby('symbol').agg({'new_grade': ['mean', 'count']})
    
    ending_ratings = test.dropna().drop_duplicates(subset=['month_y', 'Firm', 'new_grade'])[lambda x: (x.date < dt.datetime(2021, 1, 1))]\
        .groupby('symbol').agg({'new_grade': ['mean', 'count']})
    

    inital_bars =initial_ratings.droplevel(0, axis=1).sort_values(['mean'], ascending=False)[lambda x: x['count'] >= 10].rename(columns={'': 'symbol'})
    ending_bars = ending_ratings.droplevel(0, axis=1).sort_values(['mean'], ascending=False)[lambda x: x['count'] >= 10].rename(columns={'': 'symbol'})
    initial_ratings = initial_ratings.assign(r=lambda x: x[('new_grade', 'mean')].apply(lambda z: 'Very Bullish' if z >= 4.0 else ('Bullish' if z>= 3.50 else ('Bullish Neutral' if z>= 3.0 else 'Bearish' if z>= 2.0 else 'Very Bearish')))).reset_index().loc[:, ['symbol', 'r']].droplevel(1, axis=1)
    ending_ratings = ending_ratings.assign(r=lambda x: x[('new_grade', 'mean')].apply(lambda z: 'Very Bullish' if z >= 4.0 else ('Bullish' if z>= 3.50 else ('Bullish Neutral' if z>= 3.0 else 'Bearish' if z>= 2.0 else 'Very Bearish')))).reset_index().loc[:, ['symbol', 'r']].droplevel(1, axis=1)
    
    i_set= set(initial_ratings.symbol.values).union({'SPY', 'SQQQ', 'QQQ', 'VXX', 'BTC-USD'})
    e_set = set(ending_ratings.symbol.values).union({'SPY', 'QQQ', 'SQQQ', 'VXX', 'BTC-USD'})
    missing_ratings = available_companies_dates[lambda x: (~(x.symbol.isin(i_set)))].assign(r=lambda df: df.starting_date.apply(lambda s: 'Not Rated' if s < dt.datetime(2020, 4, 30) else 'pre-IPO'))
    missing_ratings_end = available_companies_dates[lambda x: (~(x.symbol.isin(e_set)))].assign(r=lambda df: df.starting_date.apply(lambda s: 'Not Rated'))
    pie_ratings  = pd.concat([initial_ratings, missing_ratings.loc[:, ['symbol', 'r']]], axis=0, ignore_index=True).groupby('r').count().T
    pie_ratings_dose  = pd.concat([ending_ratings, missing_ratings_end.loc[:, ['symbol', 'r']]], axis=0, ignore_index=True).groupby('r').count().T

    print('*'*29)
    c_data=c_data.merge(company_pics.loc[:, ['symbol', 'sector', 'industry', 'name']], 'inner', 'symbol')
    print(c_data[lambda x: x.sector == 'Healthcare'])
    print('*'*29)
  

    with sql.connect("data/processed/discord.db") as con:
        pop_emote = pd.read_sql("SELECT * FROM chatEmotes WHERE unicode_name NOT LIKE '%skin_tone:' ORDER BY count DESC LIMIT 26", con=con)
        pop_emote = pop_emote.assign(code = lambda x: x.emote.apply(lambda x: "U+{:X}".format(ord(x)))).to_json(orient='records')
        comments_ = pd.read_sql("SELECT comp_sent, neg_sent, neu_sent, pos_sent,  STRFTIME('%Y-%m-%d', timestamp) date FROM comments", con=con, parse_dates={'date': '%Y-%m-%d'})
        cmts_ = pd.read_sql("SELECT content, STRFTIME('%Y-%m-%d', timestamp) date FROM comments", con=con, parse_dates={'date': '%Y-%m-%d'})
        noun_tokens_positive = pd.read_sql("SELECT word, positive_count count, ((positive_count)/(negative_count)) ratio, 'P' sent, type FROM tokens WHERE type = 'noun' ORDER BY positive_count DESC LIMIT 50", con=con)
        verb_tokens_positive = pd.read_sql("SELECT word, positive_count count, ((positive_count)/(negative_count)) ratio, 'P' sent, type FROM tokens WHERE type = 'verb' ORDER BY positive_count DESC LIMIT 50", con=con)
        noun_tokens_negative = pd.read_sql("SELECT word, negative_count count, ((negative_count)/(positive_count)) ratio, 'N' sent, type FROM tokens WHERE type = 'noun' ORDER BY negative_count DESC LIMIT 50", con=con)
        verb_tokens_negative = pd.read_sql("SELECT word, negative_count count, ((negative_count)/(positive_count)) ratio, 'N' sent, type FROM tokens WHERE type = 'verb' ORDER BY negative_count DESC LIMIT 50", con=con)


    _n = pd.concat([noun_tokens_positive, noun_tokens_negative, verb_tokens_positive, verb_tokens_negative], axis=0, ignore_index=False)
    comments_pt = comments_.assign(TYPE=lambda x: x.comp_sent.apply(sent_help)).groupby([pd.Grouper(key='date', freq='1M'), 'TYPE']).count().reset_index()\
        .assign(month=lambda x: x.date.apply(dt.datetime.strftime, format='%b %Y'))\
            .loc[:, ['comp_sent', 'month', 'TYPE']].pivot(index='month', values='comp_sent', columns='TYPE').T.loc[:, ['May 2020', 'Jun 2020', 'Jul 2020', 'Aug 2020', 'Sep 2020', 'Oct 2020', 'Nov 2020', 'Dec 2020']]
            
    articles_pt = articles_pt.assign(TYPE=lambda x: x.comp_sent.apply(sent_help)).groupby([pd.Grouper(key='date', freq='1M'), 'TYPE']).count().reset_index()\
        .assign(month=lambda x: x.date.apply(dt.datetime.strftime, format='%b %Y')).sort_values('date')\
            .loc[:, ['comp_sent', 'month', 'TYPE']].pivot(index='month', values='comp_sent', columns='TYPE').fillna(0).T.loc[:, ['May 2020', 'Jun 2020', 'Jul 2020', 'Aug 2020', 'Sep 2020', 'Oct 2020', 'Nov 2020', 'Dec 2020']]
    

    obj_dict = {"cos": list(available_companies), "c_data":c_data.to_json(orient='records'), 'pop_emote': pop_emote, 'arts': articles_sent.to_json(orient='records', double_precision=4),\
        'port': port.to_json(orient='records', double_precision=4), 'articlesSent': articles_sent.to_json(orient='records', double_precision=4),\
             'commentsSent': comments_sent.to_json(orient='records', double_precision=4), 'articles_pt': articles_pt.to_json(orient='split', double_precision=1),\
                  'comments_pt': comments_pt.to_json(orient='split', double_precision=1), 'pieRatings': pie_ratings.to_json(orient='split'),\
                      'bubbleData': corr_df2.to_json(orient='records'), 'pieRatings2': pie_ratings_dose.to_json(orient='split'), 'nTotals': ntotals.to_json(orient='records'), 'initialBars': inital_bars.to_json(orient='split', double_precision=3), 'endingBars': ending_bars.to_json(orient='split', double_precision=3),\
                          'token_Json': _n.to_json(orient='records'), 'company_info': company_pics.to_json(orient='records')}
    

    return render_template('wordcloud.html', obj_dict=obj_dict)

@app.route('/gather-stock-data') 
def candle():
        wanted_stock = request.args.get("ticker")     
        with sql.connect("data/processed/temp_c.db") as con:
            info = pd.read_sql(f"SELECT * FROM info JOIN (SELECT shortName compName, sector, symbol compSymbol FROM info WHERE compName LIKE '%Vanguard%' OR compName LIKE '%SPDR%') USING (sector) WHERE symbol='{wanted_stock}'", con=con, index_col='pk')
            daily_comps = pd.read_sql(f"SELECT * FROM daily WHERE symbol IN ('{info.compSymbol.values[0]}', 'SPY')", con=con).drop_duplicates(subset=['symbol', 'Date']).to_json(orient="records", double_precision=6)
            daily_data = pd.read_sql(f"SELECT * FROM daily WHERE symbol = '{wanted_stock}'", con=con).to_json(orient="records", double_precision=6)
            recomends = pd.read_sql(f"SELECT * from recommendations WHERE symbol = '{wanted_stock}'", con=con, parse_dates={'Date': '%Y-%m-%d %H:%M:%S'})
            recomends = recomends.assign(Date = lambda x: x.Date.apply(dt.datetime.strftime, format='%Y-%m-%d')).to_json(orient='records')
            comments = pd.read_sql(f"SELECT * from symbol_comments", con=con)
            comp_sentiment = comments.comp_sent.mean()
            arts =pd.read_sql(f"SELECT date, symbol, pos_sent, neu_sent, neg_sent, comp_sent, symbol FROM (SELECT * FROM news_sentiment JOIN (SELECT * FROM articles) USING (pk)) WHERE symbol ='{wanted_stock}'", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})
        
        arts = arts.iloc[:, :-1]
        arts = arts.assign(date = lambda x: x.date.apply(dt.datetime.strftime, format='%Y-%m-%d'))\
            .to_json(orient='records', double_precision=4)
        
        info = info.to_json(orient="records")
        comments=comments[lambda x: x.symbols.str.contains(wanted_stock)].loc[:, ['date', 'symbols', 'pos_sent', 'neg_sent', 'neu_sent', 'comp_sent']].to_json(orient='records', double_precision=4)
        obj_dict = {"daily_data": daily_data, 'rec': recomends, 'articles': arts, "comp_sent_avg": comp_sentiment, "comments": comments,
        "daily_comps": daily_comps, 'info': info}
        
        return render_template("symbol.html", obj_dict=obj_dict)


@app.route('/trading_application/')
def tempateVue():
    with sql.connect('data/processed/temp_c.db') as con:
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
    # app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug = False)


