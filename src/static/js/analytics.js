const average = (array) => array.reduce((a, b)=> a+b ) / array.length
let prefirms = [];
let postfirms =[];
let pregrades = {};
let postgrades = {};
let starting_date = new Date('2020-01-01');
let prestart_date = new Date('2019-01-01');
let stop_date = new Date('2021-01-01')
let sentiment_colors = {
  "Bullish": '#3D9970',
  "Very Bullish": '#00521B',
  "Neutral": '#FFEF00',
  "Bearish": '#FF4136',
  "Very Bearish":'#940A00',
}





function reducer(list){
  var reduced = {};
  for (l of list){
    if (!Object.keys(reduced).includes(l)){
      reduced[l] = 1
    } else {
      reduced[l]++
    }
  }
  return reduced;
}




rec.forEach((r) => {
  r.Date = new Date(r.Date)
  // Firm, Action, Date, new_grade, prev_grade
  if ((r.Date >= prestart_date) & (r.Date < starting_date) & (prefirms.filter(d => {return d.firm === r.Firm}).length == 0)){
    prefirms.push({
      firm: r.Firm,
      action: r.Action,
      new_grade: r.new_grade,
      prev_grade: r.prev_grade,
      date: r.Date,
    })
    Object.keys(pregrades).includes(r.Action)? pregrades[r.Action]++ : pregrades[r.Action]=1; 
  } else if ((r.Date >= prestart_date) & (r.Date < starting_date)){
    firm = prefirms.filter(d => {return d.firm === r.Firm})
    firm.action = r.Action
    firm.new_grade = r.new_grade
    firm.prev_grade = r.prev_grade
    firm.date = r.Date
    Object.keys(pregrades).includes(r.Action)? pregrades[r.Action]++ : pregrades[r.Action]=1; 
    } else if ((r.Date >= starting_date) & (r.Date < stop_date) & (postfirms.filter(d => {return d.firm === r.Firm}).length == 0)){
      postfirms.push({
        firm: r.Firm,
        action: r.Action,
        new_grade: r.new_grade,
        prev_grade: r.prev_grade,
        date: r.Date,
      })
      Object.keys(postgrades).includes(r.Action)? postgrades[r.Action]++ : postgrades[r.Action]=1; 
    } else if ((r.Date >= starting_date) & (r.Date < stop_date)){
      firm = postfirms.filter(d => {return d.firm === r.Firm})
      firm.action = r.Action
      firm.new_grade = r.new_grade
      firm.prev_grade = r.prev_grade
      firm.date = r.Date
      Object.keys(postgrades).includes(r.Action)? postgrades[r.Action]++ : postgrades[r.Action]=1; 
      }
  }

)

let art_start_date = new Date("2020-05-01")
let art_last_date = new Date("2021-05-01")
let trailing_3m = new Date("2021-02-01")
let comment_quarter_date = new Date("2020-08-01")
let trailing_3mC = new Date("2020-12-10")
let usersSetY = new Set();
let usersSetMo = new Set();

let year_arts = articles.filter((d) => {
  d.date = new Date(d.date)
  if ((d.date <= art_last_date)&(d.date >= art_start_date)){
    return d
  }
})

let month_arts = articles.filter((d) => {
  d.date = new Date(d.date)
  if ((d.date <= art_last_date)&(d.date >= trailing_3m)){
    return d
  }
})

let year_coms = comments.filter((d) => {
  d.timestamp = new Date(d.timestamp);
  usersSetY.add(d.id);
  return d

})

let month_coms = comments.filter((d) => {
  d.timestamp = new Date(d.timestamp);
  if ((d.timestamp <= trailing_3mC)&(d.timestamp >= comment_quarter_date)){
    usersSetMo.add(d.id)
    return d
  }
  

})

