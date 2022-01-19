function csheader() {

function cshrender(selection) {
  selection.each(function(data) {
    
    var interval   = TIntervals[TPeriod];
    var format     = (interval=="month")?d3.timeFormat("%b %Y"):d3.timeFormat("%b %d %Y");
    var dateprefix = (interval=="month")?"Month of ":(interval=="week")?"Week of ":"";
    d3.select("#infodate").text(dateprefix + format(data.Date));
    d3.select("#infoopen").text("O " + data.Open);
    d3.select("#infohigh").text("H " + data.High);
    d3.select("#infolow").text("L " + data.Low);
    d3.select("#infoclose").text("C " + data.Close);
    d3.select("#infoturnover").text("TO " + (data.Turnover * 100).toFixed(2) + "%");
    d3.select("#infovola").text("VOLA " + (data.Volatility * 100).toFixed(2) + "%");

  });
} // cshrender

return cshrender;
} // csheader
