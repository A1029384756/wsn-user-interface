import './graph.css';
import { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto'; 

//var notifyCharacteristic;

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
        }
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
        console.log(props.newData.nextTemp);
        if (chartInstance != null && props.newData.nextTemp != null) {
            const d = new Date(Date.now()).toLocaleTimeString();
            
            chartInstance.data.datasets[0].data.push(props.newData.nextTemp);
            chartInstance.data.labels.push(d);
            chartInstance.update();
        }
    }, [props.newData, chartInstance]);

    return (
        <div>
            <canvas className='graph' ref={chartContainer}/>
        </div>
    );
};

export default Graph;