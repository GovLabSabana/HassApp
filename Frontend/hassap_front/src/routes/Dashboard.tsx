import { BarChart3, Map, PieChart, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import General from "../components/dashboard/General";
import MiExportacion from "../components/dashboard/MiExportacion";
import MiProduccion from "../components/dashboard/MiProduccion";
import GraficosTorta from "../components/dashboard/PieCharts";
import "../componentsStyles/dashboard/Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "Resumen General", icon: BarChart3 },
    { id: "exports", name: "Exportaciones", icon: TrendingUp },
    { id: "production", name: "Producción", icon: Map },
    { id: "analysis", name: "Análisis Sondeo", icon: PieChart },
  ];

  return (
    <div className="dashboard">
      {/* Header con pestañas y controles */}
      <header className="header">
        <h1 className="dashboard-title">Dashboard</h1>

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
