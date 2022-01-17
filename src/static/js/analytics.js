
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
        mode: "number+delta",
        value: 15,
        domain: { row: 0, column: 0},
        title: {text: "Unique Analysts"},
        delta: { reference: 12 },
    },
    {
        type: "indicator",
        mode: "delta",
        value: 1,
        domain: { row: 0, column: 1},
        title: {text: "Upgrades"},
        delta: { reference: 0 },
    },
    {
      type: "indicator",
      mode: "number+gauge+delta",
      gauge: { shape: "bullet" },
      delta: { reference: 200 },
      value: 220,

      domain: { row: 0, column: 3},
      title: { text: "Avg. Analyst Rating" },
      
    }
  ];
  
  var layout_1 = { width: 1200, height: 250,grid: { rows: 1, columns: 4, pattern: "independent" }, title: {text: "Instituitonal Analysts"}, paper_bgcolor: "transparent", font: {color: "#FFFFFF"},};

  
Plotly.newPlot('analystDiv', data_1, layout_1);


let firms = [];
let grades = {};
let starting_analysts = {};

rec.forEach((r) => {
  r.Date = new Date(r.Date)
  // Firm, Action, Date, new_grade, prev_grade
  if((firms.filter((d) => {return d.firm == r.Firm})).length == 0){
    firms.push({firm: r.Firm, entries: [{
      action: r.Action,
      date: r.Date,
      new_grade: r.new_grade,
      prev_grade: r.prev_grade,
    }]
  })
  } else {
      firms.filter((d) => {return d.firm == r.Firm})[0].entries.push({
        action: r.Action,
        date: r.Date,
        new_grade: r.new_grade,
        prev_grade: r.prev_grade,
      })
    }
  if (r.Action == 'up' | r.Action == 'down'){
    if (Object.keys(grades).includes(r.Action)){
      grades[r.Action]++
    } else{
      grades[r.Action] = 1
    }
  }

  }

)

firms = firms.filter((d) => {return  d.entries = d.entries.slice(-1)})
firms.forEach((f) => {
  if (Object.keys(starting_analysts).includes(f.entries[0].new_grade)){
    starting_analysts[f.entries[0].new_grade]++
  } else{
    starting_analysts[f.entries[0].new_grade] = 1
  }
})

// count of unique analysts
// firms.length
// grades at the end of 2019

// grades at the end of 2020

// # of downgrades and upgrades