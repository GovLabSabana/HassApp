import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../componentsStyles/Prediosadd.css';
import MunicipioSelector from "../components/forms/SelectMunicipio";

export default function PropertiesEdit() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const predioId = params.get('id');
  const token = localStorage.getItem('access_token') || '';
  const API_URL = import.meta.env.VITE_API_URL;

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!predioId) return;
    fetch(`${API_URL}/predios/${predioId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) =>
        setFormData((prev) => ({
          ...prev,
          ...data,
        }))
      )
      .catch((err) => console.error('Error cargando predio:', err));
  }, [predioId]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    for (const key in formData) {
      if (key === 'vereda') continue;
      const value = formData[key as keyof typeof formData];

      if (typeof value === 'string' && value.trim() === '') {
        newErrors[key] = 'Este campo es obligatorio';
      }

      if (typeof value === 'number' && value <= 0) {
        newErrors[key] = 'Debe ser un número mayor que cero';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['cedula_catastral', 'municipio_id', 'hectareas', 'altitud_promedio'].includes(name)
        ? parseFloat(value)
        : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // limpiar error al cambiar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      const res = await fetch(`${API_URL}/predios/${predioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const newErrors: { [key: string]: string } = {};

        if (res.status === 422 && Array.isArray(data.detail)) {
          data.detail.forEach((error: any) => {
            const field = error.loc?.[error.loc.length - 1];
            const msg = error.msg || 'Error en el campo';
            if (typeof field === 'string') {
              newErrors[field] = msg;
            }
          });
        } else {
          alert(data.detail || 'Error al actualizar el predio.');
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }

      alert('Predio actualizado con éxito.');
      navigate('/properties');
    } catch (error) {
      alert('Error en la petición');
    }
  };

  return (
    <div className="add-properties-layout">
      <main className="add-properties-main">
        <h1>Editar Predio</h1>
        <form onSubmit={handleSubmit} className="add-form">
          {[
            ['Nombre', 'nombre'],
            ['Cédula Catastral', 'cedula_catastral'],
            ['Dirección', 'direccion'],
            ['Hectáreas', 'hectareas'],
            ['Altitud Promedio', 'altitud_promedio'],
            ['Vereda (opcional)', 'vereda'],
          ].map(([label, name]) => (
            <div key={name}>
              <label>{label}</label>
              {errors[name] && <p className="form-error">{errors[name]}</p>}
              <input
                type={['cedula_catastral', 'hectareas', 'altitud_promedio'].includes(name) ? 'number' : 'text'}
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
              />
            </div>
          ))}


          <div>
            <label>Tipo de Riego</label>
            {errors.tipo_riego && <p className="form-error">{errors.tipo_riego}</p>}
            <select name="tipo_riego" value={formData.tipo_riego} onChange={handleChange}>
              <option value="">Seleccione</option>
              <option value="manual">Manual</option>
              <option value="goteo">Goteo</option>
              <option value="aspersion">Aspersión</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          <div>
            <label>Vocación</label>
            {errors.vocacion && <p className="form-error">{errors.vocacion}</p>}
            <select name="vocacion" value={formData.vocacion} onChange={handleChange}>
              <option value="">Seleccione</option>
              <option value="produccion">Producción</option>
              <option value="transformacion">Transformación</option>
              <option value="exportacion">Exportación</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          <div>
            <label>Municipio</label>
            <div className='municipio-selector'>
              {errors.municipio_id && <p className="form-error">{errors.municipio_id}</p>}
            <MunicipioSelector
              value={formData.municipio_id}
              onSelect={(id) => {
                setFormData((prev) => ({ ...prev, municipio_id: id }));
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.municipio_id;
                  return newErrors;
                });
              }}
            />
            </div>
            
          </div>

          

          <button type="submit">Actualizar</button>
          <button type="button" onClick={() => navigate('/properties')}>
            Cancelar
          </button>
        </form>
      </main>
    </div>
  );
}
