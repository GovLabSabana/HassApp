import GraficosTorta from "../components/dashboard/PieCharts";
import { Sidebar } from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <h1 style={{ textAlign: "center" }}>Inicio</h1>
        <GraficosTorta />
      </div>
    </div>
  );
}
