import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../componentsStyles/Production.css";
import data from "../../BD_Keys.json";
import Layout from "./layouts/menu";

interface Predio {
  id: number;
  nombre: string;
}

interface Insumo {
  insumo_id: number;
  cantidad: string;
  costo_unitario: string;
  id: number;
  nombre_comercial: string;
}

interface Cosecha {
  id: number;
  fecha: string;
  producto_id: number;
  calidad_id: number;
  toneladas: string;
  hectareas: string;
  observaciones: string;
  predios: Predio[];
  insumos: Insumo[];
}

// Mapas para mostrar nombres
const productosMap = new Map<number, string>(
  data.tipo_producto.map((p: { id: number; name: string }) => [p.id, p.name])
);
const calidadesMap = new Map<number, string>(
  data.calidad.map((c: { id: number; name: string }) => [c.id, c.name])
);

export default function Production() {
  const navigate = useNavigate();
  const [list, setList] = useState<Cosecha[]>([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [predioId, setPredioId] = useState("");
  const [productoId, setProductoId] = useState("");
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/cosechas/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data: Cosecha[] = await res.json();
      setList(data);
    } catch (err) {
      console.error("Error al cargar las cosechas", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producción?")) return;
    await fetch(`${API_URL}/cosechas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const filtered = list.filter((c) => {
    const fecha = c.fecha;
    if (fechaDesde && fecha < fechaDesde) return false;
    if (fechaHasta && fecha > fechaHasta) return false;
    if (
      predioId &&
      !c.predios.some((p) =>
        p.nombre.toLowerCase().includes(predioId.toLowerCase())
      )
    )
      return false;
    if (
      productoId &&
      !(productosMap.get(c.producto_id) || "")
        .toLowerCase()
        .includes(productoId.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="production-container">
      <main>
        <h1 className="production-title">Gestión de Producción</h1>

        <div className="filters-section">
          <h3 className="filters-title">Filtros de búsqueda</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Desde</label>
              <input
                className="filter-input"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Hasta</label>
              <input
                className="filter-input"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Predio</label>
              <input
                className="filter-input"
                value={predioId}
                onChange={(e) => setPredioId(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Producto</label>
              <input
                className="filter-input"
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table className="production-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Calidad</th>
              <th>Toneladas</th>
              <th>Hectáreas</th>
              <th>Observaciones</th>
              <th>Predios</th>
              <th>Insumos(cantidad)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.fecha}</td>
                <td>{productosMap.get(c.producto_id) || "Desconocido"}</td>
                <td>{calidadesMap.get(c.calidad_id) || "Desconocido"}</td>
                <td>{c.toneladas}</td>
                <td>{c.hectareas}</td>
                <td>{c.observaciones?.trim() || "Sin observaciones"}</td>
                <td>{c.predios.map((p) => p.nombre).join(", ")}</td>
                <td className="insumos-cell">
                  {c.insumos.map((i) => (
                    <span key={i.insumo_id} className="insumo-item">
                      {i.nombre_comercial} ({i.cantidad})
                    </span>
                  ))}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => navigate(`/production/edit?id=${c.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(c.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="add-button-container">
          <button
            className="btn-add"
            onClick={() => navigate("/production/add")}
          >
            + Agregar Nueva Producción
          </button>
        </div>
      </main>
    </div>
  );
}
