import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Map,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";
import "./dashboard.css";
import GraficosTorta from "../components/dashboard/PieCharts";
import MiProduccion from "../components/dashboard/MiProduccion";
import MiExportacion from "../components/dashboard/MiExportacion";
import TRM from "../components/dashboard/TMR";

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

export default function DashboardTwo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const tabs = [
    { id: "overview", name: "Resumen General", icon: BarChart3 },
    { id: "exports", name: "Exportaciones", icon: TrendingUp },
    { id: "production", name: "Producción", icon: Map },
    { id: "analysis", name: "Análisis Detallado", icon: PieChart },
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
            <h1 className="dashboard-title">Dashboard Agrícola</h1>
          </div>

          <div className="header-right">
            <div className="period-selector">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-select"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="period-chevron" size={16} />
            </div>

            <button className="filter-button">
              <Filter size={16} />
              <span>Filtros</span>
            </button>
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
        {/* KPIs Row */}
        <div className="kpis-grid">
          <KPICard
            title="Producción Total"
            value="1,847 T"
            change="+12.3%"
            positive
          />
          <KPICard
            title="Exportaciones FOB"
            value="$2.1M"
            change="+8.7%"
            positive
          />
          <KPICard
            title="Hectáreas Activas"
            value="234 Ha"
            change="-2.1%"
            positive={false}
          />
          <KPICard title="Eficiencia" value="94.2%" change="+3.4%" positive />
          <TRM />
        </div>

        {/* Contenido de pestañas */}
        {activeTab === "overview" && (
          <div className="charts-grid">
            <ChartCard
              title="Exportaciones Mensuales"
              subtitle="Tendencia de los últimos 12 meses"
              span="span-2"
            >
              <PlaceholderChart type="line" color="text-blue-500" />
            </ChartCard>

            <ChartCard
              title="Producción por Producto"
              subtitle="Distribución actual"
            >
              <PlaceholderChart type="pie" color="text-green-500" />
            </ChartCard>

            <ChartCard title="Hectáreas por Predio" subtitle="Último mes">
              <PlaceholderChart type="bar" color="text-purple-500" />
            </ChartCard>

            <ChartCard
              title="Toneladas Recolectadas"
              subtitle="Por predio - último mes"
            >
              <PlaceholderChart type="bar" color="text-orange-500" />
            </ChartCard>

            <ChartCard
              title="Estimación vs Real"
              subtitle="Comparación de producción"
            >
              <PlaceholderChart type="bar" color="text-red-500" />
            </ChartCard>
          </div>
        )}

        {activeTab === "exports" && <MiExportacion />}

        {activeTab === "production" && <MiProduccion />}

        {activeTab === "analysis" && (
          <div className="analysis-section">
            <div>
              <h2 className="analysis-title">Análisis Sondeo</h2>
              <GraficosTorta />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
