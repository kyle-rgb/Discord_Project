
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

// firms = firms.filter((d) => {return  d.entries = d.entries.slice(-1)})
// nineteen_grades = prefirms.map(f=> {return f.new_grade})


// count of unique analysts

// (pre|post)firms.length

// up/downgrades at the end of 2019

// pregrades.up && pregrades.down

// up/downgrades at the end of 2020

// postgrades.up && postgrades.down

// # of downgrades and upgrades
// starting_analysts

var data = [
    {
        type: "indicator",
        mode: "number+delta",
        value: 300,
        domain: { row: 0, column: 0},
        title: {text: "Articles Written"},
      },
    {
      type: "indicator",
      value: 75,
      delta: { reference: 50 },
      gauge: { axis: { visible: true, range: [0, 100] } },
      domain: { row: 0, column: 1 },
      title: {text: "Avg. Story Sentiment"}
    },
  ];
  
var layout = {
    width: 1200,
    height: 400,
    paper_bgcolor: "transparent",
    title: "News Organizations",
    margin: { t: 75, b: 75, l: 25, r: 50 },
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

Plotly.newPlot('newsDiv', data, layout);

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

