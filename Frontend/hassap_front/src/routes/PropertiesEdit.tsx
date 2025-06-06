import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export default function PropertiesEdit() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const predioId = params.get('id');
  const token = localStorage.getItem('access_token') || '';

  const [formData, setFormData] = useState({
    nombre: '',
    cedula_catastral: 0,
    municipio_id: 0,
    vereda: '',
    direccion: '',
    hectareas: 0,
    vocacion: '',
    altitud_promedio: 0,
    tipo_riego: '',
  });

  useEffect(() => {
    if (!predioId) return;
    fetch(`https://hassapp-production.up.railway.app/docs/predios/${predioId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setFormData(data))
      .catch((err) => console.error('Error cargando predio:', err));
  }, [predioId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['cedula_catastral', 'municipio_id', 'hectareas', 'altitud_promedio'].includes(name)
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://hassapp-production.up.railway.app/docs/predios/${predioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al actualizar el predio');
      navigate('/properties');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="properties-layout">
      <main className="properties-main">
        <h1>Editar Predio</h1>
        <form onSubmit={handleSubmit} className="form">
          {[
            ['Nombre', 'nombre'],
            ['Cédula Catastral', 'cedula_catastral'],
            ['Municipio ID', 'municipio_id'],
            ['Vereda', 'vereda'],
            ['Dirección', 'direccion'],
            ['Hectáreas', 'hectareas'],
            ['Altitud Promedio', 'altitud_promedio'],
          ].map(([label, name]) => (
            <div key={name}>
              <label>{label}</label>
              <input
                type={['cedula_catastral', 'municipio_id', 'hectareas', 'altitud_promedio'].includes(name) ? 'number' : 'text'}
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
              />
            </div>
          ))}

          <div>
            <label>Vocación</label>
            <select name="vocacion" value={formData.vocacion} onChange={handleChange}>
              <option value="">Seleccione</option>
              <option value="produccion">Producción</option>
              <option value="transformacion">Transformación</option>
              <option value="exportacion">Exportación</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          <div>
            <label>Tipo de Riego</label>
            <select name="tipo_riego" value={formData.tipo_riego} onChange={handleChange}>
              <option value="">Seleccione</option>
              <option value="manual">Manual</option>
              <option value="goteo">Goteo</option>
              <option value="aspersion">Aspersión</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          <button type="submit">Actualizar</button>
        </form>
      </main>
    </div>
  );
}
