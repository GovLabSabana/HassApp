import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../componentsStyles/Suppliers.css";
import data from "../../BD_Keys.json";

const API_URL = import.meta.env.VITE_API_URL;

interface Proveedor {
  id: number;
  nombre: string;
  tipo_doc: number;
  num_doc: string;
  ciudad: string;
  pais: string;
  direccion: string;
  contacto: string;
}

export default function Suppliers() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    ciudad: "",
    pais: "",
    tipoDoc: "",
  });

  const tipoDocMap: Record<number, string> = data.tipo_documento.reduce(
    (acc, tipo) => {
      acc[tipo.id] = tipo.name;
      return acc;
    },
    {} as Record<number, string>
  );

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token") || "";

  const fetchProveedores = async () => {
    try {
      const res = await fetch(`${API_URL}/proveedores/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No autorizado para ver proveedores");
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error("Error cargando proveedores:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    try {
      const res = await fetch(`${API_URL}/proveedores/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Error al eliminar: ${err}`);
      }
      fetchProveedores();
    } catch (err) {
      console.error(err);
      alert("No fue posible eliminar el proveedor. Revisa tus permisos.");
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const proveedoresFiltrados = proveedores.filter((p) => {
    return (
      p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
      p.ciudad.toLowerCase().includes(filtros.ciudad.toLowerCase()) &&
      p.pais.toLowerCase().includes(filtros.pais.toLowerCase()) &&
      (filtros.tipoDoc === "" || p.tipo_doc.toString() === filtros.tipoDoc)
    );
  });

  return (
    <>
      <h1 className="suppliers-title">Proveedores</h1>

      <div className="suppliers-filters-section">
        <h3 className="suppliers-filters-title">Filtros de Búsqueda</h3>
        <div className="suppliers-filters-grid">
          {["nombre", "ciudad", "pais"].map((field) => (
            <div className="suppliers-filter-group" key={field}>
              <label className="suppliers-filter-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                className="suppliers-filter-input"
                value={(filtros as any)[field]}
                onChange={(e) =>
                  setFiltros((s) => ({ ...s, [field]: e.target.value }))
                }
              />
            </div>
          ))}

          <div className="suppliers-filter-group">
            <label className="suppliers-filter-label">Tipo de Documento</label>
            <select
              className="suppliers-filter-input"
              value={filtros.tipoDoc}
              onChange={(e) =>
                setFiltros((s) => ({ ...s, tipoDoc: e.target.value }))
              }
            >
              <option value="">Todos los tipos</option>
              {Object.entries(tipoDocMap).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo Documento</th>
              <th>Número Documento</th>
              <th>Ciudad</th>
              <th>País</th>
              <th>Dirección</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{tipoDocMap[p.tipo_doc]}</td>
                <td>{p.num_doc}</td>
                <td>{p.ciudad}</td>
                <td>{p.pais}</td>
                <td>{p.direccion}</td>
                <td>{p.contacto}</td>
                <td className="suppliers-actions-cell">
                  <button
                    className="suppliers-btn-edit"
                    onClick={() => navigate(`/suppliers/edit?id=${p.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="suppliers-btn-delete"
                    onClick={() => handleDelete(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="suppliers-add-container">
        <button className="suppliers-btn-add" onClick={() => navigate("/suppliers/add")}>
          + Agregar Nuevo Proveedor
        </button>
      </div>
    </>
  );
}
