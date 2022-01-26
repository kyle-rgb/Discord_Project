// function based off of stock mentions 
function createPortfolio(data, start_date=new Date('2020-01-01 00:00:00'), end_date=new Date('2022-01-01 00:00:00')){
    // bring in comment data & aggregate 
    var mentions_total = c_data.map((c) => {return c.counts}).reduce((m, n) => {return m+=n})
    var assets = c_data
    //port.sort((a, b) => new Date(a.Date) - new Date(b.Date))
    for (let i=0; i < assets.length; i++){
        assets[i]['data'] = data.filter((c) => {return c.symbol == assets[i].symbol}).filter((c) => {return ((new Date(c.Date) >= start_date)&( new Date(c.Date)<= end_date))})
        assets[i].start_date = assets[i].data[0].Date
    }
    // use the preference dates to grab starting close line for specific stock
    assets.sort((a, b) => {return new Date(a.start_date) - new Date(b.start_date)})
    var grouped = d3.groups(assets, d => d.start_date)
    var l = grouped.map((c) => {return c[1].map(function(x) { return x.counts}).reduce((m, n) => {return m+=n})})
    var j = 0;
    l = l.map((a) => {j+=a; return j})
    d =  grouped.map((d, i) => d[0])
    // with grouped it calculates portfolio based on date and number; calc share price based on total mentions of stock by available data;
    var f = grouped.map((g) => {
        return g[1].map((stock) => {
            var index = 0;
            var total = 0;
            return stock.data.map((f) => {
                _date = new Date (f.Date)
                if (_date < new Date(d[index])){
                    f.port_weight = stock.counts / l[index]
                    f.mention_price = f.port_weight * f.Close
                    return {date: _date,  asset_price: f.mention_price, symbol: f.symbol}
                } else {
                    index++
                    index > l.length-1 ? index =l.length-1 : index=index;
                    f.port_weight = (stock.counts / l[index])
                    f.mention_price = f.port_weight * f.Close
                    return {date: _date,  asset_price: f.mention_price, symbol: f.symbol}
                }
            })
        })
    }).map((z) => {return z.reduce((u, u1) => {return u.concat(u1)})}).reduce((r, r1) => {return r.concat(r1)})
    // rollup
    
    var rollup = d3.rollup(f, v => d3.sum(v, d => d.asset_price), d=>d.date)
    var ff = [];
    for (e of rollup.entries()){
        ff.push(e)
    }
    console.log(d3.rollup(f, v => d3.sum(v, d => d.asset_price), d=>d.symbol))
    return ff.map((b) => [b[0].getTime(), +(b[1].toFixed(2))])
}
// create portfolio based on Mention Sentiment

// create portfolio based on Industry Analyst Recommendations
function createAnalystPortfolio(data, start_date=new Date('2020-01-01 00:00:00'), end_date=new Date('2022-01-01 00:00:00')){
    data = data.map((d) => {d.Date = new Date(d.Date); return d}).filter((d) => {return ((d.Date <= new Date('2020-01-01 00:00:00')) & (d.Date >= new Date('2017-01-01 00:00:00')) ? d : undefined)})
    var rollup = d3.rollup(data, v => v.map((d) => [d.prev_grade, d.new_grade, d.Action, d.symbol]), d=>d.symbol)
    var ff = [];
    for (e of rollup.entries()){
        ff.push(e)
    }
    
    fa = ff.map((f) => {return f[1].map((v) => {return v[1]})})
    fa = parseRatings(fa.map((v) => {let u ={}; return v.map((a) => {a in u ? u[a]++: u[a]=1; return u})[0]}))
    ff.map((ar, i) => {ar.push(fa[i]); ar.push(ar[1].length)})
    // intialize a buy on jan 2 i 2020 if recomendation average >= 4
    to_buy = ff.filter((f) => {return f[2] > 4.0000 & f[3]  > 10})
    stocks = to_buy.map((b) => b[0])
    stock_data = port.filter((m) => {return ((stocks.includes(m.symbol))&(new Date(m.Date) >= start_date)&(new Date(m.Date) <= end_date))})
    var rollup = d3.rollup(stock_data, v => d3.sum(v, d => d.Close), d=>d.Date)
    var ffa = [];
    for (e of rollup.entries()){
        ffa.push(e)
    }
    return ffa.map((b) => [new Date(b[0]).getTime(), +(b[1].toFixed(2))])
}
// create portfolio based on Article Counts and Sentiments

// create a portfolio based on all these factors that maximizes returns compared to the market


function norm(chart_data){
    start = chart_data[0][1]
    return (chart_data.map((r) => {return [r[0], r[1] / start]}))
}

function parseRatings(rating_object_array){
    parser = {'Bullish': 4, 'Very Bullish': 5, 'Neutral': 3, 'Bearish': 2, 'Very Bearish': 1};
    return rating_object_array.map((a) => {let h = Object.entries(a); return d3.sum(h.map((k) => (parser[k[0]]*k[1]))) / d3.sum(h.map((k) => (k[1])))})
}

function executeBuy(data, window_start=new Date('2017-01-01 00:00:00'), security='TSLA',window_end=new Date('2020-01-01 00:00:00'), end_date=new Date('2022-01-01 00:00:00'),refresh_days=30){
    
    let day_delta = 86_400_000;
    let trades = [];
    // aggregate average initial sentiment based on window
    let inital_rating = recommendsToRatings(data.filter((r) => {return ((r.symbol==security) & (r.Date >= window_start) & (r.Date <= window_end))}))
    // go through sentiments generated during the window and return sentiment aggregate based on past and new_data 
    let trading_range = (end_date - window_end)
    trading_range/= day_delta
    trading_range = Math.floor(trading_range / refresh_days)

    for (let i=0; i<trading_range; i++){
        starter_date = window_start.getTime() + ((i*refresh_days)*day_delta)
        ender_date =  window_end.getTime()+((i*refresh_days)*day_delta)
        new_rating = recommendsToRatings(data.filter((r) => {return ((r.symbol==security) & (r.Date >= starter_date) & (r.Date <= ender_date))}))
        new_rating > inital_rating? trades.push({action: 'Buy', rating_change: new_rating - inital_rating, date: ender_date}):  trades.push({action: 'Sell', rating_change: new_rating - inital_rating, date: ender_date})
        inital_rating = new_rating
    }
    
    console.log(trades)
    results = tradeMaker(trades, security).flat()

    return results

}

function recommendsToRatings(recommendations){
    parser = {'Bullish': 4, 'Very Bullish': 5, 'Neutral': 3, 'Bearish': 2, 'Very Bearish': 1};
    return d3.mean(recommendations.map((r) => parser[r.new_grade]))
}

function tradeMaker(trades, symbol){
    var shares = 0;
    var basis = 0;
    var trade = 0;
    var window;
    trades=trades.filter((g) => {return g.action === 'Buy'})
    pri = trades.map((d , i) => {
        if (d.action == 'Buy') {
            shares += 2;
            trade++;
            i === trades.length-1 ? window =( new Date('2022-01-01 00:00:00')).getTime(): window = trades[i+1].date;
            var securities = port.filter((p) => {return ((d.date <= new Date(p.Date)) & (window >= (new Date(p.Date))) & (p.symbol == symbol))});      
            basis == 0? basis = securities[0].Close : basis = (basis*((shares-2)/shares)) + (securities[0].Close)*(2/shares);         
            return securities.map((s) => {return[(new Date(s.Date)).getTime(), ((s.Close) / basis)]})
        }
    });


    return pri.filter((r) => {return r}) 
}

