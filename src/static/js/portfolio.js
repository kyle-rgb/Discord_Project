(function() {
    // computed: object of run functions / watch: progress f(x) / created: set atrributes and run functions on app creation (use this) / methods to run. @click
    var d_ = port.filter((m)=> m.symbol=='PLTR').map((m)=> [new Date(m.Date).getTime(), m.Close])
    
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
                        name: "PLTR"
                    }],
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
                        labels: {style: {colors: 'white'} }
                      },
                    tooltip: {
                        x: {
                          format: 'dd MMM yyyy'
                        }
                        },
                    fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.9,
                          stops: [0, 150]
                        }
                      },
                },
                
                

            }
                
		},
        use: converter,
        components:{
            'apexchart': converter
        }, 
	});
    
})();

