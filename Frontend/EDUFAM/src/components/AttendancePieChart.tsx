import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AttendancePieChartProps {
  percent: number;
}

const AttendancePieChart: React.FC<AttendancePieChartProps> = ({ percent }) => {
  const data = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [percent, 100 - percent],
        backgroundColor: [
          '#43cea2',
          '#e0e0e0',
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div style={{ width: 120, height: 120, margin: '0 auto' }}>
      <Pie data={data} options={{ plugins: { legend: { display: false } } }} />
    </div>
  );
};

export default AttendancePieChart;