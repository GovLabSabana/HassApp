import '../componentsStyles/Predios.css';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import data from "../../BD_Keys.json"; 

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

export default function Properties() {
  const [predios, setPredios] = useState<Predio[]>([]);
  const [municipioFiltro, setMunicipioFiltro] = useState("");
  const [vocacionFiltro, setVocacionFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;
  const municipios = data.municipios;

  const getNombreMunicipio = (id: string | number): string => {
    const found = municipios.find((m) => String(m.id) === String(id));
    return found ? found.name : "Desconocido";
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/predios/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPredios(data);
        } else if ("data" in data && Array.isArray(data.data)) {
          setPredios(data.data);
        } else {
          console.error("Respuesta inesperada de la API:", data);
        }
      })
      .catch((err) => console.error("Error al cargar predios:", err))
      .finally(() => setLoading(false));
  }, [API_URL, token]);

  const eliminarPredio = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este predio?")) {
      fetch(`${API_URL}/predios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(() => setPredios((prev) => prev.filter((p) => p.id !== id)))
        .catch((err) => console.error("Error al eliminar predio:", err));
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
    return (
      <div className="properties-container">
        <div className="properties-sidebar">
          <Sidebar />
        </div>
        <main className="properties-main">
          <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: '#6b7280' }}>
            Cargando predios...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="properties-container">
      {/* Sidebar fijo */}
      <div className="properties-sidebar">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <main className="properties-main">
        <h1 className="properties-title">Gestión de Predios</h1>

        {/* Filtros */}
        <div className="properties-filters">
          <h3 style={{ margin: 0, color: 'rgb(255, 255, 255)', fontSize: '1.1rem', fontWeight: '600' }}>
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

        {/* Tabla */}
        {prediosFiltrados.length === 0 ? (
          <div className="properties-table-empty">
            {predios.length === 0 ? 
              "No hay predios registrados" : 
              "No se encontraron predios que coincidan con los filtros"
            }
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
                      <td style={{ textTransform: 'capitalize' }}>{p.vocacion}</td>
                      <td>{p.altitud_promedio?.toLocaleString()} m</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.tipo_riego}</td>
                      <td>
                        <div className="properties-actions">
                          <button
                            className="properties-btn-edit"
                            onClick={() => navigate(`/properties/edit?id=${p.id}`)}
                          >
                            Editar
                          </button>
                          <button
                            className="properties-btn-delete"
                            onClick={() => eliminarPredio(p.id)}
                          >
                            Eliminar
                          </button>
                        </div>  
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {}
        <div className="properties-add-container">
          <button
            className="properties-btn-add"
            onClick={() => navigate("/properties/add")}
          >
            + Agregar Nuevo Predio
          </button>
        </div>
      </main>
    </div>
  );
}
