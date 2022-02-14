var temp = [];
function createPyPortfolio(data, strat="Comments"){
    let new_data = data.map((d) => { d.port_value = d.Close * d.shares;return d; }).filter((d) => {return d.port_value})
    
    let ans = _(new_data).groupBy('date').map((d, i) => ({
            date: Number(i),
            port_value: _.sumBy(d, 'port_value')
        })).value()
    
    let share_groups = _.groupBy(new_data.filter((d) => {return d.shares}), d=>d.symbol)
    let share_set = new Set(Object.keys(share_groups));
    let sh_data = (new_data.filter((d) => {return share_set.has(d.symbol)}))
    let selectedCompanies = _.groupBy(sh_data, (item) => {
        return item.symbol
    })
    _.forEach(selectedCompanies, (v, k) => {
        selectedCompanies[k] = _.groupBy(selectedCompanies[k], (item) => {
            return item.shares
        })
    })
    _.forEach(selectedCompanies, (v, k) => {
        _.forEach(selectedCompanies[k], (v1, k1) => {
            selectedCompanies[k][k1] = {first: _.minBy(selectedCompanies[k][k1], 'date'), last:_.maxBy(selectedCompanies[k][k1], 'date')}  ,
            selectedCompanies[k][k1].last.shares === null ? temp : temp.push({
                start_date: (selectedCompanies[k][k1].first.date),
                end_date:selectedCompanies[k][k1].last.date,
                symbol:selectedCompanies[k][k1].last.symbol,
                shares:selectedCompanies[k][k1].last.shares,
                start_value: +selectedCompanies[k][k1].first.port_value.toFixed(2),
                end_value: +selectedCompanies[k][k1].last.port_value.toFixed(2),
                returns: +(((selectedCompanies[k][k1].last.port_value -selectedCompanies[k][k1].first.port_value ) / selectedCompanies[k][k1].first.port_value)*100).toPrecision(5),
                strategy: strat,
                year: (new Date(selectedCompanies[k][k1].first.date)).getFullYear()
            });
        })
    })
    let a_key = _(temp).groupBy('start_date').map((d, i) => ({
        date: i,
        port_value: _.sumBy(d, 'start_value'),
        port_value_e: _.sumBy(d, 'end_value'),
    })).value()
    // console.log(a_key)
    temp.map((t) => {let alloc = a_key.filter((f) => {return f.date == t.start_date}); t.start_alloc = +((t.start_value / alloc[0].port_value).toFixed(2)); t.end_alloc = +(( t.end_value / alloc[0].port_value).toFixed(2));
    t.start_date = (new Date(t.start_date)).toLocaleDateString(); t.end_date = (new Date(t.end_date)).toLocaleDateString();
    })
    temp.sort((a, b) => a.start_date - b.start_date)
    return Object.values(ans).map((a) => {return [a.date, a.port_value]})
    
}

function normAgain(chart_data, basis=undefined){
    let start =(new Date (chart_data[0][0])).getFullYear();
    let inital_port = chart_data[0][1]
    return (chart_data.map((d, i) => {
        let date_ = (new Date(d[0])).getFullYear()
        if (date_ === start){
            return [d[0], d[1] / inital_port]
        } else {
            start = date_;
            inital_port = chart_data[i][1]
            return [d[0], d[1] / inital_port]
        }
        
    }))   
}


// function based off of stock mentions Returns: [utc.Timestamp, close of an Allocated Portfolio]
// handling allocation and aggregation based off the allocation (based on count)
function createPortfolio(data, start_date=new Date('2020-01-01 00:00:00'), end_date=new Date('2022-01-01 00:00:00')){
    // bring in comment data & aggregate 
    var mentions_total = c_data.map((c) => {return c.counts}).reduce((m, n) => {return m+=n})
    var assets = c_data
    //port.sort((a, b) => new Date(a.Date) - new Date(b.Date))
    for (let i=0; i < assets.length; i++){
        assets[i]['data'] = data.filter((c) => {return c.symbol == assets[i].symbol}).filter((c) => {return ((new Date(c.date) >= start_date)&( new Date(c.date)<= end_date))})
        assets[i].start_date = assets[i].data[0].date
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
            let i = 0 ;
            return stock.data.map((f) => {
                _date = new Date (f.date)  
                if (_date < new Date(d[index])){
                    f.i = i
                    f.port_weight = stock.counts / l[index]
                    f.mention_price = f.port_weight * f.Close
                    i++
                    return {date: _date,  asset_price: f.mention_price, symbol: f.symbol, i: f.i, port_weight: f.port_weight}
                } else {
                    index++
                    index > l.length-1 ? index =l.length-1 : index=index;
                    f.i = i
                    f.port_weight = (stock.counts / l[index])
                    f.mention_price = f.port_weight * f.Close
                    i++
                    return {date: _date,  asset_price: f.mention_price, symbol: f.symbol, i: f.i, port_weight: f.port_weight}
                }
            })
        })
    }).map((z) => {return z.reduce((u, u1) => {return u.concat(u1)})}).reduce((r, r1) => {return r.concat(r1)})
    // rollup
    // console.log(d3.rollup(f, v => d3.mean(v, d => d.port_weight*100), d=>d.symbol).entries().toArray().sort((a, b) => b[1] - a[1]).slice(0, 10))
    var rollup = d3.rollup(f, v => d3.sum(v, d => d.asset_price), d=>d.date)
    var ff = [];
    for (e of rollup.entries()){
        ff.push(e)
    }
    temp = f
    return ff.map((b) => [b[0].getTime(), +(b[1].toFixed(2))])
}
// create portfolio based on Mention Sentiment

// create portfolio based on Industry Analyst Recommendations
// returns [utc, close] based off of recommendations above thresh (> 4) and recommenders > 10
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

// returns [utc, pct] based off of first asset price
function norm(chart_data, basis=undefined){
    start = chart_data[0][1]
    return (chart_data.map((r) => {return [r[0], r[1] / start]}))   
}


// Generate Average for Security: [] 1-5
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
    
    results = tradeMaker(trades, security).flat()

    return results

}

function recommendsToRatings(recommendation){
    parser = {'Bullish': 4, 'Very Bullish': 5, 'Neutral': 3, 'Bearish': 2, 'Very Bearish': 1};
    return parser[recommendation]
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

// table setup
function evalOverTime(data, symbol, by="1Y"){
    mkt_data = data.filter((z) => {return ((z.symbol === "SPY")&(new Date(z.date) > new Date("2019-12-31 00:00:00")))})
    data = data.filter((z) => {return ((z.symbol === symbol)&(new Date(z.date) > new Date("2019-12-31 00:00:00"))&(new Date(z.date) < new Date("2022-01-01 00:00:00")))})
    _areturns  =  d3.rollup(data, v =>{return ((v.slice(-1)[0].Close)-v[0].Close)/v[0].Close}, d=>new Date(d.date).getFullYear()).entries().toArray()
    mkt_returns  =  d3.rollup(mkt_data, v =>{return ((v.slice(-1)[0].Close)-v[0].Close)/v[0].Close}, d=>new Date(d.date).getFullYear()).entries().toArray()
    _areturns = _areturns.map((b, i) => {return {symbol: symbol, year: b[0], returns: +(b[1]*100).toFixed(2), alpha:+((b[1]-mkt_returns[i][1])*100).toFixed(2)}})
    return _areturns
}

// selection setup
function highestValues(data, group,n){
    groupings = d3.groups(data, e=>e[group]).filter((x) => x[1].length >= n).map((x) => {return x[0]})
    data.map((d) => {groupings.includes(d[group])? d["cat_group"] = d[group] : d["cat_group"] = "other"})
    groupings.push("other")
    return groupings
}


function reducer (data){
    let symbols = port.map((p) => {return p.symbol})
    let r = data.map((d) => {
        objs = d.symbols.map((s) => {if (symbols.includes(s)) {return {source: d.cat_group,symbol: s, comp_sent: d.comp_sent, pos_sent: d.pos_sent, neg_sent: d.neg_sent, neu_sent: d.neu_sent, grouping: d.grouping}}})
        objs = objs.flat()
        return objs.filter((t) => {return t})
    });
    return r.flat()
}

