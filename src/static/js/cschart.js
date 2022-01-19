function cschart() {

    var margin = {top: 50, right: 30, bottom: 40, left: 5},
        width = 1000, height = 700, Bheight = 920;

    function csrender(selection) {
      selection.each(function() {
     
        var interval = TIntervals[TPeriod];

        var minimal  = d3.min(genData, function(d) { return d.Low; });
        var maximal  = d3.max(genData, function(d) { return d.High; });

        var extRight = width + margin.right
        var x = d3.scaleBand()
          .range([0, width]);
        
        var y = d3.scaleLinear()
            .rangeRound([height, 0]);
        
        // var xAxis = d3.svg.axis() d3.axisBottom(xScale).ticks(width / 80, (d3.time.format(TFormat[interval])).tickSizeOuter(0);
        //     .scale(x)
        //     .tickFormat);
        var xAxis = d3.axisBottom(x).ticks(width / 80).tickFormat(d3.timeFormat(TFormat[interval]));//;

        var yAxis = d3.axisRight(y).ticks(Math.floor(height/50))
            // .scale(y)
            // .ticks(Math.floor(height/50));

        x.domain(genData.map(function(d) { return d.Date; }));
        y.domain([minimal, maximal]).nice();
    
        var xtickdelta   = Math.ceil(60/(width/genData.length))
        xAxis.tickValues(x.domain().filter(function(d, i) { return !((i+Math.floor(xtickdelta/2)) % xtickdelta); }));
    
        var barwidth    = x.bandwidth();
        var candlewidth = Math.floor(d3.min([barwidth*0.8, 13])/2)*2+1;
        var delta       = Math.round((barwidth-candlewidth)/2);
    
        d3.select(this).select("svg").remove();
        var svg = d3.select(this).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", Bheight + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        svg.append("g")
            .attr("class", "axis xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    
        svg.append("g")
            .attr("class", "axis yaxis")
            .attr("transform", "translate(" + width + ",0)")
            .call(yAxis);
    
        svg.append("g")
            .attr("class", "axis grid")
            .attr("transform", "translate(" + width + ",0)")
            .call(yAxis);
    
        var bands = svg.selectAll(".bands")
            .data([genData])
          .enter().append("g")
            .attr("class", "bands");
    
        bands.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.Date) + Math.floor(barwidth/2); })
            .attr("y", 0)
            .attr("height", Bheight)
            .attr("width", 1)
            .attr("class", function(d, i) { return "band"+i; })
            .style("stroke-width", Math.floor(barwidth));
    
        var stick = svg.selectAll(".sticks")
            .data([genData])
          .enter().append("g")
            .attr("class", "sticks");
    
        stick.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.Date) + Math.floor(barwidth/2); })
            .attr("y", function(d) { return y(d.High); })
            .attr("class", function(d, i) { return "stick"+i; })
            .attr("height", function(d) { return y(d.Low) - y(d.High); })
            .attr("width", 1)
            .classed("rise", function(d) { return (d.Close>d.Open); })
            .classed("fall", function(d) { return (d.Open>d.Close); });
    
        var candle = svg.selectAll(".candles")
            .data([genData])
          .enter().append("g")
            .attr("class", "candles");
    
        candle.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.Date) + delta; })
            .attr("y", function(d) { return y(d3.max([d.Open, d.Close])); })
            .attr("class", function(d, i) { return "candle"+i; })
            .attr("height", function(d) { return y(d3.min([d.Open, d.Close])) - y(d3.max([d.Open, d.Close])); })
            .attr("width", candlewidth)
            .classed("rise", function(d) { return (d.Close>d.Open); })
            .classed("fall", function(d) { return (d.Open>d.Close); });

      });
    } // csrender

    csrender.Bheight = function(value) {
            	if (!arguments.length) return Bheight;
            	Bheight = value;
            	return csrender;
        	};
  
return csrender;
} // cschart
