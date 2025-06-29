import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import "../../componentsStyles/dashboard/Dashboard.css";
import "../../componentsStyles/dashboard/General.css";
import TRM from "./TMR";
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  span?: "span-1" | "span-2" | "span-3";
  height?: "height-64" | "height-80" | "height-96";
}

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
  return (
    <div className="general-dashboard">
      <h3 className="metrics-subtitle">Resumen</h3>
      <div className="general-grid">
        {/* div1 */}
        <div className="general-cell" style={{ gridArea: "1 / 1 / 3 / 4" }}>
          <ChartCard
            title="Exportaciones Mensuales"
            subtitle="Tendencia últimos 12 meses"
          >
            <PlaceholderChart type="line" color="text-blue-500" />
          </ChartCard>
        </div>

        {/* div2 */}
        <div className="general-cell" style={{ gridArea: " 5 / 1 / 6 / 4" }}>
          <KPICard
            title="Exportaciones FOB"
            value="$2.1M"
            change="+8.7%"
            positive
          />
        </div>

        {/* div4 */}
        <div className="general-cell" style={{ gridArea: "3 / 1 / 5 / 2" }}>
          <KPICard title="Eficiencia" value="94.2%" change="+3.4%" positive />
        </div>

        {/* div5 */}
        <div className="general-cell" style={{ gridArea: "3 / 2 / 5 / 4" }}>
          <TRM />
        </div>

        {/* div6 */}
        <div className="general-cell" style={{ gridArea: "4 / 4 / 6 / 6" }}>
          <ChartCard
            title="Producción por Producto"
            subtitle="Distribución actual"
          >
            <PlaceholderChart type="pie" color="text-green-500" />
          </ChartCard>
        </div>
        {/* div7 */}
        <div className="general-cell" style={{ gridArea: "1 / 4 / 2 / 6" }}>
          <KPICard
            title="Producción Total"
            value="1,847 T"
            change="+12.3%"
            positive
          />
        </div>

        {/* div8 */}
        <div className="general-cell" style={{ gridArea: "2 / 4 / 3 / 6" }}>
          <ChartCard
            title="Toneladas Recolectadas"
            subtitle="Por predio - último mes"
          >
            <PlaceholderChart type="bar" color="text-orange-500" />
          </ChartCard>
        </div>

        {/* div9 */}
        <div className="general-cell" style={{ gridArea: "3 / 4 / 4 / 6" }}>
          <KPICard
            title="Hectáreas Activas"
            value="234 Ha"
            change="-2.1%"
            positive={false}
          />
        </div>
      </div>
    </div>
  );
}
