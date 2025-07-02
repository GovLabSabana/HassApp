import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import "../../componentsStyles/dashboard/Dashboard.css";
import "../../componentsStyles/dashboard/General.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";

import TRM from "./TMR";
import Loader from "../utils/Loader";
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  span?: "span-1" | "span-2" | "span-3";
  height?: "height-64" | "height-80" | "height-96";
}

const KPICard: React.FC<{
  title: string;
  value: string;
  change?: string;
  positive: boolean;
}> = ({ title, value, change, positive }) => (
  <div className="kpi-card">
    <h4 className="kpi-title">{title}</h4>
    <div className="kpi-content">
      <span className="kpi-value">{value}</span>
      {change ? (
        <span className={`kpi-change ${positive ? "positive" : "negative"}`}>
          {change}
        </span>
      ) : (
        ""
      )}
    </div>
  </div>
);
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  span = "span-1",
}) => (
  <div className={`chart-card ${span}`}>
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
    </div>
    <div className="chart-content">{children}</div>
  </div>
);
export default function General() {
  const [exportacionesMensuales, setExportacionesMensuales] = useState<any[]>(
    []
  );
  const [produccionTotal, setProduccionTotal] = useState<{
    total: number;
    porcentaje: number | null;
  }>({ total: 0, porcentaje: null });
  const [rendimiento, setRendimiento] = useState<number>(0);
  const [hectareasActivas, setHectareasActivas] = useState<number>(0);
  const [produccionPorProducto, setProduccionPorProducto] = useState<any[]>([]);
  const [toneladasPorPredio, setToneladasPorPredio] = useState<any[]>([]);
  const [exportacionesFOB, setExportacionesFOB] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("access_token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    async function fetchData() {
      try {
        const [
          resExportacionesMensuales,
          resProduccionTotal,
          resRendimiento,
          resHectareas,
          resProduccionPorProducto,
          resToneladasPorPredio,
          resExportacionesFOB,
        ] = await Promise.all([
          fetch(`${API_URL}/estadisticas/exportaciones/linea-tiempo`, {
            headers,
          }),
          fetch(`${API_URL}/estadisticas/produccion/total-y-mejora`, {
            headers,
          }),
          fetch(`${API_URL}/estadisticas/rendimiento/total`, { headers }),
          fetch(`${API_URL}/estadisticas/predios/total-hectareas`, { headers }),
          fetch(`${API_URL}/estadisticas/produccion/por-producto`, { headers }),
          fetch(`${API_URL}/estadisticas/cosechas/ultimo-mes-por-predio`, {
            headers,
          }),
          fetch(`${API_URL}/estadisticas/exportaciones/linea-tiempo`, {
            headers,
          }),
        ]);

        const [
          dataExportacionesMensuales,
          dataProduccionTotal,
          dataRendimiento,
          dataHectareas,
          dataProduccionPorProducto,
          dataToneladasPorPredio,
          dataExportacionesFOB,
        ] = await Promise.all([
          resExportacionesMensuales.json(),
          resProduccionTotal.json(),
          resRendimiento.json(),
          resHectareas.json(),
          resProduccionPorProducto.json(),
          resToneladasPorPredio.json(),
          resExportacionesFOB.json(),
        ]);

        setExportacionesMensuales(dataExportacionesMensuales);
        setProduccionTotal({
          total: dataProduccionTotal.produccion_total,
          porcentaje: dataProduccionTotal.porcentaje_mejora,
        });
        setRendimiento(parseFloat(dataRendimiento.rendimiento_total));

        setHectareasActivas(dataHectareas.hectareas);
        setProduccionPorProducto(dataProduccionPorProducto);
        setToneladasPorPredio(dataToneladasPorPredio);

        const sumaFOB = dataExportacionesFOB.reduce(
          (acc: number, e: any) => acc + parseFloat(e.valor_fob),
          0
        );
        setExportacionesFOB(sumaFOB);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="general-dashboard">
      <h3 className="metrics-subtitle">Resumen</h3>
      {loading ? (
        <Loader />
      ) : (
        <div className="general-grid">
          {/* div1 */}
          <div className="general-cell div1">
            <ChartCard
              title="Exportaciones Mensuales"
              subtitle="Tendencia últimos 12 meses"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exportacionesMensuales}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="valor_fob"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* div2 */}
          <div className="general-cell div2">
            <TRM />
          </div>

          {/* div4 */}
          <div className="general-cell div4">
            <KPICard
              title="Rendimiento Tonelada/Hectárea"
              value={`${rendimiento.toFixed(2)}`}
              positive
            />
          </div>

          {/* div5 */}
          <div className="general-cell div5">
            <ChartCard
              title="Toneladas Recolectadas"
              subtitle="Por predio - último mes"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={toneladasPorPredio}>
                  <XAxis dataKey="predio" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="toneladas" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* div6 */}
          <div className="general-cell div6">
            <ChartCard
              title="Producción por Producto"
              subtitle="Distribución actual"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={produccionPorProducto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="producto_nombre" />

                  {/* Eje Y izquierdo: toneladas */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(value) => `${value} t`}
                  />

                  {/* Eje Y derecho: valor FOB */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />

                  <Tooltip />

                  {/* Barras de toneladas */}
                  <Bar
                    yAxisId="left"
                    dataKey="toneladas"
                    fill="#3b82f6"
                    name="Toneladas"
                  />

                  {/* Barras de valor FOB */}
                  <Bar
                    yAxisId="right"
                    dataKey="valor_fob"
                    fill="#4b32f7"
                    name="Valor FOB"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* div7 */}
          <div className="general-cell div7">
            <KPICard
              title="Producción Total"
              value={`${produccionTotal.total} T`}
              change={
                produccionTotal.porcentaje !== null
                  ? `${
                      produccionTotal.porcentaje > 0 ? "+" : ""
                    }${produccionTotal.porcentaje.toFixed(2)}%`
                  : "0%"
              }
              positive={
                produccionTotal.porcentaje === null
                  ? true
                  : produccionTotal.porcentaje >= 0
              }
            />
          </div>

          {/* div8 */}
          <div className="general-cell div8">
            <KPICard
              title="Exportaciones FOB"
              value={`$${exportacionesFOB.toLocaleString()}`}
              positive
            />
          </div>

          {/* div9 */}
          <div className="general-cell div9">
            <KPICard
              title="Hectáreas Activas"
              value={`${hectareasActivas.toFixed(2)} Ha`}
              positive
            />
          </div>
        </div>
      )}
    </div>
  );
}
