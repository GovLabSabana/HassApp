import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "../componentsStyles/CertificationsAdd.css";

// Interfaces
interface CertForm {
  archivo_pdf: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
}

type CertFormErrors = Partial<Record<keyof CertForm, string>>;

interface CertificacionPredio extends CertForm {
  id: number;
  predio_id: number;
  certificacion: {
    id: number;
    nombre: string;
  };
}

export default function CertificationPropEdit() {
  const [certificacion, setCertificacion] = useState<CertificacionPredio | null>(null);
  const [form, setForm] = useState<CertForm>({
    archivo_pdf: "",
    fecha_expedicion: "",
    fecha_vencimiento: "",
  });
  const [errors, setErrors] = useState<CertFormErrors>({});
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token") || "";
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  useEffect(() => {
    fetch(`${API_URL}/certificaciones-predio/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: CertificacionPredio) => {
        setCertificacion(data);
        setForm({
          archivo_pdf: data.archivo_pdf,
          fecha_expedicion: data.fecha_expedicion,
          fecha_vencimiento: data.fecha_vencimiento,
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error al cargar certificación");
      });
  }, [id]);

  const validate = () => {
    const newErrors: CertFormErrors = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.archivo_pdf) newErrors.archivo_pdf = "Campo obligatorio";
    if (!form.fecha_expedicion) newErrors.fecha_expedicion = "Campo obligatorio";
    if (!form.fecha_vencimiento) newErrors.fecha_vencimiento = "Campo obligatorio";

    if (form.fecha_expedicion > hoy)
      newErrors.fecha_expedicion = "No puede ser mayor al día actual";
    if (form.fecha_expedicion > form.fecha_vencimiento)
      newErrors.fecha_expedicion = "No puede ser mayor a la fecha de vencimiento";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const res = await fetch(`${API_URL}/certificaciones-predio/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error en la edición");
      toast.success("Certificación actualizada correctamente");
      navigate("/properties");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar certificación");
    }
  };

  if (!certificacion) return <div className="certadd-container">Cargando...</div>;

  return (
    <div className="certadd-container">
      <div className="certadd-form-wrapper">
        <h1 className="certadd-title">Editar Certificación</h1>
        <div className="certadd-form">
          <div className="certadd-row">
            <div className="certadd-field">
              <label className="certadd-label">Archivo PDF (URL)</label>
              <input
                type="text"
                name="archivo_pdf"
                className="certadd-input"
                value={form.archivo_pdf}
                onChange={handleChange}
              />
              {errors.archivo_pdf && <div className="certadd-error">{errors.archivo_pdf}</div>}
            </div>
          </div>

          <div className="certadd-row">
            <div className="certadd-field">
              <label className="certadd-label">Fecha de Expedición</label>
              <input
                type="date"
                name="fecha_expedicion"
                className="certadd-input"
                value={form.fecha_expedicion}
                onChange={handleChange}
              />
              {errors.fecha_expedicion && <div className="certadd-error">{errors.fecha_expedicion}</div>}
            </div>

            <div className="certadd-field">
              <label className="certadd-label">Fecha de Vencimiento</label>
              <input
                type="date"
                name="fecha_vencimiento"
                className="certadd-input"
                value={form.fecha_vencimiento}
                onChange={handleChange}
              />
              {errors.fecha_vencimiento && <div className="certadd-error">{errors.fecha_vencimiento}</div>}
            </div>
          </div>

          <div className="certadd-buttons">
            <button className="certadd-btn certadd-btn-secondary" onClick={() => navigate("/properties")}>Cancelar</button>
            <button className="certadd-btn certadd-btn-primary" onClick={handleSubmit}>Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}
