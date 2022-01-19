

function genType(d) {
  d.Date  = parseDate(d.Date);
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
  if (interval == "week")       { var durfn = d3.time.monday(date); }
  else if (interval == "month") { var durfn = d3.time.month(date); }
  else { var durfn = d3.time.day(date); } 
  return durfn;
}

function dataCompress(data, interval) {
  var compressedData  = d3.nest()
                 .key(function(d) { return timeCompare(d.Date, interval); })
                 .rollup(function(v) { return {
                         Date:   timeCompare(d3.values(v).pop().Date, interval),
                         Open:        d3.values(v).shift().Open,
                         Low:         d3.min(v, function(d) { return d.Low;  }),
                         High:        d3.max(v, function(d) { return d.High; }),
                         Close:       d3.values(v).pop().Close,
                         Turnover:    d3.mean(v, function(d) { return d.Turnover; }),
                         Volatility:  d3.mean(v, function(d) { return d.Volatility; })
                        }; })
                 .entries(data).map(function(d) { return d.values; });
  return compressedData;
}
