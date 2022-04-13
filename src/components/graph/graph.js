import './graph.css';
import { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto'; 

/**
 * Draws a linear gradient from the top to the bottom of a context
 * Used with a graph to apply a color gradient
 * @param {context} ctx a context to create the gradient with
 * @param {*} area parameters for the context to use when drawing the gradient
 * @returns a linear gradient from the top to the bottom of a context
 */
const createGradient = (ctx, area) => {
    const colorStart = 'rgba(52, 152, 219, 0.5)';
    const colorEnd = 'rgba(231, 76, 60, 0.5)';
  
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
  
    return gradient;        
}

/**
 * Checks to see if a graph exists before drawing a gradient for it
 * @param {context} context a context for the chart to draw the gradient
 * @returns nothing if a chart does not exist, and a gradient if one does
 */
const setGradientColor = (context) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;

    if (!chartArea) {
        return;
    }
    return createGradient(ctx, chartArea);
}

/**
 * A configuration for a chartJS chart. Specifies the user options that
 * dictate the overall look and feel of the chart
 */
const chartConfig = {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Temperature",
                data: [],
                backgroundColor: setGradientColor,
                borderColor: setGradientColor,
                tension: 0.3,
                pointStyle: 'circle',
                pointRadius: 6,
                pointHoverRadius: 10,
                fill: true             
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
};

const Graph = (props) => {
    const chartContainer = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);

    /**
     * Creates a chart instance on the canvas if one does not currently exist
     */
    useEffect(() =>  {
        if (chartContainer && chartContainer.current) {
            try {
                const newChartInstance = new Chart(chartContainer.current, chartConfig);

                setChartInstance(newChartInstance);               
            } catch (error) {
                console.log(error);
                console.log("Graph already exists, not redrawing");
            }
        }
    }, [chartContainer]);

    /**
     * Updates the units to used to graph the temperature data.
     * Can be toggled between Farenheit and Celsius.
     */
    useEffect(() => {
        if (chartInstance != null) {
            var newData = [];

            for (var i = 0; i < chartInstance.data.datasets[0].data.length; i++) {
                var data = chartInstance.data.datasets[0].data[i];

                var dataElement;
    
                if (props.displayUnits === "farenheit") {
                    dataElement = (data * 1.8) + 32;
                } else if (props.displayUnits === "celsius") {
                    dataElement = (data - 32) / 1.8;
                }
                newData.push(dataElement);
            }
    
            chartInstance.data.datasets[0].data = newData;
            chartInstance.update();
        }
    }, [props.displayUnits, chartInstance]);

    /**
     * Updated the graph with new data when added
     */
    useEffect(() => {
        if (chartInstance != null && props.newData.nextTemp != null) {

            const d = new Date(Date.now());

            let timeString = d.getHours().toString() + ':' + d.getMinutes().toString() + ':' + d.getSeconds().toString() + ':' + d.getMilliseconds().toString();

            var chartLength = chartInstance.data.labels.length;
            var maxPoints = props.maxPoints.max;

            if (chartLength - 3 > maxPoints) {
                console.log("CLEAR END BUFFER");
                chartInstance.data.labels.shift();
                chartInstance.data.datasets[0].data.shift();
                chartInstance.scales.x.options.min = chartInstance.data.labels[4];
            } else if (chartLength >= maxPoints) {
                console.log("ADD TO BUFFER");
                chartInstance.scales.x.options.min = chartInstance.data.labels[chartLength - maxPoints + 1];
            }

            chartInstance.data.datasets[0].data.push(props.newData.nextTemp);
            chartInstance.data.labels.push(timeString);    

            chartInstance.update();
        }
        
    }, [props.newData, chartInstance]);

    useEffect(() => {
        if (chartInstance != null) {
            var chartLength = chartInstance.data.labels.length;
            var chartDif = chartLength - props.maxPoints.max;

            console.log(chartDif);

            if (chartDif > 0) {
                chartInstance.data.datasets[0].data = chartInstance.data.datasets[0].data.slice(chartDif);
                chartInstance.data.labels = chartInstance.data.labels.slice(chartDif);
                chartInstance.scales.x.options.min = chartInstance.data.labels[0];
                chartInstance.update();
            }     
        }
    }, [props.maxPoints]);

    return (
        <div className='graph-container'>
            <canvas className='graph' ref={chartContainer}/>
        </div>
    );
};

export default Graph;