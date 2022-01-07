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
								svg.setAttribute('viewBox', '0 0 12 12');
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
									return path;
								})());
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
									path.setAttribute('transform', 'rotate(45 6 6)');
									return path;
								})());
								svg.appendChild((function() {
									var path = document.createElementNS(svgNS, 'path');
									path.setAttribute('d', 'M0 7 L0 5 L12 5 L12 7 Z');
									path.setAttribute('transform', 'rotate(90 6 6)');
									return path;
								})());
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
				console.log(this.wordsText)
				this.wordsTextStr = this.wordsText.join('\n').replace(/,/g, " ");
				return this.wordsText
					// .split(/[\r\n]+/)
					// .map(function(line) {
					// 	return /^(.+)\s+(-?\d+)$/.exec(line);
					// })
					// .filter(function(matched) {
					// 	return matched;
					// })
					// .map(function(matched) {
					// 	var text = matched[1];
					// 	var weight = Number(matched[2]);
					// 	return [text, weight];
					// });
			},
		},
		watch: {
			progress: function(currentProgress, previousProgress) {
				if (previousProgress) {
					this.progressVisible = false;
				}
			},
		},
		created: function() {
			this.generateWordsText();
			this.animation = this.animationItems[5].value;
			this.animationEasing = "linear"//chance.pickone(this.animationEasingValues);
			this.colorItemIndex = 3//chance.integer({min: 0, max: this.colorItems.length - 1});
			this.fontFamily = "Baloo Bhaijaan"//chance.pickone(this.fontFamilyValues);
			this.rotationItemIndex = 1//chance.integer({min: 0, max: this.rotationItems.length - 1});
		},
		methods: {
			generateWordsText: function() {
				words_array = new Array();
				var str = new String();
				
				c_data = c_data.slice(0, 100);
				c_data.map((d) => {if (cos.includes(d.company)) {words_array.push([d.company, +d.counts])}})
				this.wordsText = words_array//.join('\n').replace(',', " ");
				return words_array;

				// this.wordsText = [
				// 	[9, 1, 3],
				// 	[4, 5, 15],
				// 	[2, 5, 15],
				// 	[1, 25, 150],
				// ]
				// 	.reduce(function(returns, item) {
				// 		var weight = item[0];
				// 		var minCount = item[1];
				// 		var maxCount = item[2];
				// 		var count = chance.integer({min: minCount, max: maxCount});
				// 		chance.n(function() {
				// 			var word = chance.word();
				// 			returns.push(word+' '+weight);
				// 		}, count);
				// 		return returns;
				// 	}, [])
				// 	.join('\n');
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
			}
		},
	});

})();