var clear_button = d3.select('.btn').text('Show Performance')
clear_button.on('click', (e)=>{
  d3.select('#demobox')._groups[0].innerHTML = ''
  
  // d3.select('#demobox')._groups[0].innerHTML = chart
  var graphic_box = d3.select('#csbox')
  var index_data = (daily_data.map((d)=> {return [new Date(d.Date), d.Close, d.symbol]})).concat(daily_comps.map((d)=> {return [new Date(d.Date), d.Close, d.symbol]}))
  console.log(index_data)
  graphic_box.append(() => {
    return IndexChart(index_data, {
      x: d=> d[0],
      y: d=> d[1],
      z: d=> d[2], 
      yLabel: '↑ Change in price (%)',
      height: 800,
      width: 1000
    })
  })
  //graphic_box.append(() => {
  //   return ChangeLineChart(daily_comps.filter((d)=> {return d.symbol=='VOX'}), {
  //     x: d=> new Date(d.Date),
  //     y: d=> d.Close,
  //     basis: daily_data.map((d)=> {return d.Close})[0],
  //     yLabel: '↑ Change in price (%)',
  //     yDomain: YDomain,
  //     height: 800,
  //     width: 1000,
  //     color: 'red'
  //   })
  // })
  // graphic_box.append(() => {
  //   return ChangeLineChart(daily_comps.filter((d)=> {return d.symbol=='SPY'}), {
  //     x: d=> new Date(d.Date),
  //     y: d=> d.Close,
  //     basis: undefined,
  //     yLabel: '↑ Change in price (%)',
  //     basis: daily_data.map((d)=> {return d.Close})[0],
  //     yDomain: YDomain,
  //     height: 800,
  //     width: 1000,
  //     color: 'green'
  //   })
  // })
  

















})





// Plotly Article Indicators
var data = [
    {
        type: "indicator",
        mode: "number+delta",
        value: year_arts.length,
        domain: { row: 0, column: 0},
        title: {text: "Articles Written"},
      },
    {
      type: "indicator",
      value: (average(year_arts.map((a) =>a.comp_sent))*100).toFixed(2),
      delta: { reference: 50.25 },
      gauge: { axis: { visible: true, range: [0, 100] } },
      domain: { row: 0, column: 1 },
      title: {text: "Avg. Story Sentiment"}
    },
  ];
  
var layout = {
    paper_bgcolor: "transparent",
    title: "Yearly News Totals",
    margin: { t: 50, b: 75, l: 25, r: 50 },
    font: {color: "#FFFFFF"},
    grid: { rows: 1, columns: 2, pattern: "independent" },
    template: {
      data: {
        indicator: [
          {
            mode: "number+delta+gauge",
            delta: { reference: 100 }
          }
        ]
      }
    }
  };

  var data_artMo = [
    {
        type: "indicator",
        mode: "number+delta",
        value: month_arts.length,
        domain: { row: 0, column: 0},
        title: {text: "Articles Written"},
      },
    {
      type: "indicator",
      value: (average(month_arts.map((a) =>a.comp_sent))*100).toFixed(2),
      delta: { reference: 50.25 },
      gauge: { axis: { visible: true, range: [0, 100] } },
      domain: { row: 0, column: 1 },
      title: {text: "Avg. Story Sentiment"}
    },
  ];
  
var layout_artMo = {
    paper_bgcolor: "transparent",
    title: "Last 3 Months News Totals",
    margin: { t: 50, b: 25, l: 25, r: 50 },
    font: {color: "#FFFFFF"},
    grid: { rows: 1, columns: 2, pattern: "independent" },
    template: {
      data: {
        indicator: [
          {
            mode: "number+delta+gauge",
            delta: { reference: 30 }
          }
        ]
      }
    }
  };




Plotly.newPlot('newsDiv', data, layout);
Plotly.newPlot('newsDiv2', data_artMo, layout_artMo);

// Plotly Comment Indicators
var dataChat = [
  {
      type: "indicator",
      mode: "number+delta",
      value: usersSetY.size,
      domain: { row: 0, column: 0},
      title: {text: "Unique Users"},
    },
    {
      type: "indicator",
      mode: "number+delta",
      value: year_coms.length,
      domain: { row: 0, column:1},
      title: {text: "Unique Mentions"},
    },
  {
    type: "indicator",
    value: (average(year_coms.map((a) =>a.comp_sent))*100).toFixed(2),
    delta: { reference: comp_sent_avg * 100 },
    gauge: { axis: { visible: true, range: [0, 100] } },
    domain: { row: 0, column: 2 },
    title: {text: "Avg. Mention Sentiment"}
  },


];

var layoutChat = {
  paper_bgcolor: "transparent",
  title: "Private Chat Sentiment",
  margin: { t: 50, b: 75, l: 25, r: 50 },
  font: {color: "#FFFFFF"},
  grid: { rows: 1, columns: 3, pattern: "independent" },
  template: {
    data: {
      indicator: [
        {
          mode: "number+delta+gauge",
          delta: { reference: 10 }
        }
      ]
    }
  }
};

