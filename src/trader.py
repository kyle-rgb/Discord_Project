import warnings
warnings.filterwarnings('ignore')

import pandas as pd, numpy as np, sqlite3 as sql
import datetime as dt, re, time, holidays, zipfile, py7zr
from dateutil.relativedelta import relativedelta

def next_business_day(date):
    ONE_DAY = dt.relativedelta(days=1)
    HOLIDAYS_US = holidays.US()
    next_day = date + ONE_DAY
    while next_day.weekday() in holidays.WEEKEND or next_day in HOLIDAYS_US:
        next_day += ONE_DAY
    return next_day

print(time.perf_counter())
con = sql.connect('../data/processed/temp_c.db', timeout=5000)
port = pd.read_sql(f"SELECT Date date, Open, High, Low, Close, Volume, Volatility, Turnover, symbol FROM daily ORDER BY date", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})\
        .drop_duplicates(subset=['date', 'symbol'])
articles =pd.read_sql("SELECT date, symbol, publisher, pos_sent, neu_sent, neg_sent, comp_sent FROM (SELECT * FROM news_sentiment JOIN (SELECT * FROM articles) USING (pk))", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})
recommends = pd.read_sql(f"SELECT Date date, symbol, Firm, new_grade, prev_grade, Action from recommendations ORDER BY Date", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})



comments = pd.read_sql(f"SELECT date, channel, symbols, pos_sent, neu_sent, neg_sent, comp_sent from symbol_comments ORDER BY date", parse_dates={'date': '%Y-%m-%d'}, con=con)
comments.loc[:, "symbols"] = comments.symbols.apply(lambda x: x.replace('BTC', 'BTC-USD'))
companies = tuple(port.symbol.unique())
c_data = pd.read_sql(f"SELECT * from mentions WHERE symbol IN {companies}", con=con, index_col='pk')
con.close()

symbols_re = re.compile(r"\[|\]|\'|\'")
last_index = comments.index.max()
# decompose for single symbol
comments = comments.assign(symbols = lambda x: x.symbols.apply(lambda x: re.sub(symbols_re, '', x)).apply(str.split, sep=','))\
    .explode('symbols').reset_index().rename(columns={'index': 'comment_index'})
comments = comments[lambda x:(~( x.comment_index.isnull()) & (x.symbols.isin(companies)))]


recommendsDict = {"Very Bearish": 1, "Bearish": 2, "Neutral": 3, "Bullish": 4, "Very Bullish": 5}
recommends=recommends.assign(new_sent = lambda x: x.new_grade.apply(lambda g: recommendsDict[g]))\
    .assign(prev_sent = lambda x: x.prev_grade.apply(lambda g: recommendsDict[g]))

# take aggregations over wanted frequency; make buy decisions based off of the frequency of data points and sentiments
# return port with new information: shares and cost * shares

