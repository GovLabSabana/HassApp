import "../componentsStyles/Predios.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import data from "../../BD_Keys.json";
import Layout from "./layouts/menu";
import Loader from "../components/utils/Loader";
import { toast } from "react-toastify";

interface Predio {
  id: number;
  nombre: string;
  cedula_catastral: number;
  municipio_id: string;
  vereda: string;
  direccion: string;
  hectareas: number;
  vocacion: string;
  altitud_promedio: number;
  tipo_riego: string;
}

interface CertificacionPredio {
  id: number;
  archivo_pdf: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  certificacion: {
    id: number;
    nombre: string;
  };
  predio_id: number;
}

export default function Properties() {
  const [predios, setPredios] = useState<Predio[]>([]);
  const [certificaciones, setCertificaciones] = useState<CertificacionPredio[]>([]);
  const [municipioFiltro, setMunicipioFiltro] = useState("");
  const [vocacionFiltro, setVocacionFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;
  const [predioFiltroCert, setPredioFiltroCert] = useState<string>("");
  const municipios = data.municipios;

  const getNombreMunicipio = (id: string | number): string => {
    const found = municipios.find((m) => String(m.id) === String(id));
    return found ? found.name : "Desconocido";
  };

  const getNombrePredio = (id: number) => {
    const predio = predios.find((p) => p.id === id);
    return predio ? predio.nombre : "Desconocido";
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (predioFiltroCert) {
      fetchCertificacionesPorPredio(predioFiltroCert);
    } else {
      setCertificaciones([]);
    }
  }, [predioFiltroCert]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const predRes = await fetch(`${API_URL}/predios/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const predData = await predRes.json();
      setPredios(Array.isArray(predData) ? predData : predData.data || []);
      setCertificaciones([]); // vaciar si no hay predio seleccionado
    } catch (err) {
      console.error("Error al cargar datos:", err);
      toast.error("Error al cargar predios");
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificacionesPorPredio = async (predioId: string) => {
    if (!predioId) return setCertificaciones([]);
    try {
      const res = await fetch(`${API_URL}/certificaciones-predio/${predioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const certs = Array.isArray(data) ? data : [data];
      setCertificaciones(certs);
    } catch (err) {
      console.error("Error al filtrar certificaciones:", err);
      toast.error("Error al cargar certificaciones del predio");
      setCertificaciones([]);
    }
  };

  const ConfirmDeleteToast = ({
    onConfirm,
    onCancel,
  }: {
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <p>¿Estás seguro de que deseas eliminar este predio?</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button onClick={onCancel} style={{ background: "#ccc", border: "none", padding: "0.3rem 0.7rem" }}>
          Cancelar
        </button>
        <button onClick={onConfirm} style={{ background: "red", color: "white", border: "none", padding: "0.3rem 0.7rem" }}>
          Eliminar
        </button>
      </div>
    </div>
  );

  const eliminarPredio = (id: number) => {
    const toastId = toast.info(
      <ConfirmDeleteToast
        onConfirm={async () => {
          toast.dismiss(toastId);
          try {
            const res = await fetch(`${API_URL}/predios/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              const data = await res.json();
              toast.error(data.detail || "No se pudo eliminar el predio.");
              return;
            }

            setPredios((prev) => prev.filter((p) => p.id !== id));
            toast.success("Predio eliminado correctamente");
          } catch (err) {
            console.error("Error al eliminar predio:", err);
            toast.error("Error al eliminar el predio.");
          }
        }}
        onCancel={() => toast.dismiss(toastId)}
      />,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        position: "top-center",
      }
    );
  };

  const eliminarCertificacion = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta certificación?")) return;
    try {
      const res = await fetch(`${API_URL}/certificaciones-predio/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setCertificaciones((prev) => prev.filter((c) => c.id !== id));
      toast.success("Certificación eliminada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar certificación");
    }
  };

  const prediosFiltrados = predios.filter((p) => {
    const municipioNombre = getNombreMunicipio(p.municipio_id).toLowerCase();
    const filtroMunicipio = municipioFiltro.toLowerCase();
    return (
      (!municipioFiltro || municipioNombre.includes(filtroMunicipio)) &&
      (!vocacionFiltro || p.vocacion === vocacionFiltro)
    );
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <h1 className="properties-title">Gestión de Predios</h1>
      <div className="properties-filters">
        <h3 style={{ margin: 0, color: "rgb(255, 255, 255)", fontSize: "1.1rem", fontWeight: "600" }}>
          Filtros de búsqueda
        </h3>
        <div className="properties-filters-row">
          <input
            className="properties-filter-input"
            placeholder="Buscar por municipio"
            value={municipioFiltro}
            onChange={(e) => setMunicipioFiltro(e.target.value)}
          />
          <select
            className="properties-filter-select"
            value={vocacionFiltro}
            onChange={(e) => setVocacionFiltro(e.target.value)}
          >
            <option value="">Todas las vocaciones</option>
            <option value="produccion">Producción</option>
            <option value="transformacion">Transformación</option>
            <option value="exportacion">Exportación</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>
      </div>

      {/* Tabla de Predios */}
      {prediosFiltrados.length === 0 ? (
        <div className="properties-table-empty">
          {predios.length === 0 ? "No hay predios registrados" : "No se encontraron predios que coincidan con los filtros"}
        </div>
      ) : (
        <div className="properties-table-container">
          <div className="properties-table-wrapper">
            <table className="properties-table">
              <thead className="properties-table-header">
                <tr>
                  <th>Id</th>
                  <th>Nombre</th>
                  <th>Cédula Catastral</th>
                  <th>Municipio</th>
                  <th>Vereda</th>
                  <th>Dirección</th>
                  <th>Hectáreas</th>
                  <th>Vocación</th>
                  <th>Altitud (m)</th>
                  <th>Tipo de Riego</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="properties-table-body">
                {prediosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td className="id-column">{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.cedula_catastral?.toLocaleString()}</td>
                    <td>{getNombreMunicipio(p.municipio_id)}</td>
                    <td>{p.vereda?.trim() ? p.vereda : "No especificada"}</td>
                    <td>{p.direccion}</td>
                    <td>{p.hectareas?.toLocaleString()} ha</td>
                    <td style={{ textTransform: "capitalize" }}>{p.vocacion}</td>
                    <td>{p.altitud_promedio?.toLocaleString()} m</td>
                    <td style={{ textTransform: "capitalize" }}>{p.tipo_riego}</td>
                    <td>
                      <div className="properties-actions">
                        <button className="properties-btn-edit" onClick={() => navigate(`/properties/edit?id=${p.id}`)}>Editar</button>
                        <button className="properties-btn-delete" onClick={() => eliminarPredio(p.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="properties-add-container">
        <button className="properties-btn-add" onClick={() => navigate("/properties/add")}>+ Agregar Nuevo Predio</button>
      </div>

      <h2 className="certification-title">Certificaciones de Predios</h2>

      <div className="properties-filters">
        <h3 style={{ margin: 0, color: "rgb(255, 255, 255)", fontSize: "1.1rem", fontWeight: "600" }}>
          Certificaciones del predio seleccionado
        </h3>
        <div className="properties-filters-row">
          <select
            className="properties-filter-select"
            value={predioFiltroCert}
            onChange={(e) => setPredioFiltroCert(e.target.value)}
          >
            <option value="">Seleccione el predio</option>
            {predios.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Certificaciones */}
      {Array.isArray(certificaciones) && certificaciones.length > 0 ? (
        <div className="properties-table-container">
          <div className="properties-table-wrapper">
            <table className="properties-table">
              <thead className="properties-table-header">
                <tr>
                  <th>Predio</th>
                  <th>Certificación</th>
                  <th>Archivo</th>
                  <th>Fecha Expedición</th>
                  <th>Fecha Vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="properties-table-body">
                {certificaciones.map((c) => (
                  <tr key={c.id}>
                    <td>{getNombrePredio(c.predio_id)}</td>
                    <td>{c.certificacion.nombre}</td>
                    <td><a href={c.archivo_pdf} target="_blank" rel="noopener noreferrer">Ver archivo</a></td>
                    <td>{c.fecha_expedicion}</td>
                    <td>{c.fecha_vencimiento}</td>
                    <td>
                      <div className="properties-actions">
                        <button className="properties-btn-edit" onClick={() => navigate(`/properties/cert-edit?id=${c.id}`)}>Editar</button>
                        <button className="properties-btn-delete" onClick={() => eliminarCertificacion(c.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="properties-table-empty">No hay certificaciones registradas</div>
      )}

      <div className="properties-add-container">
        <button className="properties-btn-add" onClick={() => navigate("/properties/cert-add")}>+ Agregar Certificación</button>
      </div>
    </>
  );
}
