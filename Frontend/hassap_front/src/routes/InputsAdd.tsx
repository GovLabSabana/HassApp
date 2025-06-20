import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoriaInsumoSelector from "../components/forms/SelectInputCategory";
import "../componentsStyles/Inputadd.css";

interface InsumoForm {
  nombre_comercial: string;
  unidad: string;
  categoria_id: number;
  proveedor_id: number;
  costo_unitario: string;
}

interface Proveedor {
  id: number;
  nombre: string;
}

export default function InputsAdd() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState<InsumoForm>({
    nombre_comercial: "",
    unidad: "",
    categoria_id: 0,
    proveedor_id: 0,
    costo_unitario: "",
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof InsumoForm, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_URL}/proveedores/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setProveedores(data);
      } else {
        console.error("La respuesta de proveedores no es un array:", data);
      }
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.nombre_comercial) errs.nombre_comercial = "Requerido";
    if (!form.unidad) errs.unidad = "Requerido";
    if (form.categoria_id <= 0) errs.categoria_id = "Debe seleccionar";
    if (form.proveedor_id <= 0) errs.proveedor_id = "Debe seleccionar";
    if (!form.costo_unitario || parseFloat(form.costo_unitario) <= 0)
      errs.costo_unitario = "Debe ser mayor a 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    const payload = {
      ...form,
      costo_unitario: parseFloat(form.costo_unitario),
    };

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_URL}/insumos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al crear insumo");

      setSuccessMessage("¡Insumo creado correctamente!");
      setTimeout(() => navigate("/inputs"), 2000);
    } catch (err) {
      console.error(err);
      setSuccessMessage(null);
    }
  };

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="form-container">
          <h1 className="form-title">Agregar Insumo</h1>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                value={form.nombre_comercial}
                onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })}
              />
              {errors.nombre_comercial && (
                <div className="error-message">{errors.nombre_comercial}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Unidad</label>
              <input
                className="form-input"
                value={form.unidad}
                onChange={(e) => setForm({ ...form, unidad: e.target.value })}
              />
              {errors.unidad && <div className="error-message">{errors.unidad}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <CategoriaInsumoSelector
                value={form.categoria_id}
                onSelect={(id) => setForm((f) => ({ ...f, categoria_id: id }))}
              />
              {errors.categoria_id && (
                <div className="error-message">{errors.categoria_id}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Proveedor</label>
              <select
                className="form-input"
                value={form.proveedor_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, proveedor_id: parseInt(e.target.value) }))
                }
              >
                <option value={0}>-- Selecciona un proveedor --</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {errors.proveedor_id && (
                <div className="error-message">{errors.proveedor_id}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Costo Unitario</label>
              <input
                className="form-input"
                type="number"
                value={form.costo_unitario}
                onChange={(e) => setForm({ ...form, costo_unitario: e.target.value })}
              />
              {errors.costo_unitario && (
                <div className="error-message">{errors.costo_unitario}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary-insumo" onClick={handleCreate}>
              GUARDAR
            </button>
            <button className="btn-secondary-insumo" onClick={() => navigate("/inputs")}>
              CANCELAR
            </button>
          </div>

          {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
      </div>
    </div>
  );
}
