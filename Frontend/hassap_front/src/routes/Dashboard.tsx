import GraficosTorta from "../components/dashboard/PieCharts";
import Layout from "./layouts/menu";

export default function Dashboard() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Inicio</h1>
      <GraficosTorta />
    </>
  );
}
