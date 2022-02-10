var temp = [];
function createPyPortfolio(data, strat="Comments"){
    let new_data = data.map((d) => { d.port_value = d.Close * d.shares;return d; }).filter((d) => {return d.port_value})
    console.log(data)
    let ans = _(new_data).groupBy('date').map((d, i) => ({
            date: Number(i),
            port_value: _.sumBy(d, 'port_value')
        })).value()
    
    let share_groups = _.groupBy(data.filter((d) => {return d.shares}), d=>d.symbol)
    let share_set = new Set(Object.keys(share_groups));
    let sh_data = (data.filter((d) => {return share_set.has(d.symbol)}))
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
            });
        })
    })
    console.log(selectedCompanies)
    let a_key = _(temp).groupBy('start_date').map((d, i) => ({
        date: i,
        port_value: _.sumBy(d, 'start_value')
    })).value()
    console.log(a_key)
    temp.map((t) => {let alloc = a_key.filter((f) => {return f.date == t.start_date}); t.start_alloc = +((t.start_value / alloc[0].port_value).toFixed(2)); t.end_alloc = +(( t.end_value / alloc[0].port_value).toFixed(2));
    t.start_date = (new Date(t.start_date)).toLocaleDateString(); t.end_date = (new Date(t.end_date)).toLocaleDateString();
    })
    temp.sort((a, b) => a.start_date - b.start_date)
    console.log(temp)
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

// class EAT {
//     // port: Daily OHLC Data for Mentioned Companies and Comparison Indices
//     // recommends: Analyst Recommendations
//     // c_data: Chat Data on Count Frequency and Symbol
//     constructor(type, start_date){
//         this.type = type // four types available will be recommendations, articles, chat and mix; Find best balance of these comments.
//         this.daydelta = 86_400_000;
//         this.timeperiods = { 
//             "1W": 7,
//             "2W": 14,
//             "1M": 30,
//             "2M": 60,
//             "3M": 90,
//             "6M": 180,
//             "1Y": 365, 
//         }
//         this.positions = [];
//         this.agg = "";
//         this.start_date = new Date(start_date);
//         this.end_date = new Date("2021-12-31 11:59:59")
        
//     }

//     // evaluate: returns performance based on allocation and trades
//     evaluate(){
//         return this.type + this.type
//     }

//     // allocate: Returns Symbol and Portfolio % 
//     allocate(min_samples){
//         return null;
//     }
//     // trade: returns => Trade Decisionse Based Off of a Time Period and a Senitment number
//     trade(data, starting_sent, sent_delta){
//         // use given rule to (based on sentiment and min_samples to create trades; store this info in class to calc differences between securities) filter
//         let date_keys = Object.keys(data)        
//         let company_keys = Object.entries(data).map((aa) => {return Object.entries(aa[1])})
//         company_keys.map((d, i) => {return {date: date_keys[i], symbol: d[0][0][0], comp_sent: d[1].comp_sent, mentions: d[1].mentions, }})
//         // find closest day in port for symbol
//         let trades = company_keys.map((d, i) => {return d.map((a) => {return {date: new Date(date_keys[i]),symbol: a[0], comp_sent: a[1].comp_sent, mentions: a[1].mentions,
//             graph: port.filter((p) => {return (p.symbol===a[0]) & (p.Date >= new Date(date_keys[i]))}),
//         }
//         })}); 
        
