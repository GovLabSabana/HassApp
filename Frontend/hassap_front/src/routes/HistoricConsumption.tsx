import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type Cosecha = {
  id: number;
  predios: { id: number; nombre: string }[];
  insumos: { insumo_id: number; cantidad: number }[];
};

type Predio = { id: number; nombre: string };
type Insumo = { id: number; nombre_comercial: string };

export default function HistoricConsumption() {
  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
  const [predios, setPredios] = useState<Predio[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [mode, setMode] = useState<"predio" | "cosecha">("predio");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ name: string; cantidad: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    Promise.all([
      fetch(`${API_URL}/cosechas/`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_URL}/predios/`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_URL}/insumos/`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
    ]).then(([c, p, i]) => {
      setCosechas(c);
      setPredios(p);
      setInsumos(i);
    });
  }, []);

  useEffect(() => {
    if (selectedId == null) {
        setChartData([]);
        return;
    }

    if (mode === "predio") {
        const agg: Record<number, number> = {};

        cosechas.forEach(cosecha => {
        const perteneceAlPredio = cosecha.predios.some(p => p.id === selectedId);

        if (perteneceAlPredio) {
            cosecha.insumos.forEach(ins => {
            const cantidad = Number(ins.cantidad) || 0;
            if (agg[ins.insumo_id]) {
                agg[ins.insumo_id] += cantidad;
            } else {
                agg[ins.insumo_id] = cantidad;
            }
            });
        }
        });

        const result = Object.entries(agg).map(([insumoId, cantidad]) => ({
        name: insumos.find(i => i.id === +insumoId)?.nombre_comercial || `#${insumoId}`,
        cantidad,
        }));

        setChartData(result);
    }

    if (mode === "cosecha") {
        const cosecha = cosechas.find(c => c.id === selectedId);
        if (!cosecha) {
        setChartData([]);
        return;
        }

        const result = cosecha.insumos.map(ins => ({
        name: insumos.find(i => i.id === ins.insumo_id)?.nombre_comercial || `#${ins.insumo_id}`,
        cantidad: Number(ins.cantidad) || 0,
        }));

        setChartData(result);
    }
    }, [mode, selectedId, cosechas, insumos]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ textAlign: "center" }}>Histórico de consumo</h1>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button disabled={mode === "predio"} onClick={() => { setMode("predio"); setSelectedId(null); setChartData([]); }}>
          Por Predio
        </button>
        <button disabled={mode === "cosecha"} onClick={() => { setMode("cosecha"); setSelectedId(null); setChartData([]); }}>
          Por Cosecha
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        {mode === "predio" && (
          <select
            value={selectedId ?? ""}
            onChange={e => setSelectedId(Number(e.target.value))}
          >
            <option value="">Seleccionar Predio...</option>
            {predios.map(p =>
              <option key={p.id} value={p.id}>{p.nombre}</option>
            )}
          </select>
        )}
        {mode === "cosecha" && (
          <select
            value={selectedId ?? ""}
            onChange={e => setSelectedId(Number(e.target.value))}
          >
            <option value="">Seleccionar Cosecha...</option>
            {cosechas.map(c =>
              <option key={c.id} value={c.id}>ID {c.id}</option>
            )}
          </select>
        )}
      </div>

      {selectedId != null && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(val) => [val, "Cantidad"]} />
            <Bar dataKey="cantidad" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ textAlign: "center" }}>
          {selectedId == null ? "Selecciona un elemento para ver la gráfica…" : "No hay datos para mostrar."}
        </p>
      )}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button onClick={() => navigate("/inputs")}>Regresar</button>
      </div>
    </div>
  );
}
