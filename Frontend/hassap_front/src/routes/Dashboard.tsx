import GraficosTorta from "../components/dashboard/PieCharts";
import MiExportacion from "../components/dashboard/MiExportacion";
import MiProduccion from "../components/dashboard/MiProduccion";

export default function Dashboard() {
  return (
    <>
      <MiExportacion />
      <MiProduccion />
      <h1 style={{ textAlign: "left" }}>Sondeos</h1>
      <GraficosTorta />
    </>
  );
}
