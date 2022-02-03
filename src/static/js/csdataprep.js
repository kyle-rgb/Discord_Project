

function genType(d) {
  d.Date  = new Date(d.Date);
  d.Low        = +(d.Low.toFixed(2));
  d.High       = +(d.High.toFixed(2));; 
  d.Open       = +(d.Open.toFixed(2));;
  d.Close      = +(d.Close.toFixed(2));;
  d.Turnover   = +d.Turnover;
  d.Volatility = +d.Volatility;
  d.Volume = +d.Volume;
  d.Stock_Splits = +d.Stock_Splits;
  d.Volume = +d.Volume;
  d.Dividends = +d.Dividends;
  return d;
}

function timeCompare(date, interval) {
  if (interval == "week")       { var durfn = d3.timeMonday(date); }
  else if (interval == "month") { var durfn = d3.timeMonth(date); }
  else { var durfn = d3.timeDay(date); } 
  return durfn;
}

function dataCompress(data, interval) {
  
  var gen = [];
  data.map((d) => {d.group = timeCompare(d.Date, interval)})
  var grouped = d3.groups(data, d => d.group)
  
  var compressedData  = d3.rollup(grouped, v=>{return {
          
             Date:   v[0][1].map((t) => timeCompare(t.Date, interval)).pop(),
             Open:        v[0][1].map((t) => t.Open).shift(),
             Low:         d3.min(v[0][1].map((t) => t.Low)),
             High:        d3.max(v[0][1].map((t) => t.High)),
             Close:       (v[0][1].map((t) => t.Close)).pop(),
             Turnover:    d3.mean((v[0][1].map((t) => t.Turnover))), 
             Volatility:  d3.mean((v[0][1].map((t) => t.Volatility)))
            };
  }, d=> d[0])
  for (g of compressedData.entries()){
    gen.push(g)
  }
  gen = gen.map((g)=> g[1])
  return gen;
}
