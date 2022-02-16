(function() {

	var svgNS = 'http://www.w3.org/2000/svg';
	new Vue({
		el: '#app',
		vuetify: new Vuetify(),
		delimiters: ['[[',']]'],
		data: function() {
			return {
				animation: undefined,
				animationDurationValueIndex: 2,
				animationDurationValues: [0, 1000, 5000, 10000],
				animationEasing: undefined,
				animationEasingValues: [
					'ease',
					'linear',
					'ease-in',
					'ease-out',
					'ease-in-out',
					'cubic-bezier(0.1,0.7,1.0,0.1)',
				],
				animationItems: [
					{
						text: 'bounce',
						value: ['bounceIn', 'bounceOut'],
					},
					{
						text: 'fade',
						value: ['fadeIn', 'fadeOut'],
					},
					{
						text: 'flipX',
						value: ['flipInX', 'flipOutX'],
					},
					{
						text: 'flipY',
						value: ['flipInY', 'flipOutY'],
					},
					{
						text: 'rotate',
						value: ['rotateIn', 'rotateOut'],
					},
					{
						text: 'zoom',
						value: ['zoomIn', 'zoomOut'],
					},
				],
				animationOverlapValueIndex: 1,
				animationOverlapValues: [0, 1/5, 1/2, 1],
				colorItemIndex: undefined,
				colorItems: [
					['#d99cd1', '#c99cd1', '#b99cd1', '#a99cd1'],
					['#403030', '#f97a7a'],
					['#31a50d', '#d1b022', '#74482a'],
					['#ffd077', '#3bc4c7', '#3a9eea', '#ff4e69', '#461e47'],
				],
				drawer: true,
				fontFamily: undefined,
				fontFamilyValues: [
					// 'Abril Fatface',
					// 'Annie Use Your Telescope',
					// 'Anton',
					// 'Bahiana',
					'Baloo Bhaijaan',
					// 'Barrio',
					// 'Finger Paint',
					'Fredericka the Great',
					// 'Gloria Hallelujah',
					// 'Indie Flower',
					// 'Life Savers',
					// 'Londrina Sketch',
					// 'Love Ya Like A Sister',
					// 'Merienda',
					// 'Nothing You Could Do',
					// 'Pacifico',
					// 'Quicksand',
					// 'Righteous',
					// 'Sacramento',
					// 'Shadows Into Light',
				],
				fontSizeRatioValueIndex: 1,
				fontSizeRatioValues: [0, 1/10, 1/5, 1/2, 1],
				progress: undefined,
				progressVisible: true,
				rotationItemIndex: undefined,
				rotationItems: [
					{
						// straight-line
						value: 0,
						svg: (function() {
							var div = document.createElement('div');
							div.appendChild((function() {
								var svg = document.createElementNS(svgNS, 'svg');
								svg.setAttribute('viewBox', '0 0 12 12');
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
									return path;
								})());
								return svg;
							})());
							return URL.createObjectURL(new Blob([div.innerHTML]));
						})(),
					},
					{
						// 45 degree angle (360-45) = 315 for transform
						value: 7/8,
						svg: (function() {
							var div = document.createElement('div');
							div.appendChild((function() {
								var svg = document.createElementNS(svgNS, 'svg');
								svg.setAttribute('viewBox', '0 0 12 12');
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
									path.setAttribute('transform', 'rotate(315 6 6)');
									return path;
								})());
								return svg;
							})());
							return URL.createObjectURL(new Blob([div.innerHTML]));
						})(),
					},
					{
						// function to select rotation for cross mask
						value: function(word) {
							var chance = new Chance(word[0]);
							return chance.pickone([0, 3/4]);
						},
						// returns ei
						svg: (function() {
							var div = document.createElement('div');
							div.appendChild((function() {
								var svg = document.createElementNS(svgNS, 'svg');
								svg.setAttribute('viewBox', '0 0 12 12');
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
									return path;
								})());
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
									path.setAttribute('transform', 'rotate(90 6 6)');
									return path;
								})());
								return svg;
							})());
							return URL.createObjectURL(new Blob([div.innerHTML]));
						})(),
					},
					{
						value: function(word) {
							var chance = new Chance(word[0]);
							return chance.pickone([0, 1/8, 3/4, 7/8]);
						},
						// creates star formation
						svg: (function() {
							var div = document.createElement('div');
							div.appendChild((function() {
								var svg = document.createElementNS(svgNS, 'svg');
								svg.setAttribute('viewBox', '0 0 703 303');
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', `M2520 3014 c-333 -32 -530 -77 -750 -170 -263 -110 -472 -301 -588
									-536 -40 -80 -45 -86 -85 -98 -97 -29 -257 -123 -331 -196 -37 -36 -99 -124
									-93 -131 2 -2 31 8 65 22 70 28 72 29 72 15 0 -22 -86 -102 -154 -145 -167
									-103 -367 -166 -539 -167 l-107 -1 22 -25 c56 -59 174 -92 338 -92 63 0 130 6
									165 15 81 21 206 81 351 171 67 41 124 74 128 74 3 0 6 -9 6 -19 0 -24 -69
									-94 -144 -146 l-57 -39 43 -20 c54 -26 88 -88 88 -157 l0 -48 95 -45 c196 -93
									353 -215 398 -310 34 -71 52 -80 146 -73 56 5 86 2 116 -9 94 -37 122 -29 159
									44 31 61 48 75 126 106 57 22 61 25 33 25 -31 1 -33 3 -33 37 0 20 -10 74 -22
									121 -25 93 -21 108 26 131 52 26 88 9 164 -76 38 -42 93 -106 121 -142 67 -85
									141 -146 217 -180 33 -15 87 -53 121 -84 l62 -57 32 47 c51 75 69 133 69 227
									-1 127 -34 181 -180 291 -173 130 -195 236 -76 364 50 54 81 115 92 180 l7 43
									24 -23 c35 -33 27 -72 -41 -209 -62 -124 -71 -179 -38 -233 10 -16 62 -59 117
									-95 145 -96 170 -143 170 -321 l0 -106 -42 -73 c-71 -121 -73 -161 -16 -244
									33 -48 131 -123 172 -132 20 -4 46 1 80 16 97 41 201 7 325 -107 84 -79 112
									-84 208 -39 61 28 94 31 160 11 43 -13 50 -13 84 5 48 24 68 24 184 0 65 -14
									99 -17 111 -10 18 9 18 12 -2 62 -57 147 -136 249 -228 296 l-43 22 -71 -21
									c-40 -12 -88 -31 -107 -42 l-34 -20 -23 27 c-13 14 -23 33 -23 41 0 13 -8 14
									-42 9 -24 -4 -65 -16 -91 -26 -86 -34 -174 -20 -211 33 -37 52 -6 91 104 133
									117 43 188 85 231 133 35 41 46 65 78 181 6 21 13 9 40 -67 30 -81 36 -91 55
									-87 72 15 284 27 421 24 247 -4 330 -1 421 16 100 19 266 74 430 143 152 65
									235 87 273 74 22 -8 30 -6 38 6 8 13 19 2 61 -60 60 -89 86 -110 201 -168 119
									-59 136 -74 203 -174 179 -264 203 -465 68 -565 -26 -18 -31 -28 -27 -49 4
									-23 -5 -37 -64 -93 -37 -36 -75 -79 -83 -94 -20 -38 -8 -52 87 -96 67 -32 79
									-34 172 -34 73 0 113 5 148 18 26 10 47 21 47 24 0 3 -7 30 -16 60 -19 64 -14
									91 25 135 26 30 29 42 32 116 4 69 8 86 24 98 11 8 28 12 38 9 64 -20 60 -21
									53 19 -4 22 -39 86 -81 148 -90 135 -100 170 -90 338 7 113 6 120 -18 173 -20
									44 -36 62 -79 90 -72 46 -104 86 -118 149 -18 79 0 151 75 308 35 74 69 157
									75 183 13 60 0 143 -37 237 -33 83 -129 275 -155 311 -33 44 -18 90 50 159 91
									90 221 127 340 96 116 -29 169 -86 207 -221 22 -76 66 -164 96 -192 13 -12 43
									-29 67 -38 47 -19 48 -21 26 -46 -15 -17 -13 -18 23 -26 59 -13 204 -9 247 6
									l40 14 -78 27 c-78 28 -179 89 -196 119 -12 22 -28 5 -32 -35 l-3 -32 -37 15
									c-48 19 -93 87 -108 161 -26 135 -49 192 -96 239 -112 111 -302 139 -476 68
									-83 -34 -137 -67 -177 -109 -19 -20 -38 -36 -42 -36 -5 0 -27 13 -51 28 -59
									40 -110 58 -201 72 -109 18 -301 7 -452 -25 -195 -42 -275 -47 -620 -41 -608
									10 -688 31 -1119 288 -128 76 -162 92 -224 104 -91 17 -354 17 -542 -2z M5187 1269 c-41 -10 -126 -50 -170 -81 -15 -11 -37 -38 -48 -61 -12
									-23 -61 -82 -109 -132 -48 -49 -97 -109 -109 -132 l-21 -43 -65 0 c-61 0 -65
									-1 -65 -23 0 -32 -52 -78 -135 -120 -115 -58 -113 -55 -84 -112 30 -61 93 -98
									202 -120 64 -14 90 -14 154 -5 133 20 122 10 116 99 -7 90 -4 94 81 110 75 14
									86 23 86 78 0 94 89 298 160 368 37 36 44 39 117 44 43 4 84 10 91 14 21 14
									13 42 -20 74 -53 51 -98 62 -181 42z M2558 795 c-6 -46 -45 -134 -123 -270 -41 -71 -45 -85 -40 -123 6
									-40 2 -51 -50 -137 -68 -111 -68 -130 -5 -164 77 -43 158 -35 338 31 47 17 52
									22 52 49 0 42 -24 94 -70 154 -48 63 -50 83 -9 98 l31 12 -8 55 c-12 80 -6
									157 15 206 l19 42 -25 6 c-13 4 -44 25 -67 46 -24 22 -46 40 -48 40 -3 0 -8
									-20 -10 -45z`);
									return path;
								})());
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', `M5187 1269 c-41 -10 -126 -50 -170 -81 -15 -11 -37 -38 -48 -61 -12
									-23 -61 -82 -109 -132 -48 -49 -97 -109 -109 -132 l-21 -43 -65 0 c-61 0 -65
									-1 -65 -23 0 -32 -52 -78 -135 -120 -115 -58 -113 -55 -84 -112 30 -61 93 -98
									202 -120 64 -14 90 -14 154 -5 133 20 122 10 116 99 -7 90 -4 94 81 110 75 14
									86 23 86 78 0 94 89 298 160 368 37 36 44 39 117 44 43 4 84 10 91 14 21 14
									13 42 -20 74 -53 51 -98 62 -181 42z`);
									path.setAttribute('transform', 'rotate(90 350 150)');
									return path;
								})());
								// svg.appendChild((function() {
								// 	var path = document.createElementNS(svgNS, 'path');
								// 	path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
								// 	path.setAttribute('transform', 'rotate(90 6 6)');
								// 	return path;
								// })());
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', `M2558 795 c-6 -46 -45 -134 -123 -270 -41 -71 -45 -85 -40 -123 6
									-40 2 -51 -50 -137 -68 -111 -68 -130 -5 -164 77 -43 158 -35 338 31 47 17 52
									22 52 49 0 42 -24 94 -70 154 -48 63 -50 83 -9 98 l31 12 -8 55 c-12 80 -6
									157 15 206 l19 42 -25 6 c-13 4 -44 25 -67 46 -24 22 -46 40 -48 40 -3 0 -8
									-20 -10 -45z`);
									path.setAttribute('transform', 'rotate(315 425 233)');
									return path;
								})());
								return svg;
							})());
							return URL.createObjectURL(new Blob([div.innerHTML]));
						})(),
					},
					{
						value: function(word) {
							var chance = new Chance(word[0]);
							return chance.random();
						},
						// creates circle
						svg: (function() {
							var div = document.createElement('div');
							div.appendChild((function() {
								var svg = document.createElementNS(svgNS, 'svg');
								svg.setAttribute('viewBox', '0 0 2 2');
								svg.appendChild((function() {
									var circle = document.createElementNS(svgNS, 'circle');
									circle.setAttribute('cx', 1);
									circle.setAttribute('cy', 1);
									circle.setAttribute('r', 1);
									return circle;
								})());
								return svg;
							})());
							return URL.createObjectURL(new Blob([div.innerHTML]));
						})(),
					}
				],
				snackbarText: '',
				snackbarVisible: false,
				spacingValueIndex: 2,
				spacingValues: [0, 1/4, 1/2, 1, 2],
				wordsText: undefined,
				wordsTextStr: undefined,
				treeSeries: undefined,
				hcolor: {
                    color: 'cyan',
                    fontFamily: 'Baloo Bhaijaan',
                    fontSize: '100px',
                },
                hcolor2: {
                    color: 'red',
                    fontFamily: 'Baloo Bhaijaan',
                    fontSize: '55px',
                },
                hcolor3: {
                    color: 'Green',
                    fontFamily: 'Share Tech Mono',
                    fontSize: '45px',
                },
				seriesHeat: [
					{
					  name: "Aug 2020",
					  data: [
					  	{
						x: 'MAX AVG SENTIMENT',
						y: 5
						},
					  	{
						x: 'MIN AVG SENTIMENT',
						y:12
					  	},
						{
						x: 'MAX POS SENTIMENT',
						y: 35
					  	},
						{
						x: 'MIN NEG SENTIMENT',
						y: 50
					  	},
						{
							x: 'HIGHEST ENGAGED COMPANY',
							y: 35
						},
						{
							x: 'Best Performer',
							y: 50
						},
						{
							x: 'Worst Performer',
							y: 50
						},	
					]
					},
					{
					  name: "Sept 2020",
					  data: [
						{
					  x: 'MAX AVG SENTIMENT',
					  y: 5
					  },
						{
					  x: 'MIN AVG SENTIMENT',
					  y:12
						},
					  {
					  x: 'MAX POS SENTIMENT',
					  y: 35
						},
					  {
					  x: 'MIN NEG SENTIMENT',
					  y: 50
						},
					  {
						  x: 'HIGHEST ENGAGED COMPANY',
						  y: 35
					  },
					  {
						  x: 'Best Performer',
						  y: 50
					  },
					  {
						  x: 'Worst Performer',
						  y: 50
					  },	
				  ]
					}
				  ],
				seriesHeat2: [],
				seriesDonut: [],
				chartOptionsDonut: {
					chart: {
						type: 'donut',
						foreColor: 'white',
					},
					colors: ['#FF3939', '#17FF08', '#FFF700', '#838383', '#027000', '#00D8FF'],
					labels: ['Bearish', 'Bullish', 'Bullish/Neutral', 'Not Rated', 'Very Bullish', 'pre-IPO'],
					responsive: [{
					breakpoint: 480,
					options: {
						chart: {
						width: 200
						},
						legend: {
						position: 'bottom'
						}
					}
					}]
				},
				seriesBar: [{
					name: 'Positive Comments',
					data: [44, 55, 41, 37, 22, 43, 21, 20],
					color: '#18E100',
				  }, {
					name: 'Neutral Comments',
					data: [53, 32, 33, 52, 13, 43, 32, 34],
					color: '#FFF03D',
				  }, {
					name: 'Negative Comments',
					data: [12, 17, 11, 9, 15, 11, 20, 21],
					color: '#B32824',
				  },],
				chartOptionsBar: {
					chart: {
					  type: 'bar',
					  height: 350,
					  stacked: true,
					  stackType: '100%',
					  foreColor: 'white',
					},
					plotOptions: {
					  bar: {
						horizontal: true,
					  },
					},
					dataLabels: {style: {colors: ['black']}},
					stroke: {
					  width: 1,
					  colors: ['#fff']
					},
					title: {
					  text: 'Private Chat Sentiments',
					  align: 'center',
					  style: {
						fontFamily: 'Baloo Bhaijaan',
						fontSize: '20px',
					  },
					},
					xaxis: {
					  categories: ["May", "June", "July", "Aug", "Sept", "Oct", 'Nov', 'Dec'],
					},
					tooltip: {
					  fillSeriesColor: true,
					  y: {
						formatter: function (val) {
						  return val + "K"
						}
					  }
					},
					fill: {
					  opacity: 1,
					  colors: ['#1A73E8', '#B32824', '#BF119A'],
					
					},
					legend: {
					  position: 'top',
					  horizontalAlign: 'center',
					  labels: {useSeriesColors: true,},
					  
					}
				  },
				seriesBarNews: [{
					name: 'Positive Articles',
					data: [50, 55, 61, 67, 62, 45, 51, 54],
					color: '#18E100',
				  }, {
					name: 'Neutral Articles',
					data: [33, 32, 33, 42, 38, 40, 30, 31],
					color: '#FFF000',
				  }, {
					name: 'Negative Articles',
					data: [22, 17, 18, 19, 18, 14, 20, 25],
					color: '#B32800',
				  },],
				chartOptionsBarNews: {
					chart: {
					  type: 'bar',
					  height: 350,
					  stacked: true,
					  stackType: '100%',
					  foreColor: 'white',
					},
					plotOptions: {
					  bar: {
						horizontal: true,
					  },
					},
					dataLabels: {style: {colors: ['black']}},
					stroke: {
					  width: 1,
					  colors: ['#fff']
					},
					title: {
					  text: 'Media Stories Sentiments',
					  align: 'center',
					  style: {
						fontFamily: 'Baloo Bhaijaan',
						fontSize: '20px',
					  },
					},
					xaxis: {
					  categories: ["May", "June", "July", "Aug", "Sept", "Oct", 'Nov', 'Dec'],
					},
					tooltip: {
					  fillSeriesColor: true,
					  y: {
						formatter: function (val) {
						  return val + "K"
						}
					  }
					},
					fill: {
					  opacity: 1,
					  colors: ['#1A73E8', '#B32824', '#BF119A'],
					
					},
					legend: {
					  position: 'top',
					  horizontalAlign: 'center',
					  
					}
				  },
				chartOptionsHeat: {
						chart: {
							height: 350,
							type: 'heatmap',
						},
						plotOptions: {
							heatmap: {
							shadeIntensity: 0.35,
							radius: 0,
							reverseNegativeShade: true, 
							useFillColorAsStroke: true,
							colorScale: {
								ranges: [{
									from: -1,
									to: 0,
									name: 'low',
									color: '#9B0000'
								},
								{
									from: 0.01,
									to: 0.50,
									name: 'medium',
									color: '#00FF36'
								},
								{
									from: 0.50,
									to: 1,
									name: 'high',
									color: '#006C17'
								},
								]
							}
							}
						},
						tooltip: {
							fillSeriesColor: true,
							z: {
								title: 'Ticker: '
							}
						},
						dataLabels: {
							enabled: true,
						},
						stroke: {
							width: 1
						},
						dataLabels: {
						style: {
									colors: ['white']
								}
						},
						yaxis: {
							labels: {
								style: {
									colors: ['white']
								}
							}
						},
						xaxis: {
							labels: {
								style: {
									colors: 'white'
								},
							}
						},
						title: {
							text: 'HeatMap of News Media',
							align: 'center',
							style: {
								color: 'white',
								fontSize: '16px',
								fontFamily:  "Baloo Bhaijaan",
							}
						},
						legend: {labels: {colors: 'white'}},
				},
				chartOptionsHeat2: {
					chart: {
						height: 350,
						type: 'heatmap',
					},
					plotOptions: {
						heatmap: {
						shadeIntensity: 0.35,
						radius: 0,
						useFillColorAsStroke: true,
						reverseNegativeShade: true, 
						colorScale: {
							ranges: [{
								from: -1,
								to: 0,
								name: 'low',
								color: '#9B0000'
							},
							{
								from: 0.01,
								to: 0.50,
								name: 'medium',
								color: '#00FF36'
							},
							{
								from: 0.50,
								to: 1,
								name: 'high',
								color: '#006C17'
							},
							]
						}
						}
					},
					tooltip: {
						fillSeriesColor: true,
						z: {
							title: 'Ticker: '
						}
					},
					dataLabels: {
						enabled: true
					},
					stroke: {
						width: 1
					},
					dataLabels: {
					style: {
								colors: ['white']
							}
					},
					yaxis: {
						labels: {
							style: {
								colors: ['white']
							}
						}
					},
					xaxis: {
						labels: {
							style: {
								colors: 'white'
							},
						}
					},
					title: {
						text: 'HeatMap of Private Chats',
						align: 'center',
						style: {
							color: 'white',
							fontSize: '16px',
							fontFamily:  "Baloo Bhaijaan",
						}
					},
					legend: {labels: {colors: 'white'}},
				},
				chartOptionsTree: {
					tooltip: {
						fillSeriesColor: true,
						y: {
							formatter: (s) => s.toFixed(2)+"%",
						}
					},
					legend: { show: false},
					chart: {
						  height: 2000,
						  type: 'treemap'},
					title: {
						  text: 'Stock Basket Returns',
						  align: 'center',
						  style: {
							  fontSize: '55px',
							  fontFamily: "Baloo Bhaijaan",
							  color:  '#FFFFFF'
						  }

						},
					dataLabels: {
						enabled: true,
						style: {
							fontSize: '12px',
						},
						formatter: function(text, op) {
							return [text, op.value.toFixed(2)+"%"]
						},
						offsetY: -4
					},
					plotOptions: {
						treemap: {
							enableShades: true,
							shadeIntensity: 0.25,
							reverseNegativeShade: true,
							colorScale: {
							ranges: [
								{
								  from: -100,
								  to: 0,
								  color: '#CD363A'
								},
								{
								  from: 0,
								  to: 100.00,
								  color: '#00FF36'
								},
								{
								  from: 100.01,
								  to: 3100,
								  color: '#006C17'
								}
							]
							}
						}
					}
				},
				seriesBubb: [{
					name: 'Bubble1',
					data: [
						{x: 1, y: 2.78, z:15},
						{x: 1, y: 3.52, z:35},
						{x: 1, y: 3.73, z:22},		
					]
				  },],
				chartOptionsBubb: {
					chart: {
						height: 350,
						type: 'bubble',
						foreColor: '#ffffff',
					},
					tooltip: {fillSeriesColor: true},
					dataLabels: {
						enabled: true
					},
					fill: {
						opacity: 0.8
					},
					title: {
						text: 'Simple Bubble Chart'
					},

					yaxis: {
						max: 5
					}
				  },
				seriesSent: [
					  {
						name: "Institutional Analysts",
						data: [28, 29, 33, 36, 32, 32, 33, 40]
					  },
					  {
						name: "Retail Traders",
						data: [12, 11, 14, 18, 17, 25, 20, 33]
					  },
					  {
						name: "News Media",
						data: [20, 18, 15, 11, 22, 14, 19, 25]
					  }
					],
				chartOptionsLine: {
					  chart: {
						height: 350,
						type: 'line',
						dropShadow: {
						  enabled: true,
						  color: '#000',
						  top: 18,
						  left: 7,
						  blur: 10,
						  opacity: 0.2
						},
						toolbar: {
						  show: false
						}
					  },
					  colors: ['#F310AB', '#CC0032', '#11AA11'],
					  dataLabels: {
						enabled: true,
						style: {colors: ['#F310AB', '#CC0032', '#11AA11']}
					  },
					  stroke: {
						curve: 'smooth'
					  },
					  title: {
						text: 'Sentiment by Sector',
						align: 'center',
						style: {color:'white', fontFamily: 'Baloo Bhaijaan'},

					  },
					  markers: {
						size: 0
					  },
					  xaxis: {
						categories: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
						title: {
						  text: 'Month',
						  style: {color: 'white'}
						},
						labels: {style: {colors: 'white'}},
						
					  },
					  yaxis: {
						title: {
						  text: 'Sentiment',
						  style: {color: 'white'},
						},
						min: 5,
						max: 40,
						labels: {style: {colors: 'white'}}
					  },
					  tooltip: {fillSeriesColor: true},
					  legend: {
						position: 'top',
						horizontalAlign: 'center',
						floating: true,
						offsetY: -10,
						offsetX: 0,
						labels: {colors: ['white']}
					  }
					},
			};
		},
		computed: {
			animationDuration: function() {
				return this.animationDurationValues[this.animationDurationValueIndex];
			},
			animationOverlap: function() {
				return this.animationOverlapValues[this.animationOverlapValueIndex];
			},
			color: function() {
				var colors = this.colorItems[this.colorItemIndex];
				return function() {
					return chance.pickone(colors);
				};
			},
			enterAnimation: function() {
				return [
					'animated',
					this.animation[0],
				]
					.map(function(value) {
						return 'animate__' + value;
					})
					.join(' ');
			},
			fontSizeRatio: function() {
				return this.fontSizeRatioValues[this.fontSizeRatioValueIndex];
			},
			leaveAnimation: function() {
				return [
					'animated',
					this.animation[1],
				]
					.map(function(value) {
						return 'animate__' + value;
					})
					.join(' ');
			},
			rotation: function() {
				var item = this.rotationItems[this.rotationItemIndex];
				return item.value;
			},
			spacing: function() {
				return this.spacingValues[this.spacingValueIndex];
			},
			words: function() {
				
				this.wordsTextStr = this.wordsText.join('\n').replace(/,/g, " ");
				return this.wordsText
			},
		},
		watch: {
			progress: function(currentProgress, previousProgress) {
				if (previousProgress) {
					this.progressVisible = false;
				}
			},
		},
        use: converter,
        components:{
            'apexchart': converter
        },
		created: function() {
			this.generateWordsText();
			this.animation = this.animationItems[5].value;
			this.animationEasing = "linear"
			this.colorItemIndex = 3
			this.fontFamily = "Baloo Bhaijaan"
			this.rotationItemIndex = 1;
			this.seriesDonut = pieRatings.data[0];
			this.treeSeries = this.createReturnMap(port, new Date('2020-01-01'), new Date('2022-01-01'));
			this.seriesHeat = this.createHeatReturns(articlesSent, 'May 2020', 'Dec 2020')
			this.seriesHeat2 = this.createHeatReturns(commentsSent, 'May 2020', 'Dec 2020')
			this.createBar(comments_pt, articles_pt)
		},
		methods: {
			generateWordsText: function() {
				words_array = new Array();
				var str = new String();
				
				c_data = c_data.slice(0, 100);
				c_data.map((d) => {if (cos.includes(d.symbol)) {words_array.push([d.symbol, +d.counts])}})
				this.wordsText = words_array//.join('\n').replace(',', " ");
				return words_array;
			},
			loadFont: function(fontFamily, fontStyle, fontWeight, text) {
				return (new FontFaceObserver(fontFamily, {style: fontStyle, weight: fontWeight})).load(text);
			},
			onWordClick: function(word) {
				this.snackbarVisible = true;
				this.snackbarText = word[0] + " references: " + word[1];
				this.hrefs = word[0]
			},
			onLinkClick: function(w){
				
				open(`/gather-stock-data?ticker=${this.hrefs}`, "_blank")
			},
			createReturnMap: function(data, start_date, end_date){
				start_date = new Date(start_date)
				end_date = new Date(end_date)
				data = data.map((m) => {m.date = new Date(m.date); return m}).filter((d) => {return ((d.date) >= start_date) & ((d.date) <= end_date)})
				let selectedCompanies = _.groupBy(data, (item) => {
					return item.symbol
				})
				_.forEach(selectedCompanies, (v, k) => {
					selectedCompanies[k] = {y: ((_.maxBy(v, 'date').Close - _.minBy(v, 'date').Close)/_.minBy(v, 'date').Close)*100, x:k}
				})
				let gfg = _.sortBy(selectedCompanies, (d, i) =>{
					return -d.y
				})
				gfg =[{data: gfg}]
			
				return gfg
			
			},
			createHeatReturns: function(data, start_date, end_date){
				start_date = new Date(start_date)
				end_date = new Date(end_date)
				data = data.map((m) => {m.date = new Date(m.month); return m}).filter((d) => {return ((d.date) >= start_date) & ((d.date) <= end_date)})
				data.sort((a, b) => {return a.date - b.date})
				console.log(data)

				let selectedDates = _.groupBy(data, (item) => {
					return item.month
				})
				
				_.forEach(selectedDates, (v, k) => {
					selectedDates[k] = { name: k,
						data: [{x: 'MAX AVG SENTIMENT', y: _.maxBy(v, 'comp_sent_avg').comp_sent_avg, z: _.maxBy(v, 'comp_sent_avg').symbol},
					{x: 'MIN AVG SENTIMENT', y: _.minBy(v, 'comp_sent_avg').comp_sent_avg, z: _.minBy(v, 'comp_sent_avg').symbol},
					{x: 'MAX POS SENTIMENT', y: _.maxBy(v, 'pos_sent_avg').pos_sent_avg, z: _.maxBy(v, 'pos_sent_avg').symbol},
					{x: 'MAX NEG SENTIMENT', y: _.maxBy(v, 'neg_sent_avg').neg_sent_avg, z: _.minBy(v, 'neg_sent_avg').symbol},
					{x: 'MOST ARTICLES', y: _.maxBy(v, 'article_count').article_count, z: _.maxBy(v, 'article_count').symbol},
					{x: 'MOST ENGAGED', y: _.maxBy(v, 'engagement').engagement, z: _.maxBy(v, 'engagement').symbol},
				]
				}})

				let gfg = _.sortBy(selectedDates, (d, i) => {
					return new Date(i)
				})
				
				return gfg
			},
			createBar: function(data, data_2){
				// data
				this.chartOptionsBar.xaxis.categories = data.columns;
				this.chartOptionsBarNews.xaxis.categories = data.columns;
				this.seriesBar[0].data = data.data[2]; // Positive
				this.seriesBar[1].data  = data.data[1]; // Neutral
				this.seriesBar[2].data  = data.data[0]; // Negative
				this.seriesBarNews[0].data = data_2.data[2];
				this.seriesBarNews[1].data = data_2.data[1];
				this.seriesBarNews[2].data = data_2.data[0];

			}
		},
	});

})();
