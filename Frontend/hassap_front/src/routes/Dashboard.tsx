import GraficosTorta from "../components/dashboard/PieCharts";
import MetricasExportacion from "../components/dashboard/ExportMetrics.tsx";
import ExportacionesChart from "../components/dashboard/ExportChart.tsx";

export default function Dashboard() {
  return (
    <>
      <h1 style={{ textAlign: "left" }}>Sondeo</h1>
      <GraficosTorta />
      <MetricasExportacion />
      <ExportacionesChart />
    </>
  );
}
