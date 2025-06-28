import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Export.css";
import Loader from "../components/utils/Loader";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export default function Export() {
  const [exportaciones, setExportaciones] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [loading, setLoading] = useState(true);
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroComprador, setFiltroComprador] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExportaciones();
  }, []);

  const fetchExportaciones = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_URL}/exportaciones/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setExportaciones(data);
    } catch (err) {
      console.error("Error al obtener exportaciones:", err);
      setExportaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const eliminarExportacion = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>¿Deseas eliminar la exportación con ID {id}?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("access_token");
                  const res = await fetch(`${API_URL}/exportaciones/${id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  if (!res.ok) throw new Error("Error al eliminar.");
                  toast.success("Exportación eliminada correctamente.");
                  fetchExportaciones();
                } catch (err) {
                  console.error(err);
                  toast.error("No se pudo eliminar la exportación.");
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

  const exportacionesFiltradas = exportaciones.filter((exp) => {
    const fechaExp = new Date(exp.fecha);
    const desdeOk = !filtroFecha || fechaExp >= new Date(filtroFecha);
    const hastaOk = !fechaHasta || fechaExp <= new Date(fechaHasta);
    const metodoOk =
      !filtroMetodo ||
      exp.metodo_salida.toLowerCase().includes(filtroMetodo.toLowerCase());

    const compradorNombre = (exp.comprador || "").toLowerCase();
    const compradorOk =
      !filtroComprador ||
      compradorNombre.includes(filtroComprador.toLowerCase());

    return desdeOk && hastaOk && metodoOk && compradorOk;
  });

  if (loading) return <Loader />;
  return (
    <>
      <h1 className="export-title">Exportación</h1>

      <div className="export-filters">
        <h3 className="export-filters-title">Filtros de Búsqueda</h3>
        <div className="export-filters-row">
          <div className="export-filter-group">
            <label className="export-filter-label">Fecha Desde</label>
            <input
              type="date"
              className="export-filter-input"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div className="export-filter-group">
            <label className="export-filter-label">Fecha Hasta</label>
            <input
              type="date"
              className="export-filter-input"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div className="export-filter-group">
            <label className="export-filter-label">Método (nombre)</label>
            <input
              type="text"
              className="export-filter-input"
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
            />
          </div>
          <div className="export-filter-group">
            <label className="export-filter-label">Comprador (nombre)</label>
            <input
              type="text"
              className="export-filter-input"
              value={filtroComprador}
              onChange={(e) => setFiltroComprador(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="export-table-container">
        <table className="export-table">
          <thead className="export-table-header">
            <tr>
              <th className="export-table-th">ID</th>
              <th className="export-table-th">FECHA</th>
              <th className="export-table-th">MÉTODO</th>
              <th className="export-table-th">TONELADAS</th>
              <th className="export-table-th">VALOR FOB(USD)</th>
              <th className="export-table-th">TERMINAL SALIDA</th>
              <th className="export-table-th">TERMINAL LLEGADA</th>
              <th className="export-table-th">COMPRADOR</th>
              <th className="export-table-th">COSECHAS</th>
              <th className="export-table-th">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="export-table-body">
            {exportacionesFiltradas.map((exp) => (
              <tr key={exp.id} className="export-table-row">
                <td className="export-table-td export-table-id">{exp.id}</td>
                <td className="export-table-td">{exp.fecha}</td>
                <td className="export-table-td">{exp.metodo_salida}</td>
                <td className="export-table-td">{exp.toneladas}</td>
                <td className="export-table-td">${exp.valor_fob}</td>
                <td className="export-table-td">{exp.puerto_salida}</td>
                <td className="export-table-td">{exp.puerto_llegada}</td>
                <td className="export-table-td">
                  {exp.comprador || "Desconocido"}
                </td>
                <td className="export-table-td">
                  {exp.cosecha_ids.join(", ")}
                </td>
                <td className="export-table-td export-table-actions">
                  <button
                    className="export-btn export-btn-edit"
                    onClick={() => navigate(`/export/edit?id=${exp.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="export-btn export-btn-delete"
                    onClick={() => eliminarExportacion(exp.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="export-actions">
        <button
          className="export-btn export-btn-add"
          onClick={() => navigate("/export/add")}
        >
          + Agregar Nueva Exportación
        </button>
        <button
          className="export-btn export-btn-add"
          onClick={() => navigate("/export/history")}
        >
          Historial de Exportaciones
        </button>
      </div>
    </>
  );
}
