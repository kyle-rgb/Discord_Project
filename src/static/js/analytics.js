
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
