import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Production.css";
import data from "../../BD_Keys.json";

const productosMap = new Map<number, string>(
  data.tipo_producto.map(p => [p.id, p.name])
);
const calidadesMap = new Map<number, string>(
  data.calidad.map(c => [c.id, c.name])
);

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

export default function Production() {
  const navigate = useNavigate();
  const [list, setList] = useState<Cosecha[]>([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [predioFiltro, setPredioFiltro] = useState("");
  const [productoFiltro, setProductoFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cosechas/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Cosecha[] = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar cosechas", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const cosecha = list.find(c => c.id === id);
    const mensaje = cosecha
      ? `¿Estás seguro de eliminar la producción con ID ${id} del producto "${productosMap.get(cosecha.producto_id)}"? Esta acción es irreversible.`
      : `¿Eliminar esta producción con ID ${id}?`;

    if (!confirm(mensaje)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/cosechas/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorMsg = await res.text(); // Captura error del backend
        throw new Error(errorMsg || `Error ${res.status}`);
      }

      // Eliminar de la lista local
      setList(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error("Error al eliminar", err);
      alert("No se pudo eliminar la producción.\n" + (err.message || ""));
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrado por nombres en lugar de id
  const filtered = list.filter(c => {
    const date = new Date(c.fecha);
    if (fechaDesde && date < new Date(fechaDesde)) return false;
    if (fechaHasta && date > new Date(fechaHasta)) return false;
    if (predioFiltro) {
      const match = c.predios.some(p =>
        p.nombre.toLowerCase().includes(predioFiltro.toLowerCase())
      );
      if (!match) return false;
    }
    if (productoFiltro) {
      const prodName = productosMap.get(c.producto_id) || "";
      if (!prodName.toLowerCase().includes(productoFiltro.toLowerCase()))
        return false;
    }
    return true;
  });

  return (
    <div className="production-container">
      <Sidebar />
      <main className="production-main">
        <div className="production-header">
          <h1 className="production-title">Producción</h1>
        </div>

        <div className="filters-section">
          <h3 className="filters-title">Filtros de Búsqueda</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Fecha Desde</label>
              <input
                type="date"
                className="filter-input"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Fecha Hasta</label>
              <input
                type="date"
                className="filter-input"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Predio (nombre)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Buscar por nombre de predio..."
                value={predioFiltro}
                onChange={e => setPredioFiltro(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Producto (nombre)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Buscar por nombre de producto..."
                value={productoFiltro}
                onChange={e => setProductoFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading">Cargando producciones...</div>
          ) : filtered.length === 0 ? (
            <div className="no-data">
              No se encontraron registros con los filtros aplicados.
            </div>
          ) : (
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
                  <th>Insumos(nombre:cantidad)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{new Date(c.fecha).toLocaleDateString("es-ES")}</td>
                    <td>{productosMap.get(c.producto_id) || "Desconocido"}</td>
                    <td>{calidadesMap.get(c.calidad_id) || "Desconocido"}</td>
                    <td>{c.toneladas} t</td>
                    <td>{c.hectareas} ha</td>
                    <td>{c.observaciones || "Sin observaciones"}</td>
                    <td className="predios-cell">
                      {c.predios.length > 0
                        ? c.predios.map(p => `${p.nombre}`).join(", ")
                        : "Sin predios"}
                    </td>
                    <td className="insumos-cell">
                      {c.insumos.length > 0
                        ? c.insumos.map(i => (
                            <div key={i.insumo_id} className="insumo-item">
                              {i.nombre_comercial}: {i.cantidad}
                            </div>
                          ))
                        : "Sin insumos"}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => navigate(`/production/edit?id=${c.id}`)}
                          title="Editar producción"
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          title="Eliminar producción"
                        >
                          {deletingId === c.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="add-button-container">
          <button
            className="btn btn-add"
            onClick={() => navigate("/production/add")}
          >
            + Agregar Nueva Producción
          </button>
        </div>
      </main>
    </div>
  );
}
