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
import { useNavigate } from "react-router-dom";
import "../../componentsStyles/Metricas.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ComparativeChart() {
  const [data, setData] = useState([]);
  const [respuestas, setRespuestas] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatos = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const [resDatos, resRespuestas] = await Promise.all([
          fetch(`${API_URL}/estadisticas/sondeo/estimacion-vs-real`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/respuestas/sondeo/respuestas-mensuales`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!resDatos.ok || !resRespuestas.ok) {
          throw new Error("Error al cargar los datos");
        }

        const jsonDatos = await resDatos.json();
        const jsonRespuestas = await resRespuestas.json();

        const parsed = jsonDatos.map((item) => ({
          mes: item.mes,
          estimada: parseFloat(item.estimada),
          real: parseFloat(item.real),
        }));

        setData(parsed);
        setRespuestas(jsonRespuestas);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  if (loading) {
    return (
      <div className="metric-card loading">
        <div className="metric-title">Cargando datos...</div>
      </div>
    );
  }

  const missingEstimacion = respuestas && !respuestas.produccion_estimada;
  const missingReal = respuestas && !respuestas.produccion_real;

  return (
    <div className="export-metrics">
      <div className="metrics-grid">
        <div className="metric-card" style={{ height: "fit-content" }}>
          <div className="metric-header">
            <div>
              <div className="metric-title">Comparativo Estimación vs Real</div>
              <div className="metric-value">Producción por mes</div>
              <div className="metric-change positive">
                Proyecciones vs realidad
              </div>
            </div>
          </div>

          {missingEstimacion || missingReal ? (
            <div className="chart-placeholder" style={{ padding: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  width: "100%",
                  alignItems: "center",
                  color: "#000",
                }}
              >
                Te falta completar la información del sondeo para ver el gráfico
                comparativa
                {missingEstimacion && (
                  <button
                    onClick={() => navigate("/sondeo")}
                    className="metric-button warning"
                  >
                    ⚠️ Completa: ¿Cuántos kilos planea producir el próximo mes?
                  </button>
                )}
                {missingReal && (
                  <button
                    onClick={() => navigate("/sondeo")}
                    className="metric-button warning"
                  >
                    ⚠️ Completa: ¿Cuántos kilos produjo el último mes?
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className="chart-container"
              style={{ height: "300px", marginTop: "1rem" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
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
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    label={{
                      value: "Kilos",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={{ stroke: "#cbd5e1" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      borderRadius: "8px",
                      border: "1px solid #48bb78",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "#ffffff" }}
                    formatter={(value, name) => [
                      `${Intl.NumberFormat("es-CO").format(Number(value))} kg`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="estimada"
                    stroke="#48bb78"
                    strokeWidth={3}
                    name="Estimado"
                    dot={{
                      stroke: "#fff",
                      strokeWidth: 2,
                      fill: "#48bb78",
                      r: 6,
                    }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke="#667eea"
                    strokeWidth={3}
                    name="Real"
                    dot={{
                      stroke: "#fff",
                      strokeWidth: 2,
                      fill: "#667eea",
                      r: 6,
                    }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
