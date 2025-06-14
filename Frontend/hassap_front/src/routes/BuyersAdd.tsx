import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialForm = {
  nombre: "",
  tipo_doc: "",
  num_doc: "",
  ciudad: "",
  pais: "",
  direccion: "",
  contacto: "",
};

export default function BuyersAdd() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre) errs.nombre = "Nombre requerido";
    if (!form.tipo_doc) errs.tipo_doc = "Tipo de documento requerido";
    if (!/^\d+$/.test(form.num_doc)) errs.num_doc = "Solo números permitidos";
    if (!form.num_doc) errs.num_doc = "Número de documento requerido";
    if (!form.ciudad) errs.ciudad = "Ciudad requerida";
    if (!form.pais) errs.pais = "País requerido";
    if (!form.direccion) errs.direccion = "Dirección requerida";
    if (!form.contacto) errs.contacto = "Contacto requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await fetch(`${API_URL}/compradores/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tipo_doc: parseInt(form.tipo_doc) }),
    });
    setSuccess(true);
    setTimeout(() => navigate("/buyers"), 1500);
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Agregar Comprador</h1>
      {success && <div style={{ color: "green", textAlign: "center" }}>¡Comprador agregado con éxito!</div>}

      <div>
        <label>Nombre *</label>
        {errors.nombre && <div style={{ color: "red" }}>{errors.nombre}</div>}
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </div>

      <div>
        <label>Tipo de Documento *</label>
        {errors.tipo_doc && <div style={{ color: "red" }}>{errors.tipo_doc}</div>}
        <select
          value={form.tipo_doc}
          onChange={(e) => setForm({ ...form, tipo_doc: e.target.value })}
          className="form-select document-type-select"
        >
          <option value="">Seleccionar...</option>
          <option value={1}>Cédula de Ciudadanía</option>
          <option value={2}>NIT</option>
          <option value={3}>Cédula de Extranjería</option>
        </select>
      </div>

      <div>
        <label>Número de Documento *</label>
        {errors.num_doc && <div style={{ color: "red" }}>{errors.num_doc}</div>}
        <input
          placeholder="Número de Documento"
          value={form.num_doc}
          onChange={(e) => setForm({ ...form, num_doc: e.target.value })}
        />
      </div>

      <div>
        <label>Ciudad *</label>
        {errors.ciudad && <div style={{ color: "red" }}>{errors.ciudad}</div>}
        <input
          placeholder="Ciudad"
          value={form.ciudad}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
        />
      </div>

      <div>
        <label>País *</label>
        {errors.pais && <div style={{ color: "red" }}>{errors.pais}</div>}
        <input
          placeholder="País"
          value={form.pais}
          onChange={(e) => setForm({ ...form, pais: e.target.value })}
        />
      </div>

      <div>
        <label>Dirección *</label>
        {errors.direccion && <div style={{ color: "red" }}>{errors.direccion}</div>}
        <input
          placeholder="Dirección"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />
      </div>

      <div>
        <label>Contacto(correo o teléfono) *</label>
        {errors.contacto && <div style={{ color: "red" }}>{errors.contacto}</div>}
        <input
          placeholder="Contacto"
          value={form.contacto}
          onChange={(e) => setForm({ ...form, contacto: e.target.value })}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSubmit}>Añadir</button>
        <button onClick={() => navigate("/buyers")} style={{ marginLeft: "10px" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
