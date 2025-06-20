import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../componentsStyles/SuppliersAdd.css";

const initialForm = {
  nombre: "",
  tipo_doc: "",
  num_doc: "",
  ciudad: "",
  pais: "",
  direccion: "",
  contacto: "",
};

export default function SuppliersAdd() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(""); // Nuevo: error de backend
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token") || ""; // Agregamos el token

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre) errs.nombre = "Nombre requerido";
    if (!form.tipo_doc) {
      errs.tipo_doc = "Tipo de documento requerido";
    } else if (!/^\d+$/.test(form.tipo_doc)) {
      errs.tipo_doc = "Debe ser un valor numérico";
    }
    if (!form.num_doc) {
      errs.num_doc = "Número de documento requerido";
    } else if (!/^\d+$/.test(form.num_doc)) {
      errs.num_doc = "Solo números permitidos";
    }
    if (!form.ciudad) errs.ciudad = "Ciudad requerida";
    if (!form.pais) errs.pais = "País requerido";
    if (!form.direccion) errs.direccion = "Dirección requerida";
    if (!form.contacto) errs.contacto = "Contacto requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(""); // limpiamos error anterior
    if (!validate()) return;

    try {
      const response = await fetch(`${API_URL}/proveedores/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔐 Token JWT aquí
        },
        body: JSON.stringify({ ...form, tipo_doc: parseInt(form.tipo_doc) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setApiError(errorData.detail || "Error al registrar proveedor");
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/suppliers"), 1500);
    } catch (err) {
      console.error("Error al guardar proveedor:", err);
      setApiError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="supplieradd">
      <h1>Agregar Proveedor</h1>

      {success && <div className="success-message">¡Proveedor agregado con éxito!</div>}
      {apiError && <div className="error-message">{apiError}</div>}

      <div className="form-container">
        {/* Campos */}
        <div className="form-group">
          <label>Nombre *</label>
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          {errors.nombre && <div className="error-message">{errors.nombre}</div>}
        </div>

        <div className="form-group">
          <label>Tipo de Documento *</label>
          <select
            value={form.tipo_doc}
            onChange={(e) => setForm({ ...form, tipo_doc: e.target.value })}
          >
            <option value="">Seleccione</option>
            <option value={1}>Cédula de Ciudadanía</option>
            <option value={2}>Cédula de Extranjería</option>
            <option value={3}>NIT</option>
          </select>
          {errors.tipo_doc && <div className="error-message">{errors.tipo_doc}</div>}
        </div>

        <div className="form-group">
          <label>Número de Documento *</label>
          <input
            placeholder="Número de Documento"
            value={form.num_doc}
            onChange={(e) => setForm({ ...form, num_doc: e.target.value })}
          />
          {errors.num_doc && <div className="error-message">{errors.num_doc}</div>}
        </div>

        <div className="form-group">
          <label>Ciudad *</label>
          <input
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          />
          {errors.ciudad && <div className="error-message">{errors.ciudad}</div>}
        </div>

        <div className="form-group">
          <label>Dirección *</label>
          <input
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
          {errors.direccion && <div className="error-message">{errors.direccion}</div>}
        </div>

        <div className="form-group">
          <label>País *</label>
          <input
            placeholder="País"
            value={form.pais}
            onChange={(e) => setForm({ ...form, pais: e.target.value })}
          />
          {errors.pais && <div className="error-message">{errors.pais}</div>}
        </div>

        <div className="form-group">
          <label>Contacto (correo o teléfono) *</label>
          <input
            placeholder="Contacto"
            value={form.contacto}
            onChange={(e) => setForm({ ...form, contacto: e.target.value })}
          />
          {errors.contacto && <div className="error-message">{errors.contacto}</div>}
        </div>

        <div className="buttons-container">
          <button className="btn-primary-suppliersadd" onClick={handleSubmit}>
            GUARDAR
          </button>
          <button className="btn-secondary-suppliersadd" onClick={() => navigate("/suppliers")}>
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}
