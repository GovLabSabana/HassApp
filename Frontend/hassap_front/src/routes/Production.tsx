import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Production.css";

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

interface Producto {
  id: number;
  nombre: string;
}

interface Calidad {
  id: number;
  name: string;
}

interface Cosecha {
  id: number;
  fecha: string;
  producto: Producto | null;
  calidad: Calidad | null;
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
  const [predioId, setPredioId] = useState("");
  const [productoId, setProductoId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/cosechas/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: Cosecha[] = await res.json();
      // Asegurar que los datos sean un array
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar las cosechas", err);
      setList([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar esta producción?")) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/cosechas/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      
      console.log(`Eliminando cosecha con ID: ${id}`);
      console.log(`URL: ${API_URL}/cosechas/${id}`);
      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        console.log("Cosecha eliminada exitosamente");
        // Actualizar la lista localmente para feedback inmediato
        setList(prevList => prevList.filter(item => item.id !== id));
        // También hacer fetch para asegurar sincronización
        await fetchData();
      } else {
        const errorText = await response.text();
        console.error(`Error al eliminar: ${response.status} - ${errorText}`);
        alert(`Error al eliminar la producción: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Error al eliminar cosecha", err);
      alert("Error de conexión al eliminar la producción. Intente nuevamente.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = list.filter((c) => {
  const fechaCosecha = new Date(c.fecha);

  if (fechaDesde) {
    const desde = new Date(fechaDesde);
    if (fechaCosecha < desde) return false;
  }

  if (fechaHasta) {
    const hasta = new Date(fechaHasta);
    if (fechaCosecha > hasta) return false;
  }

  if (predioId.trim() !== "") {
    const predioExiste = c.predios?.some((p) =>
      p.id.toString().includes(predioId.trim())
    );
    if (!predioExiste) return false;
  }

  if (productoId.trim() !== "") {
    if (!c.producto || !c.producto.id.toString().includes(productoId.trim())) {
      return false;
    }
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

        {/* Sección de Filtros */}
        <div className="filters-section">
          <h3 className="filters-title">Filtros de Búsqueda</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Fecha Desde</label>
              <input
                type="date"
                className="filter-input"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Fecha Hasta</label>
              <input
                type="date"
                className="filter-input"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">ID Predio</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Buscar por ID de predio..."
                value={predioId}
                onChange={(e) => setPredioId(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">ID Producto</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Buscar por ID de producto..."
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla de Producción */}
        <div className="table-container">
          {loading ? (
            <div className="loading">Cargando datos de producción...</div>
          ) : filtered.length === 0 ? (
            <div className="no-data">
              No se encontraron registros de producción con los filtros aplicados.
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
                  <th>Insumos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{new Date(c.fecha).toLocaleDateString('es-ES')}</td>
                    <td>
                      {c.producto 
                        ? `${c.producto.nombre} (ID: ${c.producto.id})` 
                        : 'N/A'
                      }
                    </td>
                    <td>{c.calidad?.name ?? 'N/A'}</td>
                    <td>{c.toneladas} t</td>
                    <td>{c.hectareas} ha</td>
                    <td>{c.observaciones || 'Sin observaciones'}</td>
                    <td className="predios-cell">
                      {c.predios.length > 0 
                        ? c.predios.map(p => `${p.nombre} (${p.id})`).join(', ')
                        : 'Sin predios'
                      }
                    </td>
                    <td className="insumos-cell">
                      {c.insumos.length > 0 ? (
                        c.insumos.map(i => (
                          <div key={i.insumo_id} className="insumo-item">
                            {i.nombre_comercial}: {i.cantidad}
                          </div>
                        ))
                      ) : (
                        'Sin insumos'
                      )}
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

        {/* Botón Agregar centrado */}
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