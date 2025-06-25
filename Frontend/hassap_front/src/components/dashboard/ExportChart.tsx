import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../../componentsStyles/ExportChart.css";
import "../../componentsStyles/Metricas.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ExportacionesChart() {
  const [data, setData] = useState([]);
  const [produccionData, setProduccionData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchExportaciones = async () => {
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
        setData(parsed);
      } catch (error) {
        console.error("Error exportaciones:", error);
      }
    };

    const fetchProduccion = async () => {
      try {
        const res = await fetch(
          `${API_URL}/estadisticas/cosechas/linea-tiempo-toneladas`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Error al cargar producción");
        const json = await res.json();
        const parsed = json.map((item) => ({
          mes: item.mes,
          toneladas: parseFloat(item.toneladas),
        }));
        setProduccionData(parsed);
      } catch (error) {
        console.error("Error producción:", error);
      }
    };

    fetchExportaciones();
    fetchProduccion();
  }, []);

  return (
    <div className="export-metrics">
      <h3 className="metrics-subtitle">Información del sector</h3>
      <div className="metrics-grid">

        {/* Gráfico de Exportaciones */}
        <div className="metric-card">
          <div className="metric-header">
            <div>
              <div className="metric-title">Exportaciones - Línea de Tiempo</div>
              <div className="metric-value">Valores históricos</div>
              <div className="metric-change positive">Datos actualizados</div>
            </div>
          </div>

          <div className="chart-container" style={{ height: "300px", marginTop: "1rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 12 }} label={{ value: "FOB ($)", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 12 }} label={{ value: "Toneladas", angle: -90, position: "insideRight", fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                <Tooltip
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
                <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="valor_fob" stroke="#48bb78" strokeWidth={3} dot={{ stroke: "#fff", strokeWidth: 2, fill: "#48bb78", r: 6 }} activeDot={{ r: 8 }} name="Valor FOB" />
                <Line yAxisId="right" type="monotone" dataKey="toneladas" stroke="#667eea" strokeWidth={3} dot={{ stroke: "#fff", strokeWidth: 2, fill: "#667eea", r: 6 }} activeDot={{ r: 8 }} name="Toneladas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Producción */}
        <div className="metric-card">
          <div className="metric-header">
            <div>
              <div className="metric-title">Producción - Línea de Tiempo</div>
              <div className="metric-value">Toneladas mensuales</div>
              <div className="metric-change positive">Datos actualizados</div>
            </div>
          </div>

          <div className="chart-container" style={{ height: "300px", marginTop: "1rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={produccionData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} label={{ value: "Toneladas", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    borderRadius: "8px",
                    border: "1px solid #f59e0b",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                  itemStyle={{ color: "#ffffff" }}
                  formatter={(value, name) => [
                    `${Intl.NumberFormat("es-CO").format(Number(value))}`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
                <Line type="monotone" dataKey="toneladas" stroke="#f59e0b" strokeWidth={3} dot={{ stroke: "#fff", strokeWidth: 2, fill: "#f59e0b", r: 6 }} activeDot={{ r: 8 }} name="Toneladas producidas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
