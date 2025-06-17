import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoriaInsumoSelector from "../components/forms/SelectInputCategory";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Inputs.css";
import data from "../../BD_Keys.json";

interface Insumo {
  id: number;
  nombre_comercial: string;
  unidad: string;
  categoria_id: number;
  proveedor_id: number;
  costo_unitario: string;
}

export default function Inputs() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filterCategoria, setFilterCategoria] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const categorias = data.categoria_insumo;
  const categoriaMap = categorias.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<number, string>);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInsumos();
  }, []);

  const fetchInsumos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/insumos/`);
      const data = await res.json();
      setInsumos(data);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este insumo?")) return;
    await fetch(`${API_URL}/insumos/${id}`, { method: "DELETE" });
    fetchInsumos();
  };

  const filtered = filterCategoria
    ? insumos.filter((i) => i.categoria_id === filterCategoria)
    : insumos;

  return (
    <div className="production-container">
      <Sidebar />
      <main className="production-main">
        <div className="production-header">
          <h1 className="production-title">Insumos</h1>
        </div>

        <div className="filters-section">
          <h3 className="filters-title">Filtro por Categoría</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Categoría</label>
              <div className="filter-input-group">
                <CategoriaInsumoSelector
                  value={filterCategoria || undefined}
                  onSelect={setFilterCategoria!}
                />
                <button className="btn-insumo-clear" onClick={() => setFilterCategoria(null)}>
                  Borrar Filtro
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading">Cargando insumos...</div>
          ) : filtered.length === 0 ? (
            <div className="no-data">
              No se encontraron insumos con el filtro aplicado.
            </div>
          ) : (
            <table className="production-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Comercial</th>
                  <th>Unidad</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Costo Unitario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ins => (
                  <tr key={ins.id}>
                    <td>{ins.id}</td>
                    <td>{ins.nombre_comercial}</td>
                    <td>{ins.unidad}</td>
                    <td>{categoriaMap[ins.categoria_id] || "Sin categoría"}</td>
                    <td>{ins.proveedor_id}</td>
                    <td>{ins.costo_unitario}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => navigate(`/inputs/edit?id=${ins.id}`)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(ins.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="insumo-actions-container">
          <button 
            className="btn-insumo-add" 
            onClick={() => navigate("/inputs/add")}
          >
            Añadir Insumo
          </button>
          
          <button 
            className="btn-insumo-history" 
            onClick={() => navigate("/inputs/consumption")}
          >
            Histórico de Consumo
          </button>
        </div>
      </main>
    </div>
  );
}