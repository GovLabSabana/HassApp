import type { ChartOptions } from "chart.js";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CartesianGrid,
  LineChart,
  Legend as ReLegend,
  Line as ReLine,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../../componentsStyles/Metricas.css";
import "../../componentsStyles/dashboard/Export.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = import.meta.env.VITE_API_URL;

export default function MiExportacion() {
  const [loading, setLoading] = useState(true);
  const [exportData, setExportData] = useState({
    totalMes: 0,
    cambioMensual: 0,
    ultimosPedidos: [],
    trm: { valor: 0, cambio: 0 },
    chartData: [],
  });
  const [chartReady, setChartReady] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    fetchExportData();
    fetchHistoricalData();
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

  const fetchHistoricalData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(
        `${API_URL}/estadisticas/exportaciones/linea-tiempo`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Error al cargar exportaciones");
      const json = await res.json();
      const parsed = json.map((item) => ({
        mes: item.mes,
        valor_fob: parseFloat(item.valor_fob),
        toneladas: parseFloat(item.toneladas),
      }));
      setHistoricalData(parsed);
    } catch (error) {
      console.error("Error exportaciones:", error);
    }
  };

  const processExportData = (exportaciones) => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const mesAnterior = mesActual - 1;

    const exportsMesActual = exportaciones.filter(
      (exp) => new Date(exp.fecha).getMonth() === mesActual
    );
    const exportsMesAnterior = exportaciones.filter(
      (exp) => new Date(exp.fecha).getMonth() === mesAnterior
    );

    const totalMesActual = exportsMesActual.reduce(
      (sum, exp) => sum + parseFloat(exp.valor_fob),
      0
    );
    const totalMesAnterior = exportsMesAnterior.reduce(
      (sum, exp) => sum + parseFloat(exp.valor_fob),
      0
    );

    const cambioMensual =
      totalMesAnterior > 0
        ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100
        : 0;

    const chartData = generateChartData(exportaciones);
    const ultimosPedidos = exportaciones.slice(-5).reverse();

    setExportData((prev) => ({
      ...prev,
      totalMes: totalMesActual,
      cambioMensual,
      ultimosPedidos,
      chartData,
    }));

    setTimeout(() => setChartReady(true), 100);
  };

  const generateChartData = (exportaciones) => {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const ahora = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mes = fecha.getMonth();
      const año = fecha.getFullYear();

      const exportsMes = exportaciones.filter((exp) => {
        const fechaExp = new Date(exp.fecha);
        return fechaExp.getMonth() === mes && fechaExp.getFullYear() === año;
      });

      const totalMes = exportsMes.reduce(
        (sum, exp) => sum + parseFloat(exp.valor_fob),
        0
      );

      data.push({
        mes: meses[mes],
        valor: totalMes / 1000000,
      });
    }

    return data;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const lineChartData = {
    labels: exportData.chartData.map((d) => d.mes),
    datasets: [
      {
        label: "Exportaciones (Millones USD)",
        data: exportData.chartData.map((d) => d.valor),
        borderColor: "rgba(72, 187, 120, 1)",
        backgroundColor: "rgba(72, 187, 120, 0.1)",
        pointBackgroundColor: "rgba(72, 187, 120, 1)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${formatCurrency(context.parsed.y * 1000000)}`,
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(72, 187, 120, 1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: "#64748b",
          font: { size: 12, weight: 500 },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Millones USD",
          color: "#64748b",
          font: { size: 12, weight: 600 },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          lineWidth: 1,
        },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="export-metrics">
      <h3 className="metrics-subtitle">Mi Exportación</h3>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div className="export-metrics-top">
          {/* Card Exportaciones del Mes */}
          <div className="metric-card" style={{ flex: 1 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <div className="metric-title">Exportaciones del Mes(USD)</div>
                <div className="metric-value">
                  {formatCurrency(exportData.totalMes)}
                </div>
                <div
                  className={`metric-change ${
                    exportData.cambioMensual >= 0 ? "positive" : "negative"
                  }`}
                >
                  {exportData.cambioMensual >= 0 ? "+" : ""}
                  {exportData.cambioMensual.toFixed(1)}%
                </div>
              </div>
              <div className="chart-container">
                {chartReady && exportData.chartData.length > 0 ? (
                  <Line
                    data={lineChartData}
                    options={lineChartOptions}
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

          {/* Card Últimos Pedidos */}
          <div className="metric-card" style={{ flex: 1 }}>
            <div className="metric-title">Últimos Pedidos de Exportación</div>
            <div className="export-list">
              {exportData.ultimosPedidos.length > 0 ? (
                exportData.ultimosPedidos.map((pedido) => (
                  <div key={pedido.id} className="export-item">
                    <div>
                      <div className="export-client">{pedido.comprador}</div>
                      <div className="export-details">
                        {pedido.toneladas}T -{" "}
                        {new Date(pedido.fecha).toLocaleDateString("es-CO")}
                      </div>
                    </div>
                    <div className="export-amount">
                      {formatCurrency(pedido.valor_fob || pedido.valor || 0)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No hay pedidos recientes</div>
              )}
            </div>
          </div>
        </div>

        {/* Card Histórico Exportaciones */}
        <div className="metric-card">
          <div className="metric-header">
            <div>
              <div className="metric-title">
                Agregado histórico de exportaciones - Asociados
              </div>
              <div className="metric-value">Valores históricos</div>
              <div className="metric-change positive">Datos actualizados</div>
            </div>
          </div>
          <div
            className="chart-container"
            style={{ height: "300px", marginTop: "1rem" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.2)"
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  label={{
                    value: "FOB ($)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  label={{
                    value: "Toneladas",
                    angle: -90,
                    position: "insideRight",
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                />
                <ReTooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    borderRadius: "8px",
                    border: "1px solid #48bb78",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                  itemStyle={{ color: "#ffffff" }}
                  formatter={(value, name) => [
                    `${Intl.NumberFormat("es-CO").format(Number(value))}`,
                    name,
                  ]}
                />
                <ReLegend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
                <ReLine
                  yAxisId="left"
                  type="monotone"
                  dataKey="valor_fob"
                  stroke="#48bb78"
                  strokeWidth={3}
                  dot={{
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: "#48bb78",
                    r: 6,
                  }}
                  activeDot={{ r: 8 }}
                  name="Valor FOB"
                />
                <ReLine
                  yAxisId="right"
                  type="monotone"
                  dataKey="toneladas"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: "#667eea",
                    r: 6,
                  }}
                  activeDot={{ r: 8 }}
                  name="Toneladas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