//         trades = trades.flat().filter((t) => t.date <= this.end_date)
//         let current_holdings = [];
//         let port_size = 0; 
//         let trader = trades.map((q) => {
//             if ((q.comp_sent > starting_sent) & ~(current_holdings.includes(q.symbol))){
//                 current_holdings.push(q.symbol);
//                 return {action: 'Buy' , shares:10 , cost: q.graph[0].Close, symbol: q.graph[0].symbol, date: q.graph[0].Date, data:q.graph.filter((qq) => {return qq.Date <= moment(q.graph[0].Date).add(1, "year")})}
//             } else if ((q.comp_sent < starting_sent) & (current_holdings.includes(q.symbol))){
//                 return {action: 'Sold' , shares:0 , cost: q.graph[0].Close, symbol: q.graph[0].symbol, date: q.graph[0].Date, data:q.graph.filter((qq) => {return qq.Date <= moment(q.graph[0].Date).add(1, "year")})};
//             } else if ((q.comp_sent > starting_sent) & (current_holdings.includes(q.symbol))){
//                 return {action: 'Buy' , shares:10 , cost: q.graph[0].Close, symbol: q.graph[0].symbol, date: q.graph[0].Date, data:q.graph.filter((qq) => {return qq.Date <= moment(q.graph[0].Date).add(1, "year")})}
//             }
//         })
        
//         this.positions = trader.filter((t) => t).map((p) => {
//             p.data.map((pp) => {pp.port = pp.Close*p.shares});
//             return p
//         })
//         console.log(this.positions)
        
//         let new_pos = this.positions.map((pos) => {return pos.data.map((pd) => {return {date: pd.Date, value: pd.port}})}).flat()
//         let my_graph = Object.entries(_.groupBy(new_pos, y=> y.date)).map((m) => {let k = m[0]; return [(new Date(k)).getTime(), d3.sum(m[1].map((v) => v.value))]})
//         return my_graph// return shares, symbol, date
//     }

//     // it is sorted by date already, the earliest date the inital date
//     aggregate(data, min_samples, time_period_array){
//         let eval_date;
//         data = data.map((d) => {d.Date = new Date(d.Date); return d}).filter((f) => {return f.Date >= this.start_date})
//         data.map((d) => {d.moment = moment(d.Date);})
//         eval_date = (data[0].moment.add(time_period_array[0], time_period_array[1])).toDate();
//         data.map((d) => {d.Date < eval_date  ? d.grouping = eval_date : eval_date = d.moment.add(time_period_array[0], time_period_array[1]).toDate(); d.grouping = eval_date;})
//         this.agg = d3.groups(data, d=>d.grouping)
//         return this.agg
//     };

//     tradeSent(sentiment_data){
//         let string_re = /\[|\]|\'|\'/g
//         let current_groupings = this.agg.map((arr) => {return arr[0]}) // gives us all the windows available 
//         let first_date = new Date(sentiment_data[0].timestamp) 
//         let e_index = d3.min(current_groupings.map((a, i) => {let y; a-first_date > 0 ? y= i: y= null; return y}))
//         let eval_date = current_groupings[e_index];
//         sentiment_data.map((s) => {
//             s.symbols = s.symbols.replace(string_re, "").split(',').map((l) => l.trim());
//             s.timestamp = new Date(s.timestamp);
//             s.timestamp < eval_date ? s.grouping = eval_date : eval_date = current_groupings[e_index++]; s.grouping = eval_date;
//             s.cat_group = s.channel 
//         })
//         // next step is to rollup the data: mean sentiments, first / last comments, when the comments were shared and which channels shared them
//         var preroll = reducer(sentiment_data)
//         var groups = _.groupBy(preroll, d=>d.grouping)
//         for (let g of Object.entries(groups)){
//             groups[g[0]] = _.mapValues(_.groupBy(g[1], d=> d.symbol), (v)=> {return {
//                 comp_sent: d3.mean(v.map((a) => a.comp_sent)),
//                 pos_sent: d3.mean(v.map((a) => a.pos_sent)),
//                 neg_sent: d3.mean(v.map((a) => a.neg_sent)),
//                 neu_sent: d3.mean(v.map((a) => a.neu_sent)),
//                 mentions: d3.count(v.map((a) => a.comp_sent)),
//                 sources: v.map((eq) => eq.source),
//             }})
//         }
//         // first day will set whether to buy  and next aggregation will determin buy/hold/sell 
//         // values of groups will be tickers and aggregate information
//         this.chats = groups;
//         return this.chats;
//     }

