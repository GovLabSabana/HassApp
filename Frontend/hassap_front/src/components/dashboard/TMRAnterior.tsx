import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  LineChart,
  Line as ReLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
} from "recharts";
import "../../componentsStyles/Metricas.css";

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
  const [exportData, setExportData] = useState({
    totalMes: 0,
    cambioMensual: 0,
    ultimosPedidos: [],
    trm: { valor: 0, cambio: 0 },
    chartData: [],
  });
  const [chartReady, setChartReady] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [trmHistorico, setTrmHistorico] = useState<
    { date: string; close: number }[]
  >([]);
  const [usdCop, setUsdCop] = useState<number | null>(null);
  const AV_API_KEY = import.meta.env.VITE_ALPHA_KEY;

  useEffect(() => {
    fetchTRM();
    fetchTRMHistorico();
    fetchUSDCOP();
  }, []);

  const fetchTRMHistorico = async () => {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=COP&apikey=${AV_API_KEY}`
    );
    const data = await res.json();
    const raw = data["Time Series FX (Daily)"];
    const arr = Object.entries(raw)
      .slice(0, 60)
      .reverse()
      .map(([date, vals]) => ({
        date,
        close: parseFloat(vals["4. close"]),
      }));
    setTrmHistorico(arr);
  };

  const fetchUSDCOP = async () => {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=COP&apikey=${AV_API_KEY}`
    );
    const json = await res.json();
    const rate = parseFloat(
      json["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
    );
    setUsdCop(rate);
  };

  const fetchTRM = async () => {
    try {
      const urltrm =
        "https://www.larepublica.co/indicadores-economicos/mercado-cambiario/dolar";
      const response = await fetch(
        "https://api.allorigins.win/get?url=" + encodeURIComponent(urltrm)
      );
      const data = await response.json();

      if (!data.contents)
        throw new Error("No se recibió contenido de la página");

      const html = data.contents;
      const match = html.match(
        /<span class="price">\s*\$?\s*([0-9.,]+)\s*<\/span>/i
      );

      if (!match) throw new Error("No se encontró el valor del TRM");

      const valorLimpio = match[1].replace(/\./g, "").replace(",", ".");
      const trmActual = parseFloat(valorLimpio);

      if (isNaN(trmActual) || trmActual < 1000)
        throw new Error("Valor TRM no válido");

      let cambioPercentual = 0;
      const cambioMatch = html.match(
        /<span class="variacion (?:positivo|negativo)">\s*([+-]?[0-9.,]+)%/i
      );
      if (cambioMatch) {
        cambioPercentual = parseFloat(cambioMatch[1].replace(",", "."));
      }

      setExportData((prev) => ({
        ...prev,
        trm: {
          valor: trmActual,
          cambio: cambioPercentual || 0,
        },
      }));
    } catch (error) {
      console.error("Error obteniendo TRM:", error.message);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatTRM = (value) =>
    new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
      <div className="metrics-grid">
        {/* Card TRM Hoy */}
        <div className="metric-card trm-card">
          <div className="metric-header">
            <div>
              <div className="metric-title">TRM Hoy</div>
              <div className="trm-value">
                ${formatTRM(exportData.trm.valor)}
              </div>
              <div
                className={`trm-change ${
                  exportData.trm.cambio >= 0 ? "positive" : "negative"
                }`}
              >
                {exportData.trm.cambio >= 0 ? "+" : ""}
                {exportData.trm.cambio.toFixed(2)}%
              </div>
            </div>
            <div className="trm-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C14.24 4.42 12.12 4.26 10.1 4.72C8.08 5.18 6.23 6.24 4.81 7.75C3.39 9.26 2.5 11.15 2.26 13.16C2.02 15.17 2.44 17.19 3.47 18.93L5.1 18.1C4.28 16.71 3.95 15.09 4.16 13.49C4.37 11.89 5.09 10.39 6.22 9.22C7.35 8.05 8.83 7.27 10.43 7.01C12.03 6.75 13.65 7.03 15.07 7.8L12.5 10.37L14 11.87L21 9Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card TRM 2 meses */}
        {trmHistorico.length > 0 && (
          <div className="metric-card">
            <div className="metric-title">Valor TRM (últimos 2 meses, COP)</div>
            <div
              className="chart-container"
              style={{ height: "250px", marginTop: "1rem" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trmHistorico}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(tick) => tick.slice(5)}
                  />
                  <YAxis
                    tickFormatter={(v) => Intl.NumberFormat("es-CO").format(v)}
                  />
                  <ReTooltip
                    formatter={(v) => {
                      const num =
                        typeof v === "number" ? v : parseFloat(v as string);
                      return Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(num);
                    }}
                  />
                  <ReLine
                    type="monotone"
                    dataKey="close"
                    stroke="#8884d8"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Card USD Hoy */}
        <div className="metric-card">
          <div className="metric-header">
            <div>
              <div className="metric-title">USD → COP (hoy)</div>
              <div className="metric-value">
                {usdCop ? formatCurrency(usdCop) : "Cargando..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
