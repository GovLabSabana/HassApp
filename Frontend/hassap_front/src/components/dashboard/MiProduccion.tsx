import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../../componentsStyles/Metricas.css";
import "../../componentsStyles/dashboard/Production.css";
import Loader from "../utils/Loader";

const API_URL = import.meta.env.VITE_API_URL;

export default function MiProduccion() {
  const [rendimientoData, setRendimientoData] = useState([]);
  const [cosechasPredioMes, setCosechasPredioMes] = useState([]);
  const [produccionData, setProduccionData] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);
  const [respuestas, setRespuestas] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const [
          resRendimiento,
          resCosechas,
          resProduccion,
          resComparative,
          resRespuestas,
        ] = await Promise.all([
          fetch(`${API_URL}/estadisticas/rendimiento-cosecha`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/estadisticas/cosechas/ultimo-mes-por-predio`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/estadisticas/cosechas/linea-tiempo-toneladas`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
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

        // Procesar datos de rendimiento
        if (resRendimiento.ok) {
          const data = await resRendimiento.json();
          const grouped = {};
          data.forEach((item) => {
            const fecha = new Date(item.fecha);
            const mes = `${fecha.getFullYear()}-${String(
              fecha.getMonth() + 1
            ).padStart(2, "0")}`;
            const producto = item.producto;

            if (!grouped[mes]) grouped[mes] = {};
            if (!grouped[mes][producto])
              grouped[mes][producto] = { toneladas: 0, hectareas: 0 };

            grouped[mes][producto].toneladas += parseFloat(item.toneladas);
            grouped[mes][producto].hectareas += parseFloat(item.hectareas);
          });

          const result = Object.entries(grouped).map(([mes, productos]) => {
            const entry: Record<string, any> = { mes };
            const productEntries = productos as Record<
              string,
              { toneladas: number; hectareas: number }
            >;
            for (const prod in productEntries) {
              const { toneladas, hectareas } = productEntries[prod];
              entry[prod] =
                hectareas > 0 ? +(toneladas / hectareas).toFixed(2) : 0;
            }
            return entry;
          });

          result.sort((a, b) => a.mes.localeCompare(b.mes));
          setRendimientoData(result);
        }

        // Procesar datos de cosechas por predio
        if (resCosechas.ok) {
          const data = await resCosechas.json();
          const parsed = data.map((item) => ({
            predio: item.predio,
            hectareas: parseFloat(item.hectareas),
            toneladas: parseFloat(item.toneladas),
          }));
          setCosechasPredioMes(parsed);
        }

        // Procesar datos de producción histórica
        if (resProduccion.ok) {
          const json = await resProduccion.json();
          const parsed = json.map((item) => ({
            mes: item.mes,
            toneladas: parseFloat(item.toneladas),
          }));
          setProduccionData(parsed);
        }

        // Procesar datos comparativos
        if (resComparative.ok) {
          const json = await resComparative.json();
          const parsed = json.map((item) => ({
            mes: item.mes,
            estimada: parseFloat(item.estimada),
            real: parseFloat(item.real),
          }));
          setComparativeData(parsed);
        }

        // Procesar respuestas del sondeo
        if (resRespuestas.ok) {
          setRespuestas(await resRespuestas.json());
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos de producción:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const missingEstimacion = respuestas && !respuestas.produccion_estimada;
  const missingReal = respuestas && !respuestas.produccion_real;

  return (
    <div className="export-metrics">
      <h3 className="metrics-subtitle">Mi Producción</h3>
      <div className="production-grid">
        {/* Gráfico de Rendimiento */}
        {rendimientoData.length > 0 && (
          <div className="metric-card div1">
            <div className="metric-title">
              Rendimiento de Cosechas por Producto
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rendimientoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(rendimientoData[0])
                    .filter((key) => key !== "mes")
                    .map((producto, idx) => (
                      <Bar
                        key={producto}
                        dataKey={producto}
                        fill={
                          ["#48bb78", "#667eea", "#f6ad55", "#ed64a6"][idx % 4]
                        }
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráficos de Predios */}
        {cosechasPredioMes.length > 0 && (
          <>
            <div className="metric-card div3">
              <div className="metric-title">
                Hectáreas usadas por Predio (Último Mes)
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cosechasPredioMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="predio" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hectareas" fill="#63b3ed" name="Hectáreas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="metric-card div4">
              <div className="metric-title">
                Toneladas recolectadas por Predio (Último Mes)
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cosechasPredioMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="predio" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="toneladas" fill="#f6ad55" name="Toneladas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Gráfico de Producción Histórica */}
        <div className="metric-card div2">
          <div className="metric-header">
            <div>
              <div className="metric-title">
                Agregado histórico de producciones - Asociados
              </div>
              <div className="metric-value">Toneladas mensuales</div>
              <div className="metric-change positive">Datos actualizados</div>
            </div>
          </div>
          <div
            className="chart-container"
            style={{ height: "300px", marginTop: "1rem" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={produccionData}
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
                    value: "Toneladas",
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
                <Line
                  type="monotone"
                  dataKey="toneladas"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: "#f59e0b",
                    r: 6,
                  }}
                  activeDot={{ r: 8 }}
                  name="Toneladas producidas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Comparativo */}
        <div className="metric-card div5" style={{ height: "fit-content" }}>
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
                  data={comparativeData}
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