class EAT():
    def __init__(self, portfolio, articles, comments, recs, start, end, start_amount):
        self.portfolio = portfolio.copy(deep=True)
        self.postions = []
        self.start = start
        self.end = end
        self.articles = articles[lambda x: (x.date >= start) & (x.date <= end)]
        self.comments =  comments[lambda x: (x.date >= start) & (x.date <= end)]
        self.recs = recs[lambda x: (x.date >= start) & (x.date <= end)]
        self.aggs = {}
        self.trading_days = set(self.portfolio[lambda x: x.symbol == "DIS"].date.values)
        self.starting_amt = start_amount
        self.dates = []
        self.share_column = pd.DataFrame()

    def aggregate(self):
        articles_agg = self.articles.groupby([pd.Grouper(key="date", freq="1Y"), 'symbol'])\
            .agg({'pos_sent': ['mean'], 'neg_sent': ['mean'], 'neu_sent': ['mean'], 'comp_sent': ['mean', 'count']}).assign(type=lambda x: 'News')
        comments_agg = self.comments.groupby([pd.Grouper(key="date", freq="1Y"), 'symbols'])\
            .agg({'pos_sent': ['mean'], 'neg_sent': ['mean'], 'neu_sent': ['mean'], 'comp_sent': ['mean', 'count']}).assign(type=lambda x: 'Chats')
        recommends_agg = self.recs.groupby([pd.Grouper(key="date", freq="1Y"), 'symbol'])\
            .agg({'new_sent': ['mean'], 'prev_sent': ['mean', 'count']}).assign(type=lambda x: 'Analysts')
        recommends_agg = recommends_agg.reset_index()
        comments_agg = comments_agg.reset_index()
        articles_agg = articles_agg.reset_index()
        recommends_agg.columns = recommends_agg.columns.droplevel(1)
        comments_agg.columns = comments_agg.columns.droplevel(1)
        articles_agg.columns = articles_agg.columns.droplevel(1)
        
        articles_agg.columns = ['date', 'symbol', 'pos_sent', 'neg_sent', 'neu_sent', 'comp_sent',
       'counts', 'type']
        comments_agg.columns = ['date', 'symbol', 'pos_sent', 'neg_sent', 'neu_sent', 'comp_sent',
       'counts', 'type']
        recommends_agg.columns = ['date', 'symbol', 'new_sent', 'prev_sent', 'counts', 'type']
        # comments_agg=comments_agg.assign(date = lambda x: x.date.apply(lambda x: x.date))
        self.aggs['recommendations'] = recommends_agg
        self.aggs['articles'] = articles_agg
        self.aggs['comments'] = comments_agg
        return None 


    def tradeSents(self, agg, label, min_samples, min_sent):
        # add action, shares, cost
        returns = self.aggs[agg][lambda x: ((x.date >= self.start) & (x[label] >= min_sent) & (x.counts >= min_samples))]
        # query portfolio for first cost add columns
        indexes = pd.Int64Index([])
        wanted_assets = returns.groupby('date').count().reset_index()
        self.dates = list(wanted_assets.date.values)
        port_amt = self.starting_amt 
        for date, sym in returns.loc[:, ['date', 'symbol']].values:
            if ~(wanted_assets.loc[wanted_assets.date==date, :].index==0)[0]:
                port_amt = returns.groupby('date').sum().returns[self.dates.index(date)-1]
    
            available_funds = port_amt / wanted_assets.loc[wanted_assets.date==date, 'symbol'].values[0]

            if sym not in self.postions:
                self.postions.append(sym)
                f1_date = (date + relativedelta(years=1)).to_pydatetime()
                indexes = self.portfolio[lambda x: ((x.date > date) & (x.symbol == sym) & (x.date <= f1_date) & (x.date.isin(self.trading_days)))].index
                
            else:
                self.postions.append(sym)
                f1_date = (date + relativedelta(years=1)).to_pydatetime()
                indexes = self.portfolio[lambda x: ((x.date > date) & (x.symbol == sym) & (x.date <= f1_date)  & (x.date.isin(self.trading_days)))].index
            
            i = returns[lambda x: (x.date == date) & (x.symbol == sym)].index
            if not indexes.empty:
                shares_ = available_funds  / self.portfolio.loc[indexes[0], "Close"]
                returns.loc[i, 'cost'] = shares_ * self.portfolio.loc[indexes[0], "Close"]
                returns.loc[i, 'returns'] = shares_ * self.portfolio.loc[indexes[-1], "Close"]
                self.portfolio.loc[indexes, "shares"] = shares_


        if self.share_column.empty:
            self.share_column = self.portfolio.loc[:, 'shares'].fillna(value=0)
        else:
            self.share_column = self.portfolio.shares.fillna(0) + self.share_column
        #print(returns.assign(pct=lambda x: (x.returns-x.cost) / x.cost).sort_values('pct', ascending=False))
        print(returns.groupby('date').sum().assign(pct=lambda x: (x.returns-x.cost) / x.cost).sort_index())
        return self.portfolio.fillna(value=0)

def apiHelper(date_tuple=(dt.datetime(2019, 1, 1), dt.datetime(2021, 1, 1)), starting_balance=10_000, wanted_sentiments=[{'name': 'comments', 'sent_name': 'comp_sent', 'min_samples': 1, 'min_sent': .15}]):
    eat = EAT(port, articles, comments, recommends, date_tuple[0], date_tuple[1], starting_balance/len(wanted_sentiments))
    eat.aggregate()
    for obj in wanted_sentiments:
        eat.tradeSents(obj.get('name'), obj.get('sent_name'), obj.get('min_samples'), obj.get('min_sent'))
    
    eat.portfolio.loc[:, ['shares']] = eat.share_column

    
    eat.portfolio
    return eat.portfolio

new_port = apiHelper()

print(time.perf_counter())