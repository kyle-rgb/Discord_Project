function csheader() {

function cshrender(selection) {
  selection.each(function(data) {
  
    var interval   = TIntervals[TPeriod];
    var format     = (interval=="month")?d3.time.format("%b %Y"):d3.time.format("%b %d %Y");
    var dateprefix = (interval=="month")?"Month of ":(interval=="week")?"Week of ":"";
    d3.select("#infodate").text(dateprefix + format(data.Date));
    d3.select("#infoopen").text("O " + data.Open);
    d3.select("#infohigh").text("H " + data.High);
    d3.select("#infolow").text("L " + data.Low);
    d3.select("#infoclose").text("C " + data.Close);

  });
} // cshrender

return cshrender;
} // csheader
