import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../componentsStyles/Exportadd.css";

export default function ExportEdit() {
  const [searchParams] = useSearchParams();
  const exportId = searchParams.get("id");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    fecha: "",
    metodo_salida: "",
    toneladas: "",
    valor_fob: "",
    puerto_salida: "",
    puerto_llegada: "",
    comprador_id: "",
    cosecha_ids: [] as number[],
  });
  const [compradores, setCompradores] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [cosechas, setCosechas] = useState<{ id: number; nombre: string }[]>(
    []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!exportId) return;

    const token = localStorage.getItem("access_token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${API_URL}/exportaciones/${exportId}`, { headers }).then((res) =>
        res.json()
      ),
      fetch(`${API_URL}/compradores/`, { headers }).then((res) => res.json()),
      fetch(`${API_URL}/cosechas/`, { headers }).then((res) => res.json()),
    ])
      .then(([data, comps, cosechs]) => {
        setForm({
          fecha: data.fecha,
          metodo_salida: data.metodo_salida,
          toneladas: data.toneladas.toString(),
          valor_fob: data.valor_fob.toString(),
          puerto_salida: data.puerto_salida,
          puerto_llegada: data.puerto_llegada,
          comprador_id: data.comprador_id.toString(),
          cosecha_ids: data.cosecha_ids,
        });
        setCompradores(comps);
        setCosechas(cosechs);
      })
      .catch((err) => {
        console.error("Error al cargar datos de exportación:", err);
      });
  }, [exportId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const today = new Date().toISOString().split("T")[0];
    if (!form.fecha) errs.fecha = "Fecha requerida";
    else if (form.fecha > today) errs.fecha = "Fecha no puede ser futura";
    if (!form.metodo_salida) errs.metodo_salida = "Seleccione método";
    if (!/^(Agua|Tierra|Aire)$/.test(form.metodo_salida))
      errs.metodo_salida = "Opción inválida";
    if (isNaN(Number(form.toneladas)) || Number(form.toneladas) <= 0)
      errs.toneladas = "Debe ser mayor a 0";
    if (isNaN(Number(form.valor_fob)) || Number(form.valor_fob) <= 0)
      errs.valor_fob = "Debe ser mayor a 0";
    ["puerto_salida", "puerto_llegada"].forEach((f) => {
      if (!form[f]) errs[f] = "Campo requerido";
    });
    if (!form.comprador_id) errs.comprador_id = "Seleccione comprador";
    if (form.cosecha_ids.length < 1)
      errs.cosecha_ids = "Agregue al menos una cosecha";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addCosechaField = () =>
    setForm((f) => ({ ...f, cosecha_ids: [...f.cosecha_ids, 0] }));

  const removeCosecha = (idx: number) =>
    setForm((f) => ({
      ...f,
      cosecha_ids: f.cosecha_ids.filter((_, i) => i !== idx),
    }));

  const updateCosecha = (idx: number, val: number) =>
    setForm((f) => ({
      ...f,
      cosecha_ids: f.cosecha_ids.map((v, i) => (i === idx ? val : v)),
    }));

  const handleSubmit = async () => {
    if (!validate()) return;
    const token = localStorage.getItem("access_token");
    const payload = {
      ...form,
      toneladas: Number(form.toneladas),
      valor_fob: Number(form.valor_fob),
      comprador_id: Number(form.comprador_id),
      cosecha_ids: form.cosecha_ids,
    };
    await fetch(`${API_URL}/exportaciones/${exportId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    setSuccess(true);
    setTimeout(() => navigate("/export"), 1500);
  };

  return (
    <div className="exportadd-container">
      <div className="exportadd-form-wrapper">
        <h1 className="exportadd-title">Editar Exportación</h1>

        {success && (
          <div className="exportadd-success">
            ¡Exportación actualizada con éxito!
          </div>
        )}

        <div className="exportadd-form">
          <div className="exportadd-row">
            <div className="exportadd-field">
              <label className="exportadd-label">Fecha*</label>
              {errors.fecha && (
                <div className="exportadd-error">{errors.fecha}</div>
              )}
              <input
                type="date"
                className="exportadd-input"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>

            <div className="exportadd-field">
              <label className="exportadd-label">Método de Salida*</label>
              {errors.metodo_salida && (
                <div className="exportadd-error">{errors.metodo_salida}</div>
              )}
              <select
                className="exportadd-select"
                value={form.metodo_salida}
                onChange={(e) =>
                  setForm({ ...form, metodo_salida: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                <option value="Tierra">Tierra</option>
                <option value="Aire">Aire</option>
                <option value="Agua">Agua</option>
              </select>
            </div>
          </div>

          <div className="exportadd-row">
            <div className="exportadd-field">
              <label className="exportadd-label">Toneladas*</label>
              {errors.toneladas && (
                <div className="exportadd-error">{errors.toneladas}</div>
              )}
              <input
                type="number"
                min={0.01}
                step="0.01"
                className="exportadd-input"
                value={form.toneladas}
                onChange={(e) =>
                  setForm({ ...form, toneladas: e.target.value })
                }
              />
            </div>

            <div className="exportadd-field">
              <label className="exportadd-label">Valor FOB*</label>
              {errors.valor_fob && (
                <div className="exportadd-error">{errors.valor_fob}</div>
              )}
              <input
                type="number"
                min={0.01}
                step="0.01"
                className="exportadd-input"
                value={form.valor_fob}
                onChange={(e) =>
                  setForm({ ...form, valor_fob: e.target.value })
                }
              />
            </div>
          </div>

          <div className="exportadd-row">
            <div className="exportadd-field">
              <label className="exportadd-label">Puerto Salida*</label>
              {errors.puerto_salida && (
                <div className="exportadd-error">{errors.puerto_salida}</div>
              )}
              <input
                className="exportadd-input"
                value={form.puerto_salida}
                onChange={(e) =>
                  setForm({ ...form, puerto_salida: e.target.value })
                }
              />
            </div>

            <div className="exportadd-field">
              <label className="exportadd-label">Puerto Llegada*</label>
              {errors.puerto_llegada && (
                <div className="exportadd-error">{errors.puerto_llegada}</div>
              )}
              <input
                className="exportadd-input"
                value={form.puerto_llegada}
                onChange={(e) =>
                  setForm({ ...form, puerto_llegada: e.target.value })
                }
              />
            </div>
          </div>

          <div className="exportadd-row">
            <div className="exportadd-field">
              <label className="exportadd-label">Comprador*</label>
              {errors.comprador_id && (
                <div className="exportadd-error">{errors.comprador_id}</div>
              )}
              <select
                className="exportadd-select"
                value={form.comprador_id}
                onChange={(e) =>
                  setForm({ ...form, comprador_id: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                {compradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="exportadd-field">
              <label className="exportadd-label">Cosechas*</label>
              {errors.cosecha_ids && (
                <div className="exportadd-error">{errors.cosecha_ids}</div>
              )}
              <div className="exportadd-cosechas-container">
                {form.cosecha_ids.map((cid, idx) => (
                  <div key={idx} className="exportadd-cosecha-row">
                    <select
                      className="exportadd-select exportadd-cosecha-select"
                      value={cid}
                      onChange={(e) => updateCosecha(idx, +e.target.value)}
                    >
                      <option value={0}>Seleccionar cosecha</option>
                      {cosechas
                        .filter(
                          (c) =>
                            c.id === cid || !form.cosecha_ids.includes(c.id)
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.id}
                          </option>
                        ))}
                    </select>
                    {idx > 0 && (
                      <button
                        type="button"
                        className="exportadd-remove-btn"
                        onClick={() => removeCosecha(idx)}
                      >
                        –
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="exportadd-add-cosecha-btn"
                  onClick={addCosechaField}
                >
                  + Agregar Cosecha
                </button>
              </div>
            </div>
          </div>

          <div className="exportadd-buttons">
            <button
              className="exportadd-btn exportadd-btn-primary"
              onClick={handleSubmit}
            >
              GUARDAR CAMBIOS
            </button>
            <button
              className="exportadd-btn exportadd-btn-secondary"
              onClick={() => navigate("/export")}
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
