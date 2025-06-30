import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TooltipProps } from "recharts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
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
  
  // Estados para el gráfico de productividad
  const [productivityData, setProductivityData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("rendimiento");
  const [productivityLoading, setProductivityLoading] = useState(false);
  const [productivityError, setProductivityError] = useState(null);
  const [totals, setTotals] = useState({
    totalHectareas: 0,
    rendimientoTotal: 0,
    produccionTotal: 0
  });
  
  const navigate = useNavigate();

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  };

  // Función para hacer peticiones autenticadas
  const apiRequest = async (endpoint) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  };

  // Función para procesar y combinar datos de diferentes endpoints
  const processProductivityData = (toneladasData, rendimientoData) => {
    const rendimientoMap = {};
    if (rendimientoData && Array.isArray(rendimientoData)) {
      rendimientoData.forEach(item => {
        const mes = new Date(item.fecha_cosecha || item.created_at).toLocaleDateString('es-ES', { 
          month: 'short',
          year: '2-digit'
        });
        rendimientoMap[mes] = Number(item.rendimiento_por_hectarea || item.rendimiento) || 0;
      });
    }
  
    return toneladasData.map(item => {
      const mes = new Date(item.mes || item.fecha).toLocaleDateString('es-ES', { 
        month: 'short',
        year: '2-digit'
      });
      
      const toneladas = Number(item.toneladas_cosechadas || item.toneladas) || 0;
      const rendimiento = rendimientoMap[mes] || 0;
      
      return {
        mes,
        toneladas,
        rendimiento,
        eficiencia: rendimiento ? Math.min(100, (rendimiento / 50) * 100) : 75,
        hectareas: Number(item.hectareas) || 0,
        costos: toneladas * 1500000
      };
    });
  };

  // Función para cargar datos de productividad
  const fetchProductivityData = async () => {
    try {
      const [
        toneladasResponse,
        rendimientoResponse,
        rendimientoTotalResponse,
        hectareasResponse
      ] = await Promise.allSettled([
        apiRequest('/estadisticas/cosechas/linea-tiempo-toneladas'),
        apiRequest('/estadisticas/rendimiento-cosecha'),
        apiRequest('/estadisticas/rendimiento/total'),
        apiRequest('/estadisticas/predios/total-hectareas')
      ]);
  
      const toneladasData = toneladasResponse.status === 'fulfilled' ? toneladasResponse.value : [];
      const rendimientoData = rendimientoResponse.status === 'fulfilled' ? rendimientoResponse.value : [];
      const rendimientoTotal = rendimientoTotalResponse.status === 'fulfilled' ? rendimientoTotalResponse.value : {};
      const hectareasTotal = hectareasResponse.status === 'fulfilled' ? hectareasResponse.value : {};
  
      const processedData = processProductivityData(toneladasData, rendimientoData);
      setProductivityData(processedData);
  
      // Asegurar que todos los valores sean números
      const produccionTotal = processedData.reduce((sum, item) => sum + (Number(item.toneladas) || 0), 0);
      
      setTotals({
        totalHectareas: Number(hectareasTotal.total_hectareas) || 0,
        rendimientoTotal: Number(rendimientoTotal.rendimiento_total) || 0,
        produccionTotal: Number(produccionTotal) || 0
      });
  
    } catch (error) {
      console.error("Error al cargar datos de productividad:", error);
      
      // Datos de ejemplo si falla la API
      setProductivityData([
        { mes: "Ene", toneladas: 45, rendimiento: 12.5, eficiencia: 85, hectareas: 3.6, costos: 67500000 },
        { mes: "Feb", toneladas: 52, rendimiento: 13.8, eficiencia: 88, hectareas: 3.8, costos: 78000000 },
        { mes: "Mar", toneladas: 48, rendimiento: 12.0, eficiencia: 82, hectareas: 4.0, costos: 72000000 }
      ]);
      setTotals({
        totalHectareas: 23.0,
        rendimientoTotal: 13.4,
        produccionTotal: 145
      });
    }
  };

  // Función para calcular promedios
  const calculateAverages = () => {
    if (productivityData.length === 0) return { avgRendimiento: 0, avgToneladas: 0, avgEficiencia: 0 };
    
    const totalData = productivityData.length;
    return {
      avgRendimiento: (productivityData.reduce((sum, item) => sum + (Number(item.rendimiento) || 0), 0) / totalData).toFixed(2),
      avgToneladas: (productivityData.reduce((sum, item) => sum + (Number(item.toneladas) || 0), 0) / totalData).toFixed(1),
      avgEficiencia: Math.round(productivityData.reduce((sum, item) => sum + (Number(item.eficiencia) || 0), 0) / totalData)
    };
  };

  
  const CustomProductivityTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.9)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #48bb78',
          color: 'white'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '8px' }}>
            {`Mes: ${label}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${entry.name}: ${
                entry.dataKey === 'costos' 
                  ? `$${Intl.NumberFormat('es-CO').format(entry.value)}`
                  : entry.dataKey === 'rendimiento'
                  ? `${entry.value} ton/ha`
                  : entry.dataKey === 'eficiencia'
                  ? `${entry.value}%`
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            const entry = { mes };
            const productEntries = productos as Record<string, { toneladas: number; hectareas: number }>;
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
    // Cargar datos de productividad
    fetchProductivityData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const missingEstimacion = respuestas && !respuestas.produccion_estimada;
  const missingReal = respuestas && !respuestas.produccion_real;
  const averages = calculateAverages();

  return (
    <div className="export-metrics">
      <h3 className="metrics-subtitle">Mi Producción</h3>
      <div className="production-grid">
        {/* Gráfico de Productividad Integral - NUEVO */}
        <div className="metric-card" style={{ gridColumn: "1 / -1", marginBottom: "1rem" }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ 
                margin: 0, 
                color: '#1a202c', 
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                Análisis de Productividad Integral
              </h2>
              <p style={{ 
                margin: '8px 0 0 0', 
                color: '#64748b',
                fontSize: '14px'
              }}>
                Rendimiento, eficiencia y costos por mes {productivityError && `• ${productivityError}`}
              </p>
            </div>

            {/* KPIs Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #48bb78'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  RENDIMIENTO PROMEDIO
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
                  {averages.avgRendimiento} <span style={{ fontSize: '14px', color: '#64748b' }}>ton/ha</span>
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #667eea'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  PRODUCCIÓN PROMEDIO
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
                  {averages.avgToneladas} <span style={{ fontSize: '14px', color: '#64748b' }}>ton/mes</span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #f59e0b'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  EFICIENCIA PROMEDIO
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
                  {averages.avgEficiencia}<span style={{ fontSize: '14px', color: '#64748b' }}>%</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '20px',
              alignItems: 'center'
            }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Métrica principal:
              </label>
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="rendimiento">Rendimiento (ton/ha)</option>
                <option value="eficiencia">Eficiencia (%)</option>
                <option value="toneladas">Producción (toneladas)</option>
              </select>
              
              <button 
                onClick={fetchProductivityData}
                disabled={productivityLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: productivityLoading ? '#9ca3af' : '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: productivityLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {productivityLoading ? '⟳ Actualizando...' : 'Actualizar'}
              </button>
            </div>

            {/* Chart */}
            <div style={{ height: '400px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
              {productivityLoading ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  fontSize: '16px',
                  color: '#64748b'
                }}>
                  ⟳ Cargando datos de productividad...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={productivityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip content={<CustomProductivityTooltip />} />
                    <Legend />
                    
                    {/* Barras de producción */}
                    <Bar 
                      yAxisId="left"
                      dataKey="toneladas" 
                      fill="#67c3f3" 
                      name="Toneladas"
                      opacity={0.8}
                    />
                    
                    {/* Línea de la métrica seleccionada */}
                    <Line
                      yAxisId={selectedMetric === 'toneladas' ? 'left' : 'right'}
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={
                        selectedMetric === 'rendimiento' ? '#48bb78' :
                        selectedMetric === 'eficiencia' ? '#f59e0b' : '#667eea'
                      }
                      strokeWidth={3}
                      name={
                        selectedMetric === 'rendimiento' ? 'Rendimiento (ton/ha)' :
                        selectedMetric === 'eficiencia' ? 'Eficiencia (%)' : 'Producción (ton)'
                      }
                      dot={{ 
                        stroke: '#fff', 
                        strokeWidth: 2, 
                        r: 5,
                        fill: selectedMetric === 'rendimiento' ? '#48bb78' :
                              selectedMetric === 'eficiencia' ? '#f59e0b' : '#667eea'
                      }}
                      activeDot={{ r: 8 }}
                    />
                    
                    {/* Línea de referencia para eficiencia óptima */}
                    {selectedMetric === 'eficiencia' && (
                      <ReferenceLine 
                        yAxisId="right"
                        y={100} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        label={{ value: "Meta 100%", position: "top" }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

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
