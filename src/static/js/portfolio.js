(function() {
    // computed: object of run functions / watch: progress f(x) / created: set atrributes and run functions on app creation (use this) / methods to run. @click
    var d_ = normAgain(createPyPortfolio(port))//  
    
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
                    fontSize: '100px'
                },
                min: -100,
                max: 100,
                type: 'area',
                drawer: true,
                headers: [
                    {
                      text: 'Symbol',
                      align: 'start',
                      sortable: true,
                      value: 'symbol',
                    },
                    {text: 'Return', value: 'returns'},
                    {text: 'Year', value: 'year'},
                    {text: 'Alpha', value: 'alpha'}
                  ],
                desserts: [],
                options: {
                    series: [{
                        data: d_,
                        name: "Mention Frequency Portfolio Returns"
                    },
                    ],
                    colors: ['purple', 'green', 'orange', 'red', 'blue'], 
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
                        colors: ['purple', 'green','orange',],
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
                comparisonIndex: undefined,
                indexItems: [
                    {sector: 'Consumer Discretionary', symbol: 'VCR', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VCR')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Consumer Discretionary Returns',
                    }},
                    {sector: 'Technology', symbol:'VGT', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VGT')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Technology Sector Returns',
                    }},
                    {sector: 'Financials', symbol: 'VFH', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VFH')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: `Financial Sector Returns`,
                    }},
                    {sector: 'Healthcare', symbol: 'VHT', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VHT')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: `Health Care Sector Returns`,
                    }},
                    {sector: 'Communication Services', symbol: "VOX", graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VOX')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: `Communication Services Sector Returns`,
                    }},
                    {sector: 'Industrials', symbol: 'VIS', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VIS')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Industrial Sector Returns',
                    }},
                    {sector: 'Consumer Staples', symbol: 'VDC', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VDC')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Consumer Staples Sector Returns',
                    }},
                    {sector: 'Materials', symbol: 'VAW', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VAW')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Materials Sector Returns',
                    }},
                    {sector: 'Utilities', symbol: 'VPU', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VPU')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Utilities Sector Returns',
                    }},
                    {sector: 'Energy', symbol:'VDE', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VDE')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Energy Sector Returns',
                    }},
                    {sector: 'Real Estate', symbol:'VNQ', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='VNQ')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Real Estate Sector Returns',
                    }},
                    {sector: 'S&P 500', symbol: 'SPY', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='SPY')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'S&P 500 Index Returns',
                    }},
                    {sector: 'Bitcoin', symbol: 'BTC-USD', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='BTC-USD')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Bitcoin Returns'
                    } },
                    {sector: 'Invesco QQQ', symbol: 'QQQ', graph: {
                        data: norm(port.filter(function (m) {return ((m.symbol =='QQQ')&(new Date(m.date) >= new Date('2020-01-01 00:00:00'))&(new Date(m.date) < new Date('2022-01-01 00:00:00')))}).map((f) => {return [new Date(f.date).getTime(), f.Close]})),
                        name: 'Invesco QQQ Returns'
                    }},
                    // {sector: 'Analyst Recommendations', symbol: 'ANYL', graph: {
                    //     data: norm(executeBuy(recomends, window_start=new Date('2017-01-01 00:00:00'),security="AAPL")),
                    //     name: 'Analyst Buy Returns'
                    // }},
                ],
                tabSelection: undefined,
                navTabs: [
                    'Evaluate',
                    'Allocate',
                    'Trade'
                ],
                analystRatings: [
                    'Very Bearish',
                    'Bearish',
                    'Neutral',
                    'Bullish',
                    'Very Bullish',
                ],
                analystFilter: undefined,
                analystSentRange: undefined,
                analystArray: highestValues(recommends, "Firm", 50),
                analystSelection: undefined,
                chatSentRange: undefined,
                chatArray: highestValues(comments, "channel", 1),
                chatSelection: undefined,
                publisherSentRange: undefined,
                publisherArray: highestValues(articles, "publisher", 100),
                publisherSelection: undefined,
                tradingWindows: ['1W', '2W', '1M', '2M', '3M', '6M', '1Y'],
                tradingPick: undefined,
            }
		},
        use: converter,
        components:{
            'apexchart': converter
        },
        created: function() {
            this.comparisonIndex = this.indexItems[11];
            this.analystSelection = this.analystArray;
            this.publisherSelection = this.publisherArray;
            this.chatSelection = this.chatArray;
            this.chatSentRange = [0, 100]
            this.publisherSentRange = [0, 100]
            this.analystSentRange = [0, 5]
            this.analystFilter = 2
            this.tabSelection = 'Evaluate'
            this.tradingPick = 1
        },
        computed: {
            newSector: function(){
                this.options.series.length > 3 ? this.options.series.pop(): undefined; 
                this.options.series.push(this.comparisonIndex.graph);
                this.desserts = this.desserts.concat(evalOverTime(port, this.comparisonIndex.symbol))
                return this.comparisonIndex.sector;
            },
        },
        methods: {
            onResetClick: function() {
                this.options.series = this.options.series.slice(0, 1)
                this.desserts = this.desserts.slice(0, 2)
            }
        }
	});
    
})();

