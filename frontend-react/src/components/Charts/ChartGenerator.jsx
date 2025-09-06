import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Task Status Distribution Chart
export const TaskStatusChart = ({ data, width = 400, height = 300 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      
      chartRef.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['To-Do', 'In Progress', 'Completed', 'Overdue'],
          datasets: [{
            data: [
              data.todo || 0,
              data.inProgress || 0,
              data.completed || 0,
              data.overdue || 0
            ],
            backgroundColor: [
              '#6B7280',
              '#3B82F6',
              '#10B981',
              '#EF4444'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Task Status Distribution',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div style={{ width, height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

// Weekly Progress Chart
export const WeeklyProgressChart = ({ data, width = 400, height = 300 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      
      chartRef.current = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => item.day),
          datasets: [
            {
              label: 'Completed',
              data: data.map(item => item.completed),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Created',
              data: data.map(item => item.created),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Weekly Progress',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'top',
              labels: {
                padding: 20,
                font: {
                  size: 12
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div style={{ width, height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

// Project Task Distribution Chart
export const ProjectTaskChart = ({ data, width = 400, height = 300 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      
      chartRef.current = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.project),
          datasets: [{
            label: 'Tasks',
            data: data.map(item => item.tasks),
            backgroundColor: '#3B82F6',
            borderColor: '#1D4ED8',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Tasks by Project',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div style={{ width, height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

// Productivity Score Chart
export const ProductivityScoreChart = ({ score, width = 200, height = 200 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      
      chartRef.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Remaining'],
          datasets: [{
            data: [score, 100 - score],
            backgroundColor: [
              score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444',
              '#E5E7EB'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            title: {
              display: true,
              text: 'Productivity Score',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            legend: {
              display: false
            }
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [score]);

  return (
    <div style={{ width, height, position: 'relative' }}>
      <canvas ref={canvasRef} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '24px',
        fontWeight: 'bold',
        color: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
      }}>
        {score}%
      </div>
    </div>
  );
};
