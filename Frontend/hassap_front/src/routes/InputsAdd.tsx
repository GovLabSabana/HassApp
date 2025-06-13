import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoriaInsumoSelector from "../components/forms/SelectInputCategory";
import ProveedorSelector from "../components/forms/SelectSupplier";

interface InsumoForm {
  nombre_comercial: string;
  unidad: string;
  categoria_id: number;
  proveedor_id: number;
  costo_unitario: string;
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

  const [errors, setErrors] = useState<Partial<Record<keyof InsumoForm, string>>>({});

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
    await fetch(`${API_URL}/insumos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    navigate("/inputs");
  };

  return (
    <div>
      <h1>Crear nuevo insumo</h1>

      <div>
        <label>Nombre comercial</label>
        <input
          value={form.nombre_comercial}
          onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })}
        />
        {errors.nombre_comercial && <div style={{ color: "red" }}>{errors.nombre_comercial}</div>}
      </div>

      <div>
        <label>Unidad</label>
        <input
          value={form.unidad}
          onChange={(e) => setForm({ ...form, unidad: e.target.value })}
        />
        {errors.unidad && <div style={{ color: "red" }}>{errors.unidad}</div>}
      </div>

      <div>
        <label>Categoría</label>
        <CategoriaInsumoSelector
          value={form.categoria_id}
          onSelect={(id) => setForm((f) => ({ ...f, categoria_id: id }))}
        />
        {errors.categoria_id && <div style={{ color: "red" }}>{errors.categoria_id}</div>}
      </div>

      <div>
        <label>Proveedor</label>
        <ProveedorSelector
          value={form.proveedor_id}
          onSelect={(id) => setForm((f) => ({ ...f, proveedor_id: id }))}
        />
        {errors.proveedor_id && <div style={{ color: "red" }}>{errors.proveedor_id}</div>}
      </div>

      <div>
        <label>Costo unitario</label>
        <input
          type="number"
          value={form.costo_unitario}
          onChange={(e) => setForm({ ...form, costo_unitario: e.target.value })}
        />
        {errors.costo_unitario && <div style={{ color: "red" }}>{errors.costo_unitario}</div>}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleCreate}>Crear</button>
        <button onClick={() => navigate("/inputs")}>Cancelar</button>
      </div>
    </div>
  );
}
