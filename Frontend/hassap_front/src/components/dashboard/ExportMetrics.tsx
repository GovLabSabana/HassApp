import '../../componentsStyles/Metricas.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  import { useEffect, useState } from 'react';
  
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  export default function MetricasExportacion() {
    const [exportData, setExportData] = useState({
      totalMes: 0,
      cambioMensual: 0,
      ultimosPedidos: [],
      trm: { valor: 0, cambio: 0 },
      chartData: []
    });
    const [chartReady, setChartReady] = useState(false);
  
    useEffect(() => {
      fetchExportData();
      fetchTRM();
    }, []);
  
    const fetchExportData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${API_URL}/exportaciones/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          processExportData(data);
        }
      } catch (err) {
        console.error("Error al obtener datos de exportación:", err);
      }
    };
  
    const processExportData = (exportaciones) => {
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const mesAnterior = mesActual - 1;
  
      const exportsMesActual = exportaciones.filter(exp => new Date(exp.fecha).getMonth() === mesActual);
      const exportsMesAnterior = exportaciones.filter(exp => new Date(exp.fecha).getMonth() === mesAnterior);
  
      const totalMesActual = exportsMesActual.reduce((sum, exp) => sum + parseFloat(exp.valor_fob), 0);
      const totalMesAnterior = exportsMesAnterior.reduce((sum, exp) => sum + parseFloat(exp.valor_fob), 0);
  
      const cambioMensual = totalMesAnterior > 0
        ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100
        : 0;
  
      const chartData = generateChartData(exportaciones);
      const ultimosPedidos = exportaciones.slice(-5).reverse();
  
      setExportData(prev => ({
        ...prev,
        totalMes: totalMesActual,
        cambioMensual,
        ultimosPedidos,
        chartData
      }));
      
      // Activar el gráfico después de que los datos estén listos
      setTimeout(() => setChartReady(true), 100);
    };
  
    const generateChartData = (exportaciones) => {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const ahora = new Date();
      const data = [];
  
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const mes = fecha.getMonth();
        const año = fecha.getFullYear();
  
        const exportsMes = exportaciones.filter(exp => {
          const fechaExp = new Date(exp.fecha);
          return fechaExp.getMonth() === mes && fechaExp.getFullYear() === año;
        });
  
        const totalMes = exportsMes.reduce((sum, exp) => sum + parseFloat(exp.valor_fob), 0);
  
        data.push({
          mes: meses[mes],
          valor: totalMes / 1000000
        });
      }
  
      return data;
    };
  
    const fetchTRM = async () => {
      const trmActual = 4127.50;
      const trmAnterior = 4095.20;
      const cambioTrm = ((trmActual - trmAnterior) / trmAnterior) * 100;
  
      setExportData(prev => ({
        ...prev,
        trm: { valor: trmActual, cambio: cambioTrm }
      }));
    };
  
    const formatCurrency = (value) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
  
    // Datos del gráfico con verificación
    const lineChartData = {
      labels: exportData.chartData.map(d => d.mes),
      datasets: [{
        label: 'Exportaciones (Millones COP)',
        data: exportData.chartData.map(d => d.valor),
        borderColor: 'rgba(72, 187, 120, 1)',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        pointBackgroundColor: 'rgba(72, 187, 120, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        fill: true,
        tension: 0.4, // Curva suave
      }]
    };
  
    const lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: {
          callbacks: {
            label: (context) => `${formatCurrency(context.parsed.y * 1000000)}`
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(72, 187, 120, 1)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Millones COP',
            color: '#64748b',
            font: {
              size: 12,
              weight: '600'
            }
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
            borderDash: [2, 2],
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 11
            }
          }
        }
      },
      elements: {
        point: {
          hoverBorderWidth: 3
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10
        }
      }
    };
  
    return (
      <div className="export-metrics">
        <h3 className="metrics-subtitle">Mis Métricas</h3>
  
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <div>
                <div className="metric-title">Exportaciones del Mes</div>
                <div className="metric-value">{formatCurrency(exportData.totalMes)}</div>
                <div className={`metric-change ${exportData.cambioMensual >= 0 ? 'positive' : 'negative'}`}>
                  {exportData.cambioMensual >= 0 ? '+' : ''}{exportData.cambioMensual.toFixed(1)}%
                </div>
            </div>
            <div className="chart-container">
              {chartReady && exportData.chartData.length > 0 ? (
                <Line 
                  data={lineChartData} 
                  key={`chart-${exportData.chartData.length}`}
                />
              ) : (
                <div className="chart-placeholder">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>
            </div>
          </div>
  
          <div className="metric-card">
            <div className="metric-title">Últimos Pedidos de Exportación</div>
            <div className="export-list">
              {exportData.ultimosPedidos.length > 0 ? (
                exportData.ultimosPedidos.map((pedido) => (
                  <div key={pedido.id} className="export-item">
                    <div>
                      <div className="export-client">{pedido.comprador}</div>
                      <div className="export-details">
                        {pedido.toneladas}T - {new Date(pedido.fecha).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                    <div className="export-amount">{formatCurrency(pedido.valor_fob || pedido.valor || 0)}</div>
                  </div>
                ))
              ) : (
                <div className="no-data">No hay pedidos recientes</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }