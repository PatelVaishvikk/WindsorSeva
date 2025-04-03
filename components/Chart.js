// components/Chart.js
import { useEffect } from 'react';
import Chart from 'chart.js/auto';

export default function ChartComponent({ data, options, id }) {
    useEffect(() => {
        const ctx = document.getElementById(id).getContext('2d');
        new Chart(ctx, { type: 'line', data, options });
    }, [data, options, id]);

    return <canvas id={id}></canvas>;
}
