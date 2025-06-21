import GraficosTorta from "../components/dashboard/PieCharts";
import MetricasExportacion from "../components/dashboard/ExportMetrics.tsx";
import Layout from "./layouts/menu";
import React from "react";

 
export default function Dashboard() {
  return (
    <>
      <h1 style={{ textAlign: "left" }}>Sondeo</h1>
      <GraficosTorta />
      <MetricasExportacion />
    </>
  );
}
