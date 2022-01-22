(function() {
    // computed: object of run functions / watch: progress f(x) / created: set atrributes and run functions on app creation (use this) / methods to run. @click
    var d_ = norm(createPortfolio(port))//  
    
	var svgNS = 'http://www.w3.org/2000/svg';
	var app = new Vue({
		el: '#app',
		vuetify: new Vuetify(),
		delimiters: ['[[',']]'],
		data: function() {
            
			return {
                color: {
                    color: 'cyan',
                    fontFamily: 'Baloo Bhaijaan',
                    fontSize: '150px'
                },
                type: 'area',
                options: {
                    series: [{
                        data: d_,
                        name: "Mention Frequency Portfolio Returns"
                    },
                    {
                        data: norm(port.filter(function (m) {return ((m.symbol =='QQQ')&(new Date(m.Date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.Date) < new Date('2021-01-01 00:00:00')))}).map((f) => {return [new Date(f.Date).getTime(), f.Close]})),
                        name: 'Invesco QQQ Returns'
                    },
                    {
                        data: norm(port.filter(function (m) {return ((m.symbol =='SPY')&(new Date(m.Date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.Date) < new Date('2021-01-01 00:00:00')))}).map((f) => {return [new Date(f.Date).getTime(), f.Close]})),
                        name: 'S&P 500 Index Returns'
                    },
                    {
                        data: norm(createAnalystPortfolio(recomends)),
                        name: 'Analyst Buy Index Returns'
                    },
                    ],
                    colors: ['purple', 'orange', 'green', 'red'], 
                    dataLabels: {
                        enabled: false
                      },
                    markers: {
                        size: 0,
                        style: 'hollow',
                      },
                    xaxis: {
                        type: 'datetime',
                        labels: {style: {colors: 'white'} }
                      },
                    yaxis: {
                        tickAmount: 5,
                        labels: {style: {colors: 'white'}, formatter: (val) => { return val.toFixed(4) } }
                      },
                    tooltip: {
                        x: {
                          format: 'dd MMM yyyy'
                        },
                        y: {
                            formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                                return (((value / series[seriesIndex][0]) - 1)*100).toFixed(2) + "%" 
                              }
                        },
                        },
                    fill: {
                        colors: ['purple', 'orange', 'green'],
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.9,
                          stops: [0, 150]
                        }
                      },
                    legend: {
                        labels: {
                            colors: ['white']
                        },
                        position: 'top',
                        markers: {
                            width: 30,
                            height: 30,
                        },
                    }
                },
                
                

            }
                
		},
        use: converter,
        components:{
            'apexchart': converter
        }, 
	});
    
})();
