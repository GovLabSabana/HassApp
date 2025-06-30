import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine, 
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ProductivityChart() {
  const [productivityData, setProductivityData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("rendimiento");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    totalHectareas: 0,
    rendimientoTotal: 0,
    produccionTotal: 0
  });
  

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    // Ajusta esto según cómo manejes la autenticación en tu app
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  };

  // Función para hacer peticiones autenticadas
  const apiRequest = async (endpoint) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    // Crear un mapa de rendimiento por mes si está disponible
    const rendimientoMap = {};
    if (rendimientoData && Array.isArray(rendimientoData)) {
      rendimientoData.forEach(item => {
        // Asumiendo que tienes fecha en el rendimiento, ajusta según tu esquema
        const mes = new Date(item.fecha_cosecha || item.created_at).toLocaleDateString('es-ES', { 
          month: 'short',
          year: '2-digit'
        });
        rendimientoMap[mes] = item.rendimiento_por_hectarea || item.rendimiento;
      });
    }

    // Procesar datos de toneladas por mes
    return toneladasData.map(item => {
      const mes = new Date(item.mes || item.fecha).toLocaleDateString('es-ES', { 
        month: 'short',
        year: '2-digit'
      });
      
      return {
        mes,
        toneladas: item.toneladas_cosechadas || item.toneladas || 0,
        rendimiento: rendimientoMap[mes] || 0,
        // Calculamos eficiencia estimada basada en rendimiento
        eficiencia: rendimientoMap[mes] ? Math.min(100, (rendimientoMap[mes] / 50) * 100) : 75,
        hectareas: item.hectareas || 0,
        // Costo estimado por tonelada (puedes ajustar o obtener de otro endpoint)
        costos: (item.toneladas_cosechadas || item.toneladas || 0) * 1500000
      };
    });
  };

  

  // Función principal para cargar datos de productividad
  const fetchProductivityData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Realizar peticiones paralelas a los diferentes endpoints
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

      // Extraer datos exitosos
      const toneladasData = toneladasResponse.status === 'fulfilled' ? toneladasResponse.value : [];
      const rendimientoData = rendimientoResponse.status === 'fulfilled' ? rendimientoResponse.value : [];
      const rendimientoTotal = rendimientoTotalResponse.status === 'fulfilled' ? rendimientoTotalResponse.value : {};
      const hectareasTotal = hectareasResponse.status === 'fulfilled' ? hectareasResponse.value : {};

      // Procesar y combinar datos
      const processedData = processProductivityData(toneladasData, rendimientoData);
      setProductivityData(processedData);

      // Establecer totales
      setTotals({
        totalHectareas: hectareasTotal.total_hectareas || 0,
        rendimientoTotal: rendimientoTotal.rendimiento_total || 0,
        produccionTotal: processedData.reduce((sum, item) => sum + item.toneladas, 0)
      });

      // Verificar si hay errores en alguna petición
      const errors = [toneladasResponse, rendimientoResponse, rendimientoTotalResponse, hectareasResponse]
        .filter(response => response.status === 'rejected')
        .map(response => response.reason.message);
      
      if (errors.length > 0) {
        console.warn('Algunos endpoints fallaron:', errors);
        setError(`Advertencia: Algunos datos pueden estar incompletos`);
      }

    } catch (error) {
      console.error("Error al cargar datos de productividad:", error);
      setError(`Error al cargar datos: ${error.message}`);
      
      // Usar datos de ejemplo si falla la API
      setProductivityData([
        { mes: "Ene", toneladas: 45, rendimiento: 12.5, eficiencia: 85, hectareas: 3.6, costos: 67500000 },
        { mes: "Feb", toneladas: 52, rendimiento: 13.8, eficiencia: 88, hectareas: 3.8, costos: 78000000 },
        { mes: "Mar", toneladas: 48, rendimiento: 12.0, eficiencia: 82, hectareas: 4.0, costos: 72000000 },
        { mes: "Abr", toneladas: 55, rendimiento: 14.2, eficiencia: 90, hectareas: 3.9, costos: 82500000 },
        { mes: "May", toneladas: 49, rendimiento: 13.1, eficiencia: 87, hectareas: 3.7, costos: 73500000 },
        { mes: "Jun", toneladas: 58, rendimiento: 15.0, eficiencia: 92, hectareas: 3.9, costos: 87000000 }
      ]);
      setTotals({
        totalHectareas: 23.0,
        rendimientoTotal: 13.4,
        produccionTotal: 307
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProductivityData();
  }, []);

  // Función para calcular promedios
  const calculateAverages = () => {
    if (productivityData.length === 0) return { avgRendimiento: 0, avgToneladas: 0, avgEficiencia: 0 };
    
    const totalData = productivityData.length;
    return {
      avgRendimiento: (productivityData.reduce((sum, item) => sum + item.rendimiento, 0) / totalData).toFixed(2),
      avgToneladas: (productivityData.reduce((sum, item) => sum + item.toneladas, 0) / totalData).toFixed(1),
      avgEficiencia: Math.round(productivityData.reduce((sum, item) => sum + item.eficiencia, 0) / totalData)
    };
  };

  const averages = calculateAverages();

  interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }
  
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
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
  

  return (
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
          📊 Análisis de Productividad Integral
        </h2>
        <p style={{ 
          margin: '8px 0 0 0', 
          color: '#64748b',
          fontSize: '14px'
        }}>
          Rendimiento, eficiencia y costos por mes {error && `• ${error}`}
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

        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ed64a6'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            TOTAL HECTÁREAS
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
            {totals.totalHectareas} <span style={{ fontSize: '14px', color: '#64748b' }}>ha</span>
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
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#9ca3af' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? '⟳ Actualizando...' : '🔄 Actualizar'}
        </button>
      </div>

      {/* Chart */}
      <div style={{ height: '400px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        {loading ? (
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
              <Tooltip content={<CustomTooltip />} />
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

      {/* Insights */}
      {productivityData.length > 0 && (
        <div style={{ 
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0c4a6e', fontSize: '16px' }}>
            💡 Insights de Productividad
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e' }}>
            <li>Mejor mes de rendimiento: {
              productivityData.reduce((max, item) => 
                item.rendimiento > max.rendimiento ? item : max
              ).mes
            } ({
              productivityData.reduce((max, item) => 
                item.rendimiento > max.rendimiento ? item : max
              ).rendimiento
            } ton/ha)</li>
            <li>Tendencia de eficiencia: {
              productivityData.length > 1 && 
              productivityData[productivityData.length-1].eficiencia > productivityData[0].eficiencia 
                ? '📈 Mejorando' : '📉 Requiere atención'
            }</li>
            <li>Costo promedio por tonelada: ${
              productivityData.length > 0 ? 
              Math.round(productivityData.reduce((sum, item) => sum + (item.costos / item.toneladas), 0) / productivityData.length).toLocaleString('es-CO')
              : '0'
            }</li>
            <li>Producción total periodo: {totals.produccionTotal.toFixed(1)} toneladas</li>
          </ul>
        </div>
      )}
    </div>
  );
}