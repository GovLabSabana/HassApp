import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Export.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Export() {
  const [exportaciones, setExportaciones] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroComprador, setFiltroComprador] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [compradores, setCompradores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExportaciones();
    fetchCompradores();
  }, []);

  const fetchExportaciones = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_URL}/exportaciones/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setExportaciones(data);
  };

  const fetchCompradores = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_URL}/compradores`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setCompradores(data);
  };

  const eliminarExportacion = async (id) => {
    console.log(`¿Confirmas eliminar la exportación con ID ${id}?`);
    const confirmar = window.confirm(
      `¿Deseas eliminar la exportación con ID ${id}?`
    );
    if (!confirmar) return;
    const token = localStorage.getItem("access_token");
    await fetch(`${API_URL}/exportaciones/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchExportaciones();
  };

  const getNombreComprador = (id) => {
    const comprador = compradores.find((c) => c.id === id);
    return comprador ? comprador.nombre : "Desconocido";
  };

  const exportacionesFiltradas = exportaciones.filter((exp) => {
    const fechaExp = new Date(exp.fecha);
    const desdeOk = !filtroFecha || fechaExp >= new Date(filtroFecha);
    const hastaOk = !fechaHasta || fechaExp <= new Date(fechaHasta);
    const metodoOk =
      !filtroMetodo ||
      exp.metodo_salida.toLowerCase().includes(filtroMetodo.toLowerCase());

    const compradorNombre = getNombreComprador(exp.comprador_id).toLowerCase();
    const compradorOk =
      !filtroComprador ||
      compradorNombre.includes(filtroComprador.toLowerCase());

    return desdeOk && hastaOk && metodoOk && compradorOk;
  });

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
              <th className="export-table-th">VALOR FOB</th>
              <th className="export-table-th">PUERTO SALIDA</th>
              <th className="export-table-th">PUERTO LLEGADA</th>
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
                <td className="export-table-td">{exp.valor_fob}</td>
                <td className="export-table-td">{exp.puerto_salida}</td>
                <td className="export-table-td">{exp.puerto_llegada}</td>
                <td className="export-table-td">
                  {getNombreComprador(exp.comprador_id)}
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
