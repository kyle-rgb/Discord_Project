names = []
counts = []
pics = []
colors = []
borders = []
codes = []

pop_emote.forEach(e => {
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
                beginAtZero: true,
            },
            
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
            },
        }
        
    },
    plugins: [barAvatar]
}

Chart.defaults.color = "#fff";
const myChart = new Chart(ctx, config)

var color = d3.scaleSequential([9, 0], d3.interpolateMagma)
let format = d3.format(",d")
let height = 500
let width = 1000
let treemap = data => d3.treemap().size([width, height])
    .paddingOuter(3)
    .paddingTop(19)
    .paddingInner(1)
    .round(true)
    (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))


company_info.map((c) => {
    if (c.industry === ''){
        if (c.symbol === 'BTC-USD'){
            c.sector = 'Other';
            c.industry = 'Currency';
        } else {
            c.industry = c.sector;
            c.sector = 'Other';
        }
    }
})

let prelim = _.groupBy(company_info, d=>d.sector)

Object.entries(prelim).map((d, i) => {
    prelim[d[0]] = _.groupBy(d[1], d=>d.industry)
})



let chart_obj = {name: 'Securities', children: []};

Object.entries(prelim).map((d, i)=>{
    chart_obj.children.push({name: d[0], children: Object.entries(d[1]).map((dx, ix) => {return {name: dx[0], children: dx[1]}})})
})

console.log('+'.repeat(20))
console.log(chart_obj)
console.log('+'.repeat(20))

function new_chart(data) {
    const root = treemap(data);
      
    const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .style("font", "10px sans-serif");
      
    const shadow = uid("shadow");
      
    svg.append("filter")
            .attr("id", shadow.id)
          .append("feDropShadow")
            .attr("dx", 0);
      
    const node = svg.selectAll("g")
          .data(d3.group(root, d => d.height))
          .join("g")
            .attr("filter", shadow)
          .selectAll("g")
          .data(d => d[1])
          .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
      
    node.append("title")
            .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${format(d.value)}`);
      
    node.append("rect")
            .attr("id", d => (d.nodeUid = uid("node")).id)
            .attr("fill", d => color(d.height))
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);
      
    node.append("clipPath")
            .attr("id", d => (d.clipUid = uid("clip")).id)
          .append("use")
            .attr("xlink:href", d => d.nodeUid.href);
      
    node.append("text")
            .attr("clip-path", d => d.clipUid)
          .selectAll("tspan")
          .data(d =>{return d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(d.value))})
          .join("tspan")
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .text(d => d);
      
    node.filter(d => d.children).selectAll("tspan")
            .attr("dx", 3)
            .attr("y", 13);
      
    node.filter(d => !d.children).selectAll("tspan")
            .attr("x", 3)
            .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`);
      
    return svg.node();
}


var count = 0;

 function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function() {
  return "url(" + this.href + ")";
};

let nested_node = new_chart(chart_obj)

d3.select('#nestedTM').append(() => {return nested_node})

















