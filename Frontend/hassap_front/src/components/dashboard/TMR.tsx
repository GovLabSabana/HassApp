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
import {
  CartesianGrid,
  LineChart,
  Line as ReLine,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
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

export default function TRM() {
  const [exportData, setExportData] = useState({
    totalMes: 0,
    cambioMensual: 0,
    ultimosPedidos: [],
    trm: { valor: 0, cambio: 0 },
    chartData: [],
  });
  const [trmHistorico, setTrmHistorico] = useState<
    { date: string; close: number }[]
  >([]);
  const [usdCop, setUsdCop] = useState<number | null>(null);
  const AV_API_KEY = import.meta.env.VITE_ALPHA_KEY;

  useEffect(() => {
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

  return (
    <>
      <div className="metric-card trm-card">
        <div className="metric-header">
          <div>
            <div className="metric-title">TRM Hoy</div>
            <div className="trm-value">${formatTRM(exportData.trm.valor)}</div>
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
    </>
  );
}
