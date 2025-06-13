import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategoriaInsumoSelector from "../components/forms/SelectInputCategory";
import ProveedorSelector from "../components/forms/SelectSupplier";

interface InsumoForm {
  nombre_comercial: string;
  unidad: string;
  categoria_id: number;
  proveedor_id: number;
  costo_unitario: string;
}

export default function InputsEdit() {
  const [searchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const id = searchParams.get("id");
  const isEdit = !!id;
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

  useEffect(() => {
    if (isEdit) fetchInsumo();
  }, [isEdit]);

  const fetchInsumo = async () => {
    const res = await fetch(`${API_URL}/insumos/${id}`);
    const data = await res.json();
    setForm({
      nombre_comercial: data.nombre_comercial,
      unidad: data.unidad,
      categoria_id: data.categoria_id,
      proveedor_id: data.proveedor_id,
      costo_unitario: data.costo_unitario,
    });
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

  const handleSubmit = async () => {
    if (!validate()) return;

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `${API_URL}/insumos/${id}`
      : `${API_URL}/insumos/`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Error al guardar el insumo");

      setSuccessMessage(isEdit ? "¡Insumo editado correctamente!" : "¡Insumo creado correctamente!");

      setTimeout(() => {
        navigate("/inputs");
      }, 2000); // Redirige luego de 2 segundos

    } catch (err) {
      console.error(err);
      setSuccessMessage(null); // Evita mostrar el mensaje si ocurre error
    }
  };

  return (
    <div>
      <h1>{isEdit ? "Editar" : "Crear"} Insumo</h1>
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
        <button onClick={handleSubmit}>{isEdit ? "Guardar cambios" : "Crear"}</button>
        <button onClick={() => navigate("/inputs")}>Cancelar</button>
      </div>

      {successMessage && (
        <div style={{ color: "green", marginTop: 10 }}>{successMessage}</div>
      )}
    </div>
  );
}
