import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

interface Predio {
  id: number;
  nombre: string;
  cedula_catastral: number;
  municipio: string;
  departamento: string;
  vereda: string;
  direccion: string;
  hectareas: number;
  vocacion: string;
  altitud_promedio: number;
  tipo_riego: string;
}

export default function Properties() {
  const [predios, setPredios] = useState<Predio[]>([]);
  const [municipioFiltro, setMunicipioFiltro] = useState('');
  const [vocacionFiltro, setVocacionFiltro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  fetch('https://hassapp-production.up.railway.app/docs/predios/')
    .then((res) => res.json())
    .then((data) => {
      // Verificamos si la respuesta es un array
      if (Array.isArray(data)) {
        setPredios(data);
      } else if ('data' in data && Array.isArray(data.data)) {
        setPredios(data.data); // si viene en una propiedad 'data'
      } else {
        console.error('Respuesta inesperada de la API:', data);
      }
    })
    .catch((err) => console.error('Error al cargar predios:', err));
}, []);

  const eliminarPredio = (id: number) => {
    fetch(`https://hassapp-production.up.railway.app/docs/predios/${id}`, {
      method: 'DELETE',
    })
      .then(() => setPredios((prev) => prev.filter((p) => p.id !== id)))
      .catch((err) => console.error('Error al eliminar predio:', err));
  };

  const prediosFiltrados = predios.filter(
    (p) =>
      (!municipioFiltro || p.municipio === municipioFiltro) &&
      (!vocacionFiltro || p.vocacion === vocacionFiltro)
  );

  return (
    <div className="properties-layout">
      <Navbar />
      <main className="properties-main">
        <h1 style={{ textAlign: 'center' }}>Predios</h1>

        <div className="filters">
          <input
            placeholder="Filtrar por municipio"
            value={municipioFiltro}
            onChange={(e) => setMunicipioFiltro(e.target.value)}
          />
          <select value={vocacionFiltro} onChange={(e) => setVocacionFiltro(e.target.value)}>
            <option value="">Todas las vocaciones</option>
            <option value="produccion">Producción</option>
            <option value="transformacion">Transformación</option>
            <option value="exportacion">Exportación</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>

        <table className="predios-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula Catastral</th>
              <th>Municipio</th>
              <th>Departamento</th>
              <th>Vereda</th>
              <th>Dirección</th>
              <th>Hectáreas</th>
              <th>Vocación</th>
              <th>Altitud</th>
              <th>Tipo de Riego</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prediosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.cedula_catastral}</td>
                <td>{p.municipio}</td>
                <td>{p.departamento}</td>
                <td>{p.vereda}</td>
                <td>{p.direccion}</td>
                <td>{p.hectareas}</td>
                <td>{p.vocacion}</td>
                <td>{p.altitud_promedio}</td>
                <td>{p.tipo_riego}</td>
                <td>
                  <button onClick={() => navigate(`/properties/edit?id=${p.id}`)}>Editar</button>
                  <button onClick={() => eliminarPredio(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={() => navigate('/properties/add')}>Agregar Predio</button>
        </div>
      </main>
    </div>
  );
}