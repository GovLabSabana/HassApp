import { BarChart3, Map, PieChart, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import General from "../components/dashboard/General";
import MiExportacion from "../components/dashboard/MiExportacion";
import MiProduccion from "../components/dashboard/MiProduccion";
import GraficosTorta from "../components/dashboard/PieCharts";
import "../componentsStyles/dashboard/Dashboard.css";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  span?: "span-1" | "span-2" | "span-3";
  height?: "height-64" | "height-80" | "height-96";
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  span = "span-1",
  height = "height-80",
}) => (
  <div className={`chart-card ${span} ${height}`}>
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
    </div>
    <div className="chart-content">{children}</div>
  </div>
);

const PlaceholderChart: React.FC<{
  type: "line" | "bar" | "pie";
  color: string;
}> = ({ type, color }) => {
  const ChartIcon =
    type === "line" ? TrendingUp : type === "bar" ? BarChart3 : PieChart;

  return (
    <div className="placeholder-chart">
      <ChartIcon size={48} className={color} />
      <span>
        Gráfico{" "}
        {type === "line"
          ? "de Línea"
          : type === "bar"
          ? "de Barras"
          : "de Torta"}
      </span>
    </div>
  );
};

const KPICard: React.FC<{
  title: string;
  value: string;
  change: string;
  positive: boolean;
}> = ({ title, value, change, positive }) => (
  <div className="kpi-card">
    <h4 className="kpi-title">{title}</h4>
    <div className="kpi-content">
      <span className="kpi-value">{value}</span>
      <span className={`kpi-change ${positive ? "positive" : "negative"}`}>
        {change}
      </span>
    </div>
  </div>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "Resumen General", icon: BarChart3 },
    { id: "exports", name: "Exportaciones", icon: TrendingUp },
    { id: "production", name: "Producción", icon: Map },
    { id: "analysis", name: "Análisis Sondeo", icon: PieChart },
  ];

  const periods = [
    { value: "week", label: "Última Semana" },
    { value: "month", label: "Último Mes" },
    { value: "quarter", label: "Último Trimestre" },
    { value: "year", label: "Último Año" },
  ];

  return (
    <div className="dashboard">
      {/* Header con pestañas y controles */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <nav className="tabs-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        {/* Contenido de pestañas */}
        {activeTab === "overview" && <General />}

        {activeTab === "exports" && <MiExportacion />}

        {activeTab === "production" && <MiProduccion />}

        {activeTab === "analysis" && (
          <div>
            <h3 className="metrics-subtitle">Analisis</h3>
            <GraficosTorta />
          </div>
        )}
      </main>
    </div>
  );
}
