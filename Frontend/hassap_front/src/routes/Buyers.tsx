import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Buyers.css";
import Layout from "./layouts/menu";
import Loader from "../components/utils/Loader";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

interface Comprador {
  id: number;
  nombre: string;
  tipo_doc: number;
  num_doc: string;
  ciudad: string;
  pais: string;
  direccion: string;
  contacto: string;
}

export default function Buyers() {
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    ciudad: "",
    pais: "",
    tipoDoc: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchCompradores = async () => {
    const res = await fetch(`${API_URL}/compradores/`);
    const data = await res.json();
    setCompradores(data);
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>¿Estás seguro de eliminar este comprador?</p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${API_URL}/compradores/${id}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) throw new Error("Error al eliminar");
                  toast.success("Comprador eliminado correctamente.");
                  fetchCompradores();
                } catch (err) {
                  console.error(err);
                  toast.error("No se pudo eliminar el comprador.");
                }
                closeToast?.();
              }}
              style={{
                backgroundColor: "#d9534f",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
              }}
            >
              Confirmar
            </button>
            <button
              onClick={() => closeToast?.()}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        position: "top-center",
      }
    );
  };

  useEffect(() => {
    fetchCompradores();
  }, []);

  // Filtrar compradores
  const compradoresFiltrados = compradores.filter((comprador) => {
    return (
      comprador.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
      comprador.ciudad.toLowerCase().includes(filtros.ciudad.toLowerCase()) &&
      comprador.pais.toLowerCase().includes(filtros.pais.toLowerCase()) &&
      (filtros.tipoDoc === "" ||
        comprador.tipo_doc.toString() === filtros.tipoDoc)
    );
  });
  if (loading) return <Loader />;
  return (
    <>
      <h1 className="buyers-title">Compradores</h1>

      {/* Sección de filtros */}
      <div className="buyers-filters-section">
        <h3 className="buyers-filters-title">Filtros de Búsqueda</h3>
        <div className="buyers-filters-grid">
          <div className="buyers-filter-group">
            <label className="buyers-filter-label">Nombre</label>
            <input
              type="text"
              className="buyers-filter-input"
              placeholder="Buscar por nombre..."
              value={filtros.nombre}
              onChange={(e) =>
                setFiltros({ ...filtros, nombre: e.target.value })
              }
            />
          </div>

          <div className="buyers-filter-group">
            <label className="buyers-filter-label">Ciudad</label>
            <input
              type="text"
              className="buyers-filter-input"
              placeholder="Buscar por ciudad..."
              value={filtros.ciudad}
              onChange={(e) =>
                setFiltros({ ...filtros, ciudad: e.target.value })
              }
            />
          </div>

          <div className="buyers-filter-group">
            <label className="buyers-filter-label">País</label>
            <input
              type="text"
              className="buyers-filter-input"
              placeholder="Buscar por país..."
              value={filtros.pais}
              onChange={(e) => setFiltros({ ...filtros, pais: e.target.value })}
            />
          </div>

          <div className="buyers-filter-group">
            <label className="buyers-filter-label">Tipo de Documento</label>
            <select
              className="buyers-filter-input"
              value={filtros.tipoDoc}
              onChange={(e) =>
                setFiltros({ ...filtros, tipoDoc: e.target.value })
              }
            >
              <option value="">Todos los tipos</option>
              <option value="1">C.C.</option>
              <option value="2">NIT</option>
              <option value="3">C.E.</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de compradores */}
      <div className="buyers-table-container">
        <table className="buyers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo de Documento</th>
              <th>Número de Documento</th>
              <th>Ciudad</th>
              <th>País</th>
              <th>Dirección</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compradoresFiltrados.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td>{["", "C.C.", "NIT", "C.E."][c.tipo_doc]}</td>
                <td>{c.num_doc}</td>
                <td>{c.ciudad}</td>
                <td>{c.pais}</td>
                <td>{c.direccion}</td>
                <td>{c.contacto}</td>
                <td className="buyers-actions-cell">
                  <button
                    className="buyers-btn-edit"
                    onClick={() => navigate(`/buyers/edit?id=${c.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="buyers-btn-delete"
                    onClick={() => handleDelete(c.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón para agregar */}
      <div className="buyers-add-container">
        <button
          className="buyers-btn-add"
          onClick={() => navigate("/buyers/add")}
        >
          + Agregar Nuevo Comprador
        </button>
      </div>
    </>
  );
}
