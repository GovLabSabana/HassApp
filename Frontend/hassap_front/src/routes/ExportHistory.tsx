import React, { useEffect, useState } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type ExportType = {
  fecha: string;
  puerto_llegada: string;
  valor_fob: number;
};

export default function ExportHistory() {
  const [data, setData] = useState<ExportType[]>([]);
  const [view, setView] = useState<"year" | "destino">("year");
  const [chartData, setChartData] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch(`${API_URL}/exportaciones/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Error ${res.status}: ${errText}`);
        }
        return res.json();
      })
      .then((arr: any[]) => {
        const clean = arr
          .filter(e => e.fecha && e.puerto_llegada && e.valor_fob !== undefined)
          .map(e => ({
            fecha: e.fecha,
            puerto_llegada: e.puerto_llegada,
            valor_fob: e.valor_fob
          }));

        setData(clean);

        const years = Array.from(
          new Set(clean.map(e => new Date(e.fecha).getFullYear()))
        ).sort();
        setAvailableYears(years);
        setSelectedYear(years[0]); // Por defecto
      })
      .catch((err) => {
        console.error("Error al obtener exportaciones:", err);
        setData([]);
      });
  }, []);

  useEffect(() => {
    if (view === "year") {
      if (!selectedYear) return;

      const monthlyData = data
        .filter(e => new Date(e.fecha).getFullYear() === selectedYear)
        .reduce((acc, e) => {
          const month = new Date(e.fecha).getMonth(); // 0-11
          acc[month] = (acc[month] || 0) + e.valor_fob;
          return acc;
        }, {} as Record<number, number>);

      const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];

      const formatted = months.map((name, i) => ({
        x: name,
        total: monthlyData[i] || 0
      }));

      setChartData(formatted);
    } else {
      const grouped = data.reduce((acc, e) => {
        const country = e.puerto_llegada;
        acc[country] = (acc[country] || 0) + e.valor_fob;
        return acc;
      }, {} as Record<string, number>);
      setChartData(Object.entries(grouped).map(([c, v]) => ({
        x: c,
        total: v
      })));
    }
  }, [data, view, selectedYear]);

  const renderChart = () => {
    if (chartData.length === 0) return <p style={{ textAlign: "center" }}>Sin datos para mostrar.</p>;

    if (view === "year") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip formatter={(val) => [`$${val}`, "Valor FOB"]} />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip formatter={(val) => [`$${val}`, "Valor FOB"]} />
          <Bar dataKey="total" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, padding: "1rem" }}>
        <h1 style={{ textAlign: "center" }}>Histórico de Exportaciones</h1>

        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button disabled={view === "year"} onClick={() => setView("year")}>
            Por Año
          </button>
          <button disabled={view === "destino"} onClick={() => setView("destino")}>
            Por País Destino
          </button>
        </div>

        {view === "year" && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <label>Año: </label>
                <select
                value={selectedYear ?? ""}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
                </select>
            </div>
            )}

        {data.length === 0
          ? <p style={{ textAlign: "center" }}>Cargando datos...</p>
          : renderChart()
        }

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link to="/export">
            <button>Regresar</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
