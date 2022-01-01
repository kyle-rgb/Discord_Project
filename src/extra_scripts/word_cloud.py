import chart_studio.plotly as py
from plotly.offline import init_notebook_mode, iplot
import plotly.graph_objs as go
import plotly.express as px

# matplotlib library
import pandas as pd
import random





def Word_Cloud(): 

    # w_freq = pd.read_csv('wordyfreq.csv')
    h_freq = pd.read_csv('allDataDF2.csv')

    weights = [random.randint(1, 50) for i in range(len(h_freq.mentionedStocks.value_counts()))]
    data = go.Scatter(x=[random.random() for i in range(20)],
                    y=[random.random() for i in range(20)],
                    mode='text',
                    text=h_freq.mentionedStocks.unique(),
                    marker={'opacity': 0.3},
                    textfont={'size': weights,
                            'color': [
        "#636EFA","#EF553B","#00CC96","#AB63FA","#19D3F3",
        "#E763FA", "#FECB52","#FFA15A","#FF6692","#B6E880", "teal"
    ]})
    layout = go.Layout({'xaxis': {'showgrid': False, 'showticklabels': False, 'zeroline': False},
                        'yaxis': {'showgrid': False, 'showticklabels': False, 'zeroline': False}})
    fig = go.Figure(data=[data], layout=layout)
    fig.update_layout(
    title="Requested Stock Info",
    yaxis_title=f"Most Talked About",
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)'
    )

    fig.write_html('templates/word.html')
    h_freq = pd.read_csv('allDataDF2.csv')
    fig = px.histogram(h_freq, x="enhancedSentiment")
    fig.update_layout(
    title="Requested Stock Info",
    yaxis_title=f"Most Talked About",
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)'
    )
    fig.write_html('templates/hword.html')


   

