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
  import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip as ReTooltip,
    Legend as ReLegend,
  } from 'recharts';
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
    const [rendimientoData, setRendimientoData] = useState([]);
    const [cosechasPredioMes, setCosechasPredioMes] = useState([]);
  
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

    useEffect(() => {
      const fetchRendimiento = async () => {
        const token = localStorage.getItem("access_token");
        try {
          const res = await fetch(`${API_URL}/estadisticas/rendimiento-cosecha`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();

            const grouped = {};
            data.forEach(item => {
              const fecha = new Date(item.fecha);
              const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
              const producto = item.producto;

              if (!grouped[mes]) grouped[mes] = {};
              if (!grouped[mes][producto]) grouped[mes][producto] = { toneladas: 0, hectareas: 0 };

              grouped[mes][producto].toneladas += parseFloat(item.toneladas);
              grouped[mes][producto].hectareas += parseFloat(item.hectareas);
            });

            const result = Object.entries(grouped).map(([mes, productos]) => {
              const prodEntries = productos as Record<string, { toneladas: number, hectareas: number }>;
              const entry: Record<string, any> = { mes };
              for (const prod in prodEntries) {
                const { toneladas, hectareas } = prodEntries[prod];
                entry[prod] = hectareas > 0 ? +(toneladas / hectareas).toFixed(2) : 0;
              }
              return entry;
            });

            result.sort((a, b) => a.mes.localeCompare(b.mes));
            setRendimientoData(result);
          }
        } catch (err) {
          console.error("Error al obtener rendimiento de cosechas:", err);
        }
      };

      fetchRendimiento();
    }, []);
  
    const fetchTRM = async () => {
      try {
        const urltrm = 'https://www.larepublica.co/indicadores-economicos/mercado-cambiario/dolar';
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(urltrm));
        const data = await response.json();
    
        if (!data.contents) throw new Error('No se recibió contenido de la página');
    
        const html = data.contents;
    
        // Buscar el valor actual del TRM usando clase 'price'
        const match = html.match(/<span class="price">\s*\$?\s*([0-9.,]+)\s*<\/span>/i);
    
        if (!match) throw new Error('No se encontró el valor del TRM');
    
        const valorLimpio = match[1].replace(/\./g, '').replace(',', '.'); // convertir a formato numérico
        const trmActual = parseFloat(valorLimpio);
    
        if (isNaN(trmActual) || trmActual < 1000) throw new Error('Valor TRM no válido');
    
        // También se puede intentar extraer el cambio porcentual si es necesario
        let cambioPercentual = 0;
        const cambioMatch = html.match(/<span class="variacion (?:positivo|negativo)">\s*([+-]?[0-9.,]+)%/i);
        if (cambioMatch) {
          cambioPercentual = parseFloat(cambioMatch[1].replace(',', '.'));
        }
    
        setExportData(prev => ({
          ...prev,
          trm: {
            valor: trmActual,
            cambio: cambioPercentual || 0
          }
        }));
    
        console.log(`TRM desde La República: $${trmActual.toLocaleString('es-CO')} (${cambioPercentual >= 0 ? '+' : ''}${cambioPercentual.toFixed(2)}%)`);
      } catch (error) {
        console.error('Error obteniendo TRM desde La República:', error.message);
      }
    };

    useEffect(() => {
    const fetchCosechasPorPredio = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${API_URL}/estadisticas/cosechas/ultimo-mes-por-predio`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Convertir a formato numérico
          const parsed = data.map((item) => ({
            predio: item.predio,
            hectareas: parseFloat(item.hectareas),
            toneladas: parseFloat(item.toneladas),
          }));
          setCosechasPredioMes(parsed);
        }
      } catch (error) {
        console.error("Error al obtener datos de cosechas por predio:", error);
      }
    };

    fetchCosechasPorPredio();
  }, []);

    const formatCurrency = (value) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    const formatTRM = (value) =>
      new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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

          {/* Nueva Card de TRM */}
          <div className="metric-card trm-card">
            <div className="metric-header">
              <div>
                <div className="metric-title">TRM Hoy</div>
                <div className="trm-value">${formatTRM(exportData.trm.valor)}</div>
                <div className={`trm-change ${exportData.trm.cambio >= 0 ? 'positive' : 'negative'}`}>
                  {exportData.trm.cambio >= 0 ? '+' : ''}{exportData.trm.cambio.toFixed(2)}%
                </div>
              </div>
              <div className="trm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C14.24 4.42 12.12 4.26 10.1 4.72C8.08 5.18 6.23 6.24 4.81 7.75C3.39 9.26 2.5 11.15 2.26 13.16C2.02 15.17 2.44 17.19 3.47 18.93L5.1 18.1C4.28 16.71 3.95 15.09 4.16 13.49C4.37 11.89 5.09 10.39 6.22 9.22C7.35 8.05 8.83 7.27 10.43 7.01C12.03 6.75 13.65 7.03 15.07 7.8L12.5 10.37L14 11.87L21 9Z" fill="currentColor"/>
                </svg>
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

          {rendimientoData.length > 0 && (
            <div className="metric-card">
              <div className="metric-title">Rendimiento de Cosechas por Producto</div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rendimientoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <ReTooltip />
                    <ReLegend />
                    {Object.keys(rendimientoData[0])
                      .filter(key => key !== "mes")
                      .map((producto, idx) => (
                        <Bar
                          key={producto}
                          dataKey={producto}
                          fill={["#48bb78", "#667eea", "#f6ad55", "#ed64a6"][idx % 4]}
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {cosechasPredioMes.length > 0 && (
            <>
              <div className="metric-card">
                <div className="metric-title">Hectáreas usadas por Predio (Último Mes)</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cosechasPredioMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="predio" />
                      <YAxis />
                      <ReTooltip />
                      <Bar dataKey="hectareas" fill="#63b3ed" name="Hectáreas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-title">Toneladas recolectadas por Predio (Último Mes)</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cosechasPredioMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="predio" />
                      <YAxis />
                      <ReTooltip />
                      <Bar dataKey="toneladas" fill="#f6ad55" name="Toneladas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }