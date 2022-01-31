import pandas as pd, numpy as np, sqlite3 as sql
import datetime as dt, re, time, holidays
from dateutil.relativedelta import relativedelta

def next_business_day(date):
    ONE_DAY = dt.relativedelta(days=1)
    HOLIDAYS_US = holidays.US()
    next_day = date + ONE_DAY
    while next_day.weekday() in holidays.WEEKEND or next_day in HOLIDAYS_US:
        next_day += ONE_DAY
    return next_day


print(time.perf_counter())
with sql.connect('../data/interim/companies.db') as con:
        port = pd.read_sql(f"SELECT Date date, Open, High, Low, Close, Volume, Volatility, Turnover, symbol FROM daily ORDER BY date", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})\
                .drop_duplicates(subset=['date', 'symbol'])
        recommends = pd.read_sql(f"SELECT Date date, symbol, Firm, new_grade, prev_grade, Action from recommendations ORDER BY Date", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})
        arts =pd.read_sql("SELECT date, symbol, publisher, pos_sent, neu_sent, neg_sent, comp_sent FROM articles ORDER BY date", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})
        crypt_arts = pd.read_sql("SELECT date, symbol, publisher,pos_sent, neu_sent, neg_sent, comp_sent  FROM news_sentiment ORDER BY date", con=con, parse_dates={'date': '%Y-%m-%d %H:%M:%S'})
        articles = pd.concat([arts, crypt_arts], axis=0, ignore_index=True)
        comments = pd.read_sql(f"SELECT DATE(timestamp) date, channel, symbols, pos_sent, neu_sent, neg_sent, comp_sent from symbol_comments ORDER BY timestamp", parse_dates={'date': '%Y-%m-%d'}, con=con)
        comments.loc[:, "symbols"] = comments.symbols.apply(lambda x: x.replace('BTC', 'BTC-USD'))
        companies = tuple(port.symbol.unique())
        c_data = pd.read_sql(f"SELECT * from mentions WHERE symbol IN {companies}", con=con, index_col='pk')

symbols_re = re.compile(r"\[|\]|\'|\'")
last_index = comments.index.max()
# decompose for single symbol
comments = comments.assign(symbols = lambda x: x.symbols.apply(lambda x: re.sub(symbols_re, '', x)).apply(str.split, sep=','))\
    .explode('symbols').reset_index().rename(columns={'index': 'comment_index'})
comments = comments[lambda x:(~( x.comment_index.isnull()) & (x.symbols.isin(companies)))]


recommendsDict = {"Very Bearish": 1, "Bearish": 2, "Neutral": 3, "Bullish": 4, "Very Bullish": 5}
recommends=recommends.assign(new_sent = lambda x: x.new_grade.apply(lambda g: recommendsDict[g]))\
    .assign(prev_sent = lambda x: x.prev_grade.apply(lambda g: recommendsDict[g]))

print(time.perf_counter())
# take aggregations over wanted frequency; make buy decisions based off of the frequency of data points and sentiments
# return port with new information: shares and cost * shares
class EAT():
    def __init__(self, portfolio, articles, comments, recs, start, end):
        self.portfolio = portfolio.copy(deep=True)
        self.postions = []
        self.start = start
        self.end = end
        self.articles = articles[lambda x: (x.date >= start) & (x.date <= end)]
        self.comments =  comments[lambda x: (x.date >= start) & (x.date <= end)]
        self.recs = recs[lambda x: (x.date >= start) & (x.date <= end)]
        self.aggs = {}

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


    def tradeSents(self, agg, label, min_samples, min_comp_sent, shares):
        starting_amount = 0
        # add action, shares, cost
        returns = self.aggs[agg][lambda x: (x.date >= self.start) & (x[label] >= min_comp_sent) & (x.counts >= min_samples)]
        # query portfolio for first cost add columns
        indexes = pd.Int64Index([])
        for date, sym in returns.loc[:, ['date', 'symbol']].values:
            ns = returns[lambda x: x.date == date].shape[0]
            if sym not in self.postions:
                self.postions.append(sym)
                f1_date = (date + relativedelta(years=1)).to_pydatetime()
                indexes = self.portfolio[lambda x: ((x.date > date) & (x.symbol == sym) & (x.date <= f1_date))].index
                self.portfolio.loc[indexes, "shares"] = shares
            else:
                self.postions.append(sym)
                f1_date = (date + relativedelta(years=1)).to_pydatetime()
                indexes = self.portfolio[lambda x: ((x.date > date) & (x.symbol == sym) & (x.date <= f1_date))].index
                self.portfolio.loc[indexes, "shares"] = shares * self.postions.count(sym)
            
            i = returns[lambda x: (x.date == date) & (x.symbol == sym)].index
            if not indexes.empty:
                returns.loc[i, 'cost'] = shares * self.portfolio.loc[indexes[0], "Close"]
                returns.loc[i, 'returns'] = shares * self.portfolio.loc[indexes[-1], "Close"]

            else:
                indexes = self.portfolio[lambda x: (x.symbol == sym)].index
                returns.loc[i, 'cost'] = shares * self.portfolio.loc[indexes[-1], "Open"]
                returns.loc[i, 'returns'] = shares * self.portfolio.loc[indexes[-1], "Close"]


        return self.portfolio.fillna(value=0)

print(time.perf_counter())
eat = EAT(port, articles, comments, recommends, dt.datetime(2018, 1, 1), dt.datetime(2022, 1, 30))
eat.aggregate()
eat.tradeSents("comments", "comp_sent", min_samples=1, min_comp_sent=0.15, shares=10)
# eat.tradeSents("articles", "comp_sent", 100, 0.5, 10)
# eat.tradeSents("recommendations", "new_sent", 25, 4, 10)

new_port = eat.portfolio