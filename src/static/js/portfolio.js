(function() {
    // computed: object of run functions / watch: progress f(x) / created: set atrributes and run functions on app creation (use this) / methods to run. @click
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
                options: {
                    chart: {
                      id: 'vuechart-example',
                    },
                    xaxis: {
                      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
                      labels: {style: {colors: 'white'}}
                    }
                  },
                  series: [{
                    name: 'series-1',
                    data: [30, 40, 45, 50, 49, 60, 70, 91]
                  }]
			};
		},
        use: converter,
        components:{
            'apexchart': converter
        }, 
	});
    
})();

