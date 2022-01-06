names = []
counts = []
pics = []
colors = []
borders = []
codes = []

emoji_data.forEach(e => {
    names.push(e.unicode_name.replace(/:/g, "").replace(/_/g, " "))
    counts.push(+e.count)
    pics.push(e.emote)
    _c = `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, .4)`
    borders.push(_c.replace(/\.\d+/, "1"))
    colors.push(_c)
    codes.push("../static/img/emotes/emoji_" + e.code.toLowerCase().replace("+", "") + ".svg")

})


// id = #chart1

var data_2 = {
    labels: names, // emote names
    datasets: [{
        label: 'Frequency',
        data: counts,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 2,
    }]
}

var ctx = document.getElementById('myChart')
image_array = []
for (c of codes){
    const img = new Image();
    img.src = c;
    image_array.push(img)
}





const barAvatar = {
    id: 'barAvatar',
    beforeDraw(chart, args, options){
        const {ctx, chartArea: {top, bottom, left, right, width, height}, scales: {x, y}} = chart;
        ctx.save()
        
        for (let i=0; i<codes.length;i++){
            ctx.drawImage(image_array[i], x.getPixelForValue(i)-15, y.getPixelForValue(counts[i])-32, 30, 30)
        }
        

    }
}
var config = {
    type: 'bar',
    data: data_2,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            title: {
                display: true,
                text: "Emote Frequency",
                color: "gold",
                fullSize: true,
                font: {
                    size: 45,
                    family: "Baloo Bhaijaan"
                }
            }
        }
        
    },
    plugins: [barAvatar]
}



const myChart = new Chart(ctx, config)


























