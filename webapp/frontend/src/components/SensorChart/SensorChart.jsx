import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './SensorChart.css';
import DatePicker from '../DatePicker/DatePicker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SensorChart = ({ historicalData, startDate, endDate, onTimeRangeChange }) => {
  const [localTimeRange, setLocalTimeRange] = useState({
    startDate,
    endDate
  });

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Обработчик изменения даты
  const handleDateChange = (type, date) => {
    const newTimeRange = {
      ...localTimeRange,
      [type]: date
    };
    setLocalTimeRange(newTimeRange);
    
    // Если обе даты выбраны, обновляем данные
    if (newTimeRange.startDate && newTimeRange.endDate) {
      onTimeRangeChange(newTimeRange.startDate, newTimeRange.endDate);
    }
  };

  // Подготовка данных для графика (только влажность и свет)
  const chartData = {
    labels: historicalData?.humidity?.map(item => formatDate(item.timestamp)) || [],
    datasets: [
      {
        label: 'Humidity (%)',
        data: historicalData?.humidity?.map(item => item.value) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 3
      },
      {
        label: 'Light Level',
        data: historicalData?.light?.map(item => item.value) || [],
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: historicalData 
          ? `График показателей с ${localTimeRange.startDate.toLocaleDateString()} по ${localTimeRange.endDate.toLocaleDateString()}`
          : 'Загрузка данных...',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <div className="sensor-chart-container">
      <div className="chart-controls">
        <DatePicker
          selected={localTimeRange.startDate}
          onChange={(date) => handleDateChange('startDate', date)}
          selectsStart
          startDate={localTimeRange.startDate}
          endDate={localTimeRange.endDate}
          maxDate={localTimeRange.endDate}
          placeholderText="Начальная дата"
        />
        <DatePicker
          selected={localTimeRange.endDate}
          onChange={(date) => handleDateChange('endDate', date)}
          selectsEnd
          startDate={localTimeRange.startDate}
          endDate={localTimeRange.endDate}
          minDate={localTimeRange.startDate}
          maxDate={new Date()}
          placeholderText="Конечная дата"
        />
      </div>
      
      <div className="sensor-chart">
        {historicalData ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="loading-message">Загрузка данных...</div>
        )}
      </div>
    </div>
  );
};

export default SensorChart;