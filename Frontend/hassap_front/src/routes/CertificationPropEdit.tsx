import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

interface CertificacionPredio {
  id: number;
  predio: Predio;
  certificacion: Certificacion;
  archivo_pdf: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
}

interface CertForm {
  predio_id: string;
  archivo_pdf: File | null;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  certificacion_id: string;
}

type CertFormErrors = Partial<Record<keyof CertForm, string>>;

export default function CertificationPropEdit() {
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
  const [archivoExistente, setArchivoExistente] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;
  const id = new URLSearchParams(location.search).get("id");

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [resPredios, resCerts, resData] = await Promise.all([
          fetch(`${API_URL}/predios/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/certificaciones/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/certificaciones-predio/?certificacion_id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const [dataPredios, dataCerts, dataCert] = await Promise.all([
          resPredios.json(),
          resCerts.json(),
          resData.json(),
        ]);

        console.log(dataCert)

        setPredios(dataPredios);
        setCertificaciones(dataCerts);

        setForm({
          predio_id: dataCert.predio?.id?.toString() ?? "",
          certificacion_id: dataCert.certificacion?.id?.toString() ?? "",
          archivo_pdf: null,
          fecha_expedicion: dataCert.fecha_expedicion ?? "",
          fecha_vencimiento: dataCert.fecha_vencimiento ?? "",
        });

        setArchivoExistente(dataCert.archivo_pdf ?? "");
      } catch (err) {
        console.error("Error al cargar datos:", err);
        toast.error("Error al cargar los datos de la certificación");
      }
    };

    loadData();
  }, [id]);

  const validate = (): boolean => {
    const newErrors: CertFormErrors = {};
    const hoy = new Date().toISOString().split("T")[0];

    if (!form.predio_id) newErrors.predio_id = "Campo obligatorio";
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, archivo_pdf: file }));
  };

  const handleSubmit = async () => {
    if (!validate() || !id) return;

    const formData = new FormData();
    formData.append("predio_id", form.predio_id);
    formData.append("certificacion_id", form.certificacion_id);
    formData.append("fecha_expedicion", form.fecha_expedicion);
    formData.append("fecha_vencimiento", form.fecha_vencimiento);
    if (form.archivo_pdf) formData.append("archivo", form.archivo_pdf);

    try {
      const res = await fetch(`${API_URL}/certificaciones-predio/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errRes = await res.json();
        console.error("Respuesta error:", errRes);
        throw new Error("Error en la actualización");
      }

      toast.success("Certificación actualizada correctamente");
      navigate("/properties");
    } catch (err) {
      console.error("Error al actualizar certificación:", err);
      toast.error("Error al actualizar certificación");
    }
  };

  return (
    <div className="certadd-container">
      <div className="certadd-form-wrapper">
        <h1 className="certadd-title">Editar Certificación</h1>
        <div className="certadd-form">
          <div className="certadd-row">
            <div className="certadd-field">
              <label className="certadd-label">Predio</label>
              <div className="certadd-readonly">
                {predios.find((p) => p.id.toString() === form.predio_id)?.nombre || "Cargando..."}
              </div>
            </div>

            <div className="certadd-field">
              <label className="certadd-label">Archivo PDF</label>
              <input
                type="file"
                name="archivo_pdf"
                accept="application/pdf"
                className="certadd-input"
                onChange={handleFileChange}
              />
              {form.archivo_pdf ? (
                <a
                  href={URL.createObjectURL(form.archivo_pdf)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#4ade80", marginTop: 4 }}
                >
                  Ver archivo seleccionado
                </a>
              ) : archivoExistente && (
                <a
                  href={archivoExistente}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#4ade80", marginTop: 4 }}
                >
                  Ver archivo existente
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
            <button className="certadd-btn certadd-btn-primary" onClick={handleSubmit}>Guardar Cambios</button>
            <button className="certadd-btn certadd-btn-secondary" onClick={() => navigate("/properties")}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
