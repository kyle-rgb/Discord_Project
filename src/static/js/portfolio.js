(function() {
    // computed: object of run functions / watch: progress f(x) / created: set atrributes and run functions on app creation (use this) / methods to run. @click
	var svgNS = 'http://www.w3.org/2000/svg';
	var app = new Vue({
		el: '#app',
		vuetify: new Vuetify(),
		delimiters: ['[[',']]'],
		data: function() {
            
			return {
                customN: 0, 
                color: {
                    color: 'cyan',
                    fontFamily: 'Baloo Bhaijaan',
                    fontSize: '75px'
                },
                limits: [1, 20, 10],
                valid: false,
                limitRules: [
                    v => !!v || 'A Limit is Required',
                    v => typeof(Math.floor(v)) == 'number' || 'Must Enter a Whole Number'
                ],
                chartDate: undefined,
                min: -100,
                max: 100,
                type: 'area',
                drawer: true,
                methods: ['recommendations', 'articles', 'comments'],
                methodSelection: ['comments'], 
                headers: [
                    {
                      text: 'Symbol',
                      align: 'start',
                      sortable: true,
                      value: 'symbol',
                    },
                    {text: '% Returns', value: 'returns'},
                    {text: 'Year', value: 'year'},
                    {text: 'Alpha', value: 'alpha'}
                  ],
                desserts: [],
                headersAlloc: [
                    {
                        text: 'Security', align: 'start', sortable:true, value: 'symbol'
                    },
                    {text: '% Returns', value: 'returns'},
                    {text: 'Stategy', value: 'strategy'},
                    {text: 'Time', value: 'year'},
                ],
                desserts2: [],
                options: {
                    series: [
                    ],
                    colors: ['green', 'purple', 'orange', 'red', 'blue'], 
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
                        labels: {style: {colors: 'white'}, formatter: (val) => { return (val*100).toFixed(2) + "%"} }
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
                        colors: ['green', 'purple','orange', 'red', 'blue'],
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
                nd: undefined,
                marketReturns: undefined,
            }
		},
        use: converter,
        components:{
            'apexchart': converter
        },
        created: function() {
            this.chatSentRange = [0, 15];
            this.publisherSentRange = [0, 50];
            this.analystSentRange = [1, 4.1];
            this.comparisonIndex = this.indexItems[11];
            this.analystSelection = this.analystArray;
            this.publisherSelection = this.publisherArray;
            this.chatSelection = this.chatArray;
            this.analystFilter = 2;
            this.tabSelection = 'Evaluate';
            this.tradingPick = 1;
            this.onRetrieveData('Retail Trading Strategy', 'Chat');
            this.desserts2 = temp;
            
            
        },
        computed: {
            newSector: function(){
                this.options.series.length > 5 ? this.options.series.pop(): undefined; 
                this.options.series.includes(this.comparisonIndex.graph) ? undefined : this.options.series.push(this.comparisonIndex.graph);
                this.desserts = this.desserts.map((m) => m.symbol).includes(this.comparisonIndex.symbol) ? this.desserts: this.desserts.concat(evalOverTime(port, this.comparisonIndex.symbol))
                this.marketReturns = this.desserts.map((d) => {if (d.symbol == 'SPY'){return {year: d.year, returns: d.returns}}}).filter((f) => {return f})                
                return this.comparisonIndex.sector;
            },
        },
        methods: {
            onResetClick: function() {
                this.options.series = this.options.series.slice(0, 1)
                this.desserts = this.desserts.slice(0, 2)
            },
            onRetrieveData: function(name='Mixed Trading Strategy', shortname='Mix') {
                if (shortname == 'Mix') {
                    this.customN++
                    shortname +=` ${this.customN}`
                    name +=` ${this.customN}`
                }
                
                let ranges = this.chatSentRange.concat(this.analystSentRange).concat(this.publisherSentRange)
                console.log(ranges)
                console.log(`http://127.0.0.1:5000/AppAPI?method=${this.methodSelection}&min_samples=${this.limits}&threshold=${ranges}`)
                axios.get(`http://127.0.0.1:5000/AppAPI?method=${this.methodSelection}&min_samples=${this.limits}&threshold=${ranges}`  )
                .then(res => {
                    this.options.series.push({data: norm(createPyPortfolio(res.data, shortname)), name:  name});
                    let g = _.groupBy(temp, (d) => {return d.start_date})
                    _.forEach(g, (d, i) => {
                        let r = (_.sumBy(d, 'end_value')-_.sumBy(d, 'start_value'))/_.sumBy(d, 'start_value')
                        let m_r = this.marketReturns.filter((d) => {return (d.year == (new Date(i).getFullYear()))})
                        m_r = m_r[0].returns /100
                        this.desserts.push({returns: (r*100).toFixed(2), symbol: shortname.toUpperCase(), year: (new Date(i)).getFullYear(), alpha: ((r-m_r)*100).toFixed(2)})
                        })
                })
                return ''
            }
        }
	});
    
})();