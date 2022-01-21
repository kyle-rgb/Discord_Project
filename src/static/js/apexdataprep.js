function createPortfolio(data, start_date=new Date('2020-01-01'), end_date=new Date('2021-01-01')){
    // bring in comment data & aggregate 
    var mentions_total = c_data.map((c) => {return c.counts}).reduce((m, n) => {return m+=n})
    var assets = c_data
    //port.sort((a, b) => new Date(a.Date) - new Date(b.Date))
    for (let i=0; i < assets.length; i++){
        assets[i]['data'] = port.filter((c) => {return c.symbol == assets[i].symbol}).filter((c) => {return ((new Date(c.Date) >= start_date)&( new Date(c.Date)<= end_date))})
        assets[i].start_date = assets[i].data[0].Date.split(' ')[0]
    }
    // use the preference dates to grab starting close line for specific stock
    assets.sort((a, b) => {return new Date(a.start_date) - new Date(b.start_date)})
    var grouped = d3.groups(assets, d => d.start_date)
    var l = grouped.map((c) => {return c[1].map(function(x) { return x.counts}).reduce((m, n) => {return m+=n})})
    console.log(l)
    console.log(grouped)
    return grouped
}