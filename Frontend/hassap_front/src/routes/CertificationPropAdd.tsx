import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../componentsStyles/CertificationsAdd.css";

// Interfaces
interface Predio {
  id: number;
  nombre: string;
}

interface Certificacion {
  id: number;
  nombre: string;
}

interface CertForm {
  predio_id: string;
  archivo_pdf: File | null;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  certificacion_id: string;
}

type CertFormErrors = Partial<Record<keyof CertForm, string>>;

export default function CertificationPropAdd() {
  const [predios, setPredios] = useState<Predio[]>([]);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [form, setForm] = useState<CertForm>({
    predio_id: "",
    archivo_pdf: null,
    fecha_expedicion: "",
    fecha_vencimiento: "",
    certificacion_id: "",
  });
  const [errors, setErrors] = useState<CertFormErrors>({});
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token") || "";
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/predios/`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/certificaciones/`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([res1, res2]) => {
        const data1 = await res1.json();
        const data2 = await res2.json();
        setPredios(data1);
        setCertificaciones(data2);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error al cargar datos");
      });
  }, []);

  const validate = () => {
    const newErrors: CertFormErrors = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.predio_id) newErrors.predio_id = "Campo obligatorio";
    if (!form.archivo_pdf) newErrors.archivo_pdf = "Campo obligatorio";
    if (!form.fecha_expedicion) {
      newErrors.fecha_expedicion = "Campo obligatorio";
    } else {
      if (form.fecha_expedicion > hoy) newErrors.fecha_expedicion = "No puede ser futura";
      if (form.fecha_vencimiento && form.fecha_expedicion > form.fecha_vencimiento)
        newErrors.fecha_expedicion = "No puede ser mayor a la fecha de vencimiento";
    }

    if (!form.fecha_vencimiento) {
      newErrors.fecha_vencimiento = "Campo obligatorio";
    } else {
      if (form.fecha_vencimiento < hoy)
        newErrors.fecha_vencimiento = "No puede ser menor al día actual";
    }

    if (!form.certificacion_id) newErrors.certificacion_id = "Campo obligatorio";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setForm({ ...form, archivo_pdf: file });
    }
  };

  const handleSubmit = async () => {
    if (!validate() || !form.archivo_pdf) return;

    try {
        const predioId = parseInt(form.predio_id);
        const certificacionId = parseInt(form.certificacion_id);
        const certificacion = certificaciones.find(c => c.id === certificacionId);

        if (!certificacion) {
        toast.error("Certificación inválida");
        return;
        }

        // Construcción del objeto JSON esperado
        const bodyJson = {
        id: predioId,  // ← este es el ID del predio
        archivo_pdf: form.archivo_pdf.name,
        fecha_expedicion: form.fecha_expedicion,
        fecha_vencimiento: form.fecha_vencimiento,
        certificacion: {
            id: certificacion.id,
            nombre: certificacion.nombre,
        }
        };

        // Mostrar en consola el JSON enviado (para debug)
        console.log("JSON enviado:", JSON.stringify(bodyJson, null, 2));

        // Crear FormData
        const formData = new FormData();
        formData.append("archivo_pdf", form.archivo_pdf);
        formData.append("data", new Blob([JSON.stringify(bodyJson)], { type: "application/json" }));

        // Hacer la petición
        const res = await fetch(`${API_URL}/certificaciones-predio/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
        });

        if (!res.ok) throw new Error("Error en la creación");

        toast.success("Certificación creada correctamente");
        navigate("/properties");

    } catch (err) {
        console.error(err);
        toast.error("Error al agregar certificación");
    }
    };

  return (
    <div className="certadd-container">
      <div className="certadd-form-wrapper">
        <h1 className="certadd-title">Agregar Certificación</h1>
        <div className="certadd-form">
          <div className="certadd-row">
            <div className="certadd-field">
              {errors.predio_id && <div className="certadd-error">{errors.predio_id}</div>}
              <label className="certadd-label">Predio</label>
              <select
                name="predio_id"
                className="certadd-select"
                value={form.predio_id}
                onChange={handleChange}
              >
                <option value="">Seleccione un predio</option>
                {predios.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div className="certadd-field">
              {errors.archivo_pdf && <div className="certadd-error">{errors.archivo_pdf}</div>}
              <label className="certadd-label">Archivo PDF</label>
              <input
                type="file"
                name="archivo_pdf"
                accept="application/pdf"
                className="certadd-input"
                onChange={handleFileChange}
              />
              {form.archivo_pdf && (
                <a
                    href={URL.createObjectURL(form.archivo_pdf)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#4ade80", marginTop: 4 }}
                >
                    Ver archivo seleccionado
                </a>
                )}
            </div>
          </div>

          <div className="certadd-row">
            <div className="certadd-field">
              {errors.fecha_expedicion && <div className="certadd-error">{errors.fecha_expedicion}</div>}
              <label className="certadd-label">Fecha de Expedición</label>
              <input
                type="date"
                name="fecha_expedicion"
                className="certadd-input"
                value={form.fecha_expedicion}
                onChange={handleChange}
              />
            </div>

            <div className="certadd-field">
              {errors.fecha_vencimiento && <div className="certadd-error">{errors.fecha_vencimiento}</div>}
              <label className="certadd-label">Fecha de Vencimiento</label>
              <input
                type="date"
                name="fecha_vencimiento"
                className="certadd-input"
                value={form.fecha_vencimiento}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="certadd-field">
            {errors.certificacion_id && <div className="certadd-error">{errors.certificacion_id}</div>}
            <label className="certadd-label">Tipo de Certificación</label>
            <select
              name="certificacion_id"
              className="certadd-select"
              value={form.certificacion_id}
              onChange={handleChange}
            >
              <option value="">Seleccione una certificación</option>
              {certificaciones.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="certadd-buttons">
            <button className="certadd-btn certadd-btn-primary" onClick={handleSubmit}>Agregar</button>
            <button className="certadd-btn certadd-btn-secondary" onClick={() => navigate("/properties")}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
