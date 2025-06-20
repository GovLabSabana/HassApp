import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../componentsStyles/Prediosadd.css";
import MunicipioSelector from "../components/forms/SelectMunicipio";

export default function PropertiesAdd() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    nombre: "",
    cedula_catastral: 0,
    municipio_id: 0,
    vereda: "",
    direccion: "",
    hectareas: 0,
    vocacion: "",
    altitud_promedio: 0,
    tipo_riego: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumericField = [
      "cedula_catastral",
      "municipio_id",
      "hectareas",
      "altitud_promedio",
    ].includes(name);
    const parsedValue = isNumericField ? parseFloat(value) : value;

    if (isNumericField) {
      const numberValue = parseFloat(value);
      if (isNaN(numberValue) || numberValue <= 0) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Este valor debe ser mayor que cero",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      setFormData((prev) => ({
        ...prev,
        [name]: numberValue,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const requiredFields = [
      "nombre",
      "cedula_catastral",
      "municipio_id",
      "direccion",
      "hectareas",
      "vocacion",
      "altitud_promedio",
      "tipo_riego",
    ];

    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (
        value === "" ||
        (typeof value === "number" && (value <= 0 || isNaN(value)))
      ) {
        newErrors[field] =
          typeof value === "number"
            ? "Este valor debe ser mayor que cero"
            : "Este campo es requerido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      const res = await fetch(`${API_URL}/predios/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            const msg = error.msg || "Error en el campo";
            if (typeof field === "string") {
              newErrors[field] = msg;
            }
          });
        } else {
          alert(data.detail || "Error al agregar el predio.");
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }

      alert("Predio creado con éxito.");
      navigate("/Properties");
    } catch (error) {
      alert("Error en la petición");
    }
  };

  const renderInput = (label: string, name: string) => (
    <div key={name} style={{ marginBottom: "1rem" }}>
      {errors[name] && (
        <div style={{ color: "red", fontSize: "0.9rem" }}>{errors[name]}</div>
      )}
      <label>{label}</label>
      <input
        type={
          [
            "cedula_catastral",
            "municipio_id",
            "hectareas",
            "altitud_promedio",
          ].includes(name)
            ? "number"
            : "text"
        }
        name={name}
        value={formData[name as keyof typeof formData]}
        onChange={handleChange}
      />
    </div>
  );

  return (
    <div className="add-properties-layout">
      <main className="add-properties-main">
        <h1>Agregar Predio</h1>
        <form onSubmit={handleSubmit} className="add-form">
          {[
            ["Nombre", "nombre"],
            ["Cédula Catastral", "cedula_catastral"],
            ["Vereda (opcional)", "vereda"],
            ["Dirección", "direccion"],
            ["Hectáreas", "hectareas"],
            ["Altitud Promedio", "altitud_promedio"],
          ].map(([label, name]) => renderInput(label, name))}
          <div style={{ marginBottom: "1rem" }}>
            {errors.tipo_riego && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>
                {errors.tipo_riego}
              </div>
            )}
            <label>Tipo de Riego</label>
            <select
              name="tipo_riego"
              value={formData.tipo_riego}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              <option value="manual">Manual</option>
              <option value="goteo">Goteo</option>
              <option value="aspersion">Aspersión</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            {errors.vocacion && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>
                {errors.vocacion}
              </div>
            )}
            <label>Vocación</label>
            <select
              name="vocacion"
              value={formData.vocacion}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              <option value="produccion">Producción</option>
              <option value="transformacion">Transformación</option>
              <option value="exportacion">Exportación</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            {errors.municipio_id && (
              <div style={{ color: "red", fontSize: "0.9rem" }}>
                {errors.municipio_id}
              </div>
            )}
            <label>Municipio</label>
            <div className="municipio-selector">
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

          

          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate("/Properties")}>
            Cancelar
          </button>
        </form>
      </main>
    </div>
  );
}
