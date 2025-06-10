import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Cosecha {
  fecha: string;
  producto_id: number;
  calidad_id: number;
  toneladas: number;
  hectareas: number;
  calibre_promedio: number;
  observaciones: string;
  predios: number[];
  insumos: { insumo_id: number; cantidad: number; costo_unitario: number }[];
}

export default function ProductionEdit() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const navigate = useNavigate();
  const [data, setData] = useState<Cosecha>({
    fecha: "",
    producto_id: 0,
    calidad_id: 0,
    toneladas: 0,
    hectareas: 0,
    calibre_promedio: 0,
    observaciones: "",
    predios: [],
    insumos: []
  });
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/cosechas/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((c: Cosecha) => setData(c));
  }, [id]);

  const handleSave = async () => {
    await fetch(`${API_URL}/cosechas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        fecha: data.fecha,
        producto_id: data.producto_id,
        calidad_id: data.calidad_id,
        toneladas: data.toneladas,
        hectareas: data.hectareas,
        calibre_promedio: data.calibre_promedio,
        observaciones: data.observaciones,
        predio_ids: data.predios,
        insumos: data.insumos
      })
    });
    navigate("/production");
  };

  return (
    <div className="production-container">
      <h1>Editar Producción</h1>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <input type="date" value={data.fecha} onChange={e => setData(prev => ({ ...prev, fecha: e.target.value }))} required />
        <input type="number" value={data.producto_id} onChange={e => setData(prev => ({ ...prev, producto_id: +e.target.value }))} required />
        {/* Resto de campos */}
        <button type="submit">Guardar Cambios</button>
        <button type="button" onClick={() => navigate("/production")}>Cancelar</button>
      </form>
    </div>
  );
}