var dataChatQ = [
  {
      type: "indicator",
      mode: "number+delta",
      value: usersSetMo.size,
      domain: { row: 0, column: 0},
      delta: {reference: usersSetY.size},
      title: {text: "Unique Users"},
    },
    {
      type: "indicator",
      mode: "number+delta",
      value: month_coms.length,
      domain: { row: 0, column:1},
      delta: {reference: year_coms.length},
      title: {text: "Unique Mentions"},
    },
  {
    type: "indicator",
    value: (average(month_coms.map((a) =>a.comp_sent))*100).toFixed(2),
    delta: { reference: (average(year_coms.map((a) =>a.comp_sent))*100) },
    gauge: { axis: { visible: true, range: [0, 100] } },
    domain: { row: 0, column: 2 },
    title: {text: "Avg. Mention Sentiment"}
  },


];

var layoutChatQ = {
  paper_bgcolor: "transparent",
  title: "Trailing 3 Months",
  margin: { t: 50, b: 75, l: 25, r: 50 },
  font: {color: "#FFFFFF"},
  grid: { rows: 1, columns: 3, pattern: "independent" },
  template: {
    data: {
      indicator: [
        {
          mode: "number+delta+gauge",
          delta: { reference: (average(year_coms.map((a) =>a.comp_sent))*100) }
        }
      ]
    }
  }
};

Plotly.newPlot('chatDiv', dataChat, layoutChat);
Plotly.newPlot('chatDiv2', dataChatQ, layoutChatQ);


// Plotly Analyst Sentiment
var data_1 = [
    {
        type: "indicator",
        mode: "number",
        
        value: prefirms.length,
        domain: { x: [0, .33], y: [.9, 1]},
        title: {text: "Unique Analysts"},
    },
    {
        type: "indicator",
        mode: "number+delta",
        value: pregrades.up,
        domain:{ x: [0.33, .66], y: [.9, 1]},
        title: {text: "Upgrades"},
        delta: { reference: 0 },
    },
    {
      type: "indicator",
      mode: "number+delta",
      value: pregrades.down,
      domain: { x: [.68, 1], y: [.9, 1]},
      title: {text: "Downgrades"},
      delta: { reference: 0 },
    },
    {
      values: Object.values(reducer(prefirms.map((f) => {return f.new_grade}))),
      labels: Object.keys(reducer(prefirms.map((f) => {return f.new_grade}))),
      domain: {x: [0, 1], y: [0, .85]},
      name: 'Prev. Year',
      hoverinfo: 'label+percent+name',
      hole: .4,
      type: 'pie',
      marker: {
        colors: Object.keys(reducer(prefirms.map((f) => {return f.new_grade}))).map((d) => sentiment_colors[d])
      }
    },
    
  ];
  
  var layout_1 = { width: 600, height: 800, title: {text: "2019 Instituitonal Analysts"}, paper_bgcolor: "transparent", font: {color: "#FFFFFF"}, showlegend: false};

  var data_2 = [
    {
        type: "indicator",
        mode: "number",
        value: postfirms.length,
        domain: { x: [0, .33], y: [.9, 1]},
        title: {text: "Unique Analysts"},
        delta: { reference: prefirms.length},
    },
    {
        type: "indicator",
        mode: "number+delta",
        value: postgrades.up,
        domain:{ x: [0.33, .66], y: [.9, 1]},
        title: {text: "Upgrades"},
        delta: { reference: pregrades.up },
    },
    {
      type: "indicator",
      mode: "number+delta",
      value: postgrades.down,
      domain: { x: [.68, 1], y: [.9, 1]},
      title: {text: "Downgrades"},
      delta: { reference: pregrades.down },
    },
    {
      values: Object.values(reducer(postfirms.map((f) => {return f.new_grade}))),
      labels: Object.keys(reducer(postfirms.map((f) => {return f.new_grade}))),
      domain: {x: [0, 1], y: [0, .85]},
      name: 'Prev. Year',
      hoverinfo: 'label+percent+name',
      hole: .4,
      type: 'pie',
      marker: {
        colors: Object.keys(reducer(postfirms.map((f) => {return f.new_grade}))).map((d) => sentiment_colors[d])
      }
    },
    
  ];
  
  var layout_2 = { width: 600, height: 800, title: {text: "2020 Instituitonal Analysts"}, paper_bgcolor: "transparent", font: {color: "#FFFFFF"}, showlegend: false};
  

  



Plotly.newPlot('analystDiv', data_1, layout_1);
Plotly.newPlot('analystDiv2', data_2, layout_2);

