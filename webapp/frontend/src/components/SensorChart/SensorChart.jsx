import React, { useState, useMemo, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SensorChart = ({ historicalData, startDate, endDate, onTimeRangeChange }) => {
  const [localTimeRange, setLocalTimeRange] = useState({
    startDate,
    endDate
  });
  const [activeMetric, setActiveMetric] = useState('humidity'); // humidity | light | temperature
  const [chartType, setChartType] = useState('line'); // line | bar
  const chartRef = useRef(null);

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

  // Вспомогательные функции
  const toLabel = (ts) => ts.replace(' ', 'T'); // локальное время, без 'Z'

  // Данные в БД уже усреднены, дополнительное сглаживание не требуется

  const processed = useMemo(() => {
    if (!historicalData) return null;
    const seriesMap = {
      humidity: historicalData.humidity || [],
      light: historicalData.light || [],
      temperature: historicalData.temperature || []
    };
    const current = seriesMap[activeMetric] || [];
    const labels = current.map((i) => toLabel(i.timestamp));
    const values = current.map((i) => Number(i.value));
    return { labels, values };
  }, [historicalData, activeMetric]);

  // Настройка цветов/единиц под выбранную метрику
  const metricConfig = {
    humidity: { label: 'Влажность (%)', color: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.2)', unit: '%' },
    light: { label: 'Освещённость(Lux)', color: 'rgb(255, 206, 86)', bg: 'rgba(255, 206, 86, 0.2)', unit: '' },
    temperature: { label: 'Температура (°C)', color: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.2)', unit: '°C' }
  };

  const chartData = useMemo(() => ({
    labels: processed?.labels || [],
    datasets: [
      {
        label: metricConfig[activeMetric].label,
        data: processed?.values || [],
        borderColor: metricConfig[activeMetric].color,
        backgroundColor: chartType === 'bar' ? metricConfig[activeMetric].color : 'rgba(0,0,0,0)',
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        spanGaps: true,
        fill: false
      }
    ]
  }), [processed, activeMetric, chartType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: historicalData 
          ? `${metricConfig[activeMetric].label}: ${localTimeRange.startDate.toLocaleDateString()} — ${localTimeRange.endDate.toLocaleDateString()}`
          : 'Загрузка данных...',
        font: {
          size: 18
        }
      },
      tooltip: {
        intersect: false,
        mode: 'nearest',
        callbacks: {
          title: (items) => {
            if (!items || !items.length) return '';
            const label = items[0].label;
            const d = new Date(label);
            return d.toLocaleString();
          },
          label: (item) => {
            const value = item.parsed.y;
            const unit = metricConfig[activeMetric].unit;
            return `${metricConfig[activeMetric].label}: ${value}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0,0,0,0.06)'
        },
        ticks: {
          font: { size: 13 },
          callback: function(value) {
            const label = this.getLabelForValue(value);
            const date = new Date(label);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          },
          maxRotation: 0,
          autoSkip: true
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0,0,0,0.05)',
          borderDash: [4, 4]
        },
        ticks: {
          precision: 0,
          font: { size: 13 }
        }
      }
    }
  };

  // Плагин для непрозрачного фона при экспорте PNG
  const backgroundPlugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  };

  const handleExportPNG = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const canvas = chart.canvas ?? chart.ctx?.canvas;
    if (!canvas) return;
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const ctx = off.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.drawImage(canvas, 0, 0);
    const url = off.toDataURL('image/png');
    const link = document.createElement('a');
    const start = localTimeRange.startDate.toLocaleString().replace(/[/:\s]/g, '-');
    const end = localTimeRange.endDate.toLocaleString().replace(/[/:\s]/g, '-');
    link.download = `${activeMetric}-${start}_to_${end}.png`;
    link.href = url;
    link.click();
  };

  const handleExportCSV = () => {
    if (!processed) return;
    const rows = [];
    processed.labels.forEach((label, idx) => {
      const d = new Date(label);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const HH = String(d.getHours()).padStart(2, '0');
      const MM = String(d.getMinutes()).padStart(2, '0');
      const SS = String(d.getSeconds()).padStart(2, '0');
      const ts = `${yyyy}-${mm}-${dd}:${HH}:${MM}:${SS}`; // требуемый формат дата:время
      const value = processed.values[idx] ?? '';
      rows.push([ts, value].join(','));
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const start = localTimeRange.startDate.toISOString().slice(0,19).replace(/[:T]/g, '-');
    const end = localTimeRange.endDate.toISOString().slice(0,19).replace(/[:T]/g, '-');
    link.href = url;
    link.download = `${activeMetric}-${start}_to_${end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`sensor-chart-container metric-${activeMetric}`}>
      <div className="chart-controls">
        <div className="controls-left">
          <DatePicker
            selected={localTimeRange.startDate}
            onChange={(date) => handleDateChange('startDate', date)}
            selectsStart
            startDate={localTimeRange.startDate}
            endDate={localTimeRange.endDate}
            maxDate={localTimeRange.endDate}
            placeholderText="Начальная дата"
            showTimeSelect={false}
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
            showTimeSelect={false}
          />
        </div>
        <div className="controls-center">
          <div className="metric-toggle" role="tablist">
            <button className={activeMetric === 'humidity' ? 'active' : ''} onClick={() => setActiveMetric('humidity')}>Влажность</button>
            <button className={activeMetric === 'light' ? 'active' : ''} onClick={() => setActiveMetric('light')}>Свет</button>
            <button className={activeMetric === 'temperature' ? 'active' : ''} onClick={() => setActiveMetric('temperature')}>Температура</button>
          </div>
        </div>
        <div className="controls-right">
          <div className="chart-type">
            <label>
              Вид:
              <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="line">Линия</option>
                <option value="bar">Столбцы</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      
      <div className="sensor-chart">
        {historicalData ? (
          chartType === 'bar' ? (
            <Bar ref={chartRef} options={options} data={chartData} plugins={[backgroundPlugin]} />
          ) : (
            <Line ref={chartRef} options={options} data={chartData} plugins={[backgroundPlugin]} />
          )
        ) : (
          <div className="loading-message">Загрузка данных...</div>
        )}
      </div>
      <div className="chart-footer">
        <div className="chart-actions">
          <button type="button" onClick={handleExportPNG}>Экспорт PNG</button>
          <button type="button" onClick={handleExportCSV}>Экспорт CSV</button>
        </div>
      </div>
    </div>
  );
};

export default SensorChart;