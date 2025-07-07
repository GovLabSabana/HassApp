import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../componentsStyles/BuyersAdd.css";
import { toast } from "react-toastify";
import Loader from "../components/utils/Loader";

const initialForm = {
  nombre: "",
  tipo_doc: "",
  num_doc: "",
  ciudad: "",
  pais: "",
  direccion: "",
  contacto: "",
};

interface TipoDocumento {
  id: number;
  name: string;
}

export default function BuyersAdd() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/tipo-documento/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error al obtener tipos de documento");
        const data = await res.json();
        setTiposDocumento(data);
      } catch (err) {
        console.error("Error al cargar tipos de documento:", err);
        toast.error("No se pudieron cargar los tipos de documento.");
      }
    };

    fetchTiposDocumento();
  }, []);

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/compradores/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tipo_doc: parseInt(form.tipo_doc) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.detail || "Error al registrar comprador.");
        return;
      }

      toast.success("Comprador registrado exitosamente.");
      setSuccess(true);
    } catch (err) {
      console.error("Error al registrar comprador:", err);
      toast.error("Error de conexión con el servidor.");
    } finally {
      navigate("/buyers");
      setLoading(false);
    }
  };
  if (loading) return <Loader text="Agregando Comprador" />;
  return (
    <div className="buyeradd">
      <h1>Agregar Comprador</h1>

      <div className="form-container">
        <div className="form-group">
          <label>Nombre *</label>
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          {errors.nombre && (
            <div className="error-message">{errors.nombre}</div>
          )}
        </div>

        <div className="form-group">
          <label>Número de Documento *</label>
          <input
            placeholder="Número de Documento"
            value={form.num_doc}
            onChange={(e) => setForm({ ...form, num_doc: e.target.value })}
          />
          {errors.num_doc && (
            <div className="error-message">{errors.num_doc}</div>
          )}
        </div>

        <div className="form-group">
          <label>Ciudad *</label>
          <input
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          />
          {errors.ciudad && (
            <div className="error-message">{errors.ciudad}</div>
          )}
        </div>

        <div className="form-group">
          <label>Dirección *</label>
          <input
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
          {errors.direccion && (
            <div className="error-message">{errors.direccion}</div>
          )}
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
          {errors.contacto && (
            <div className="error-message">{errors.contacto}</div>
          )}
        </div>

        <div className="form-group">
          <label>Tipo de Documento *</label>
          <select
            value={form.tipo_doc}
            onChange={(e) => setForm({ ...form, tipo_doc: e.target.value })}
          >
            <option value="">Seleccione</option>
            {tiposDocumento.map((td) => (
              <option key={td.id} value={td.id}>
                {td.name}
              </option>
            ))}
          </select>
          {errors.tipo_doc && (
            <div className="error-message">{errors.tipo_doc}</div>
          )}
        </div>

        <div className="buttons-container">
          <button className="btn-primary-buyersadd" onClick={handleSubmit}>
            GUARDAR
          </button>
          <button
            className="btn-secondary-buyersadd"
            onClick={() => navigate("/buyers")}
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}
