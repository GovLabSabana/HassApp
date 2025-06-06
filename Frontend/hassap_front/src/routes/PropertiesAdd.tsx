import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";

export default function PropertiesAdd() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token") || "";

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

    // Validación en tiempo real para negativos
    if (isNumericField) {
      const numberValue = parseFloat(value);
      if (isNaN(numberValue) || numberValue < 0) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Este valor no puede ser negativo",
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

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const numericFields = [
      "cedula_catastral",
      "municipio_id",
      "hectareas",
      "altitud_promedio",
    ];

    for (const field of numericFields) {
      const value = formData[field as keyof typeof formData];
      if (typeof value === "number" && value < 0) {
        newErrors[field] = "Este valor no puede ser negativo";
      }
    }

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.vereda.trim()) newErrors.vereda = "La vereda es requerida";
    if (!formData.direccion.trim())
      newErrors.direccion = "La dirección es requerida";
    if (!formData.vocacion) newErrors.vocacion = "Seleccione una vocación";
    if (!formData.tipo_riego)
      newErrors.tipo_riego = "Seleccione un tipo de riego";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("🔐 Token obtenido de localStorage:", token);
    console.log("📦 Datos del formulario:", formData);
    console.log("✅ JSON final enviado:", JSON.stringify(formData, null, 2));

    try {
      const res = await fetch(
        "https://hassapp-production.up.railway.app/predios/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        console.error("Error en respuesta:", data);
        throw new Error("Error al agregar el predio");
      }
      console.log("📤 Header Authorization enviado:", `Bearer ${token}`);

      if (!res.ok) throw new Error("Error al agregar el predio");
      navigate("/properties");
    } catch (error) {
      console.error("❌ Error en la petición:", error);
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
    <div className="properties-layout">
      <main className="properties-main">
        <h1>Agregar Predio</h1>
        <form onSubmit={handleSubmit} className="form">
          {[
            ["Nombre", "nombre"],
            ["Cédula Catastral", "cedula_catastral"],
            ["Municipio ID", "municipio_id"],
            ["Vereda", "vereda"],
            ["Dirección", "direccion"],
            ["Hectáreas", "hectareas"],
            ["Altitud Promedio", "altitud_promedio"],
          ].map(([label, name]) => renderInput(label, name))}

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

          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate("/properties")}>
            Cancelar
          </button>
        </form>
      </main>
    </div>
  );
}