//     tradeSentArt(sentiment_data){
//         let string_re = /\[|\]|\'|\'/g
//         let current_groupings = this.agg.map((arr) => {return arr[0]}) // gives us all the windows available 
//         let first_date = new Date(sentiment_data[0].date) 
//         let e_index = d3.min(current_groupings.map((a, i) => {let y; a-first_date > 0 ? y= i: y= null; return y}))
//         let eval_date = current_groupings[e_index];
//         sentiment_data.map((s) => {
//             s.symbols = [s.symbol]
//             s.date = new Date(s.date);
//             s.date < eval_date ? s.grouping = eval_date : eval_date = current_groupings[e_index++]; s.grouping = eval_date;
//             s.cat_group = s.publisher
//         })
//         highestValues(articles, "publisher", 800)
//         var preroll = reducer(sentiment_data)
//         var groups = _.groupBy(preroll, d=>d.grouping)
//         for (let g of Object.entries(groups)){
//             groups[g[0]] = _.mapValues(_.groupBy(g[1], d=> d.symbol), (v)=> {return {
//                 comp_sent: d3.mean(v.map((a) => a.comp_sent)),
//                 pos_sent: d3.mean(v.map((a) => a.pos_sent)),
//                 neg_sent: d3.mean(v.map((a) => a.neg_sent)),
//                 neu_sent: d3.mean(v.map((a) => a.neu_sent)),
//                 mentions: d3.count(v.map((a) => a.comp_sent)),
//                 sources: v.map((eq) => eq.source),
//             }})
//         }
//         this.articles = groups;
//         return this.articles;
//     }

//     tradeSentRecs(sentiment_data){
//         let string_re = /\[|\]|\'|\'/g
//         let current_groupings = this.agg.map((arr) => {return arr[0]}) // gives us all the windows available 
//         let first_date = new Date(sentiment_data[0].Date) 
//         let e_index = d3.min(current_groupings.map((a, i) => {let y; a-first_date > 0 ? y= i: y= null; return y}))
//         let eval_date = current_groupings[e_index];
//         sentiment_data.map((s) => {
//             s.symbols = [s.symbol]
//             s.Date = new Date(s.Date);
//             s.Date < eval_date ? s.grouping = eval_date : eval_date = current_groupings[e_index++]; s.grouping = eval_date; 
//             s.comp_sent = recommendsToRatings(s.new_grade);
//             s.comp_sent > 3 ? s.pos_sent = 1 : s.pos_sent = 0; 
//             s.comp_sent === 3 ? s.neu_sent = 1 : s.neu_sent = 0;
//             s.comp_sent < 3 ? s.neg_sent = 1 : s.neg_sent = 0;
//             s.cat_group = s.Firm;
//         })
//         var preroll = reducer(sentiment_data)
//         console.log(preroll)
//         var groups = _.groupBy(preroll, d=>d.grouping)
//         console.log(groups)
//         for (let g of Object.entries(groups)){
//             groups[g[0]] = _.mapValues(_.groupBy(g[1], d=> d.symbol), (v)=> {
            
//             return {
//                 comp_sent: d3.mean(v.map((a) => a.comp_sent)),
//                 mentions: d3.count(v.map((a) => a.comp_sent)),
//                 sources: v.map((eq) => eq.source),
//                 }
//         })
//         }
//         this.recs = groups;
//         return this.recs;
//     }
// }






// var eat = new EAT('analyst', "2019-01-01 00:00:00"); // should be one period before start
// let v = eat.aggregate(port, 1, [1, "year"])
// let ss = eat.tradeSent(comments)
// let as = eat.tradeSentArt(articles)
// let rs = eat.tradeSentRecs(recommends)
console.log('DONE')
// let yy = eat.trade(rs, 4)
// let ay = eat.trade(as, .5)
// let sy = eat.trade(ss, .15)


// for each object that is produced gives a backlog of information based on the various data sources.
// What the aggregation window determines (n) and the information about the data sources is aggragate from (n-1).
// so the date keys of the object are the trade dates. => which give the tickers for those companies meeting the criteria and the aggregate sentiments and counts of the companies from n-1 to n.

