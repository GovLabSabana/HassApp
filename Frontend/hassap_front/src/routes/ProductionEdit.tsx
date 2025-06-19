import "../componentsStyles/Produccionadd.css";
import ProductoSelector from "../components/forms/SelectProducto";
import CalidadSelector from "../components/forms/SelectCalidad";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Insumo {
  insumo_id: number;
  cantidad: number;
}

interface Predio {
  id: number;
  nombre: string;
}

export default function ProductionEdit() {
  const [searchParams] = useSearchParams();
  const cosechaId = searchParams.get("id");
  const navigate = useNavigate();
  const [fecha, setFecha] = useState("");
  const [productoId, setProductoId] = useState<number>(0);
  const [calidadId, setCalidadId] = useState<number>(0);
  const [toneladas, setToneladas] = useState<number>(0);
  const [hectareas, setHectareas] = useState<number>(0);
  const [observaciones, setObservaciones] = useState("");
  const [predios, setPredios] = useState<number[]>([]);
  const [prediosDisponibles, setPrediosDisponibles] = useState<Predio[]>([]);
  const [insumosDisponibles, setInsumosDisponibles] = useState<
    { id: number; nombre_comercial: string }[]
  >([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!cosechaId) return;

    const loadData = async () => {
      await fetchPrediosValidos();
      await fetchInsumosDisponibles();
      await fetchCosecha();
    };

    loadData();
  }, [cosechaId]);

  const fetchInsumosDisponibles = async () => {
    try {
      const res = await fetch(`${API_URL}/insumos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudieron obtener los insumos.");
      const data = await res.json();
      setInsumosDisponibles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrediosValidos = async () => {
    try {
      const res = await fetch(`${API_URL}/predios/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudieron obtener los predios.");
      const data = await res.json();
      setPrediosDisponibles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCosecha = async () => {
    try {
      const res = await fetch(`${API_URL}/cosechas/${cosechaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar la cosecha.");
      const data = await res.json();
      setFecha(data.fecha.split("T")[0]);
      setProductoId(data.producto_id);
      setCalidadId(data.calidad_id);
      setToneladas(data.toneladas);
      setHectareas(data.hectareas);
      setObservaciones(data.observaciones || "");
      setPredios((data.predios || []).map((p) => p.id));
      setInsumos(data.insumos || []);
    } catch (err) {
      console.error(err);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const todayStr = new Date().toISOString().split("T")[0];

    if (!fecha) errs.fecha = "Fecha es requerida.";
    else if (fecha > todayStr) errs.fecha = "La fecha no puede ser futura.";

    if (productoId <= 0) errs.productoId = "Debes seleccionar un producto.";
    if (calidadId <= 0) errs.calidadId = "Debes seleccionar una calidad.";
    if (toneladas <= 0) errs.toneladas = "Toneladas debe ser mayor a 0.";
    if (hectareas <= 0) errs.hectareas = "Hectáreas debe ser mayor a 0.";

    const setPred = new Set(predios);
    if (predios.some((id) => id <= 0) || predios.length === 0)
      errs.predios = "Agregar por lo menos un predio válido.";
    else if (setPred.size !== predios.length)
      errs.predios = "Predios duplicados no permitidos.";

    const setIns = new Set(insumos.map((i) => i.insumo_id));
    if (insumos.some((i) => i.insumo_id <= 0 || i.cantidad <= 0))
      errs.insumos = "Cada insumo debe tener ID y cantidad > 0.";
    else if (setIns.size !== insumos.length)
      errs.insumos = "Insumos duplicados no permitidos.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    const body = {
      fecha,
      producto_id: productoId,
      calidad_id: calidadId,
      toneladas,
      hectareas,
      observaciones,
      predio_ids: predios,
      insumos,
    };

    try {
      const res = await fetch(`${API_URL}/cosechas/${cosechaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setSuccessMessage("Producción actualizada correctamente.");
      setTimeout(() => navigate("/production"), 5000);
    } catch (err) {
      console.error(err);
      setErrors({ general: "No fue posible actualizar la producción." });
    }
  };

  const addPredioField = () => setPredios((prev) => [...prev, 0]);
  const removePredioField = (idx: number) =>
    setPredios((prev) => prev.filter((_, i) => i !== idx));
  const updatePredio = (idx: number, val: number) =>
    setPredios((prev) => prev.map((v, i) => (i === idx ? val : v)));

  const addInsumoField = () =>
    setInsumos((prev) => [...prev, { insumo_id: 0, cantidad: 0 }]);
  const removeInsumoField = (idx: number) =>
    setInsumos((prev) => prev.filter((_, i) => i !== idx));
  const updateInsumo = (idx: number, field: keyof Insumo, val: number) =>
    setInsumos((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );

  return (
    <div className="add-production-container">
      <h1>Editar Producción</h1>

      {successMessage && (
        <div className="add-success-text">{successMessage}</div>
      )}
      {errors.general && <div className="add-error-text">{errors.general}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
      >
        <div className="add-form-grid">
          <div className="add-form-field">
            <label>Fecha*</label>
            {errors.fecha && (
              <div className="add-error-text">{errors.fecha}</div>
            )}
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="add-form-field">
            <label>Producto*</label>
            {errors.productoId && (
              <div className="add-error-text">{errors.productoId}</div>
            )}
            <ProductoSelector value={productoId} onSelect={setProductoId} />
          </div>

          <div className="add-form-field">
            <label>Calidad*</label>
            {errors.calidadId && (
              <div className="add-error-text">{errors.calidadId}</div>
            )}
            <CalidadSelector value={calidadId} onSelect={setCalidadId} />
          </div>

          <div className="add-form-field">
            <label>Toneladas*</label>
            {errors.toneladas && (
              <div className="add-error-text">{errors.toneladas}</div>
            )}
            <input
              type="number"
              value={toneladas}
              min={0.01}
              step="0.01"
              onChange={(e) => setToneladas(+e.target.value)}
            />
          </div>

          <div className="add-form-field">
            <label>Hectáreas*</label>
            {errors.hectareas && (
              <div className="add-error-text">{errors.hectareas}</div>
            )}
            <input
              type="number"
              value={hectareas}
              min={0.01}
              step="0.01"
              onChange={(e) => setHectareas(+e.target.value)}
            />
          </div>

          <div className="add-form-field full-width">
            <label>Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese observaciones adicionales..."
            />
          </div>
        </div>

        <div className="add-dynamic-section">
          <h3>Predios</h3>
          {errors.predios && (
            <div className="add-error-text">{errors.predios}</div>
          )}
          {predios.map((id, idx) => (
            <div key={idx} className="add-dynamic-item">
              <div className="add-form-field">
                <label>Predio {idx + 1}</label>
                <select
                  value={id}
                  onChange={(e) => updatePredio(idx, Number(e.target.value))}
                >
                  <option value={0}>Seleccione un predio</option>
                  {prediosDisponibles
                    .filter((p) => p.id === id || !predios.includes(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                </select>
              </div>
              {idx > 0 && (
                <button
                  type="button"
                  className="add-btn add-btn-danger"
                  onClick={() => removePredioField(idx)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn add-btn-add"
            onClick={addPredioField}
          >
            + Agregar Predio
          </button>
        </div>

        {/* Insumos */}
        <div className="add-dynamic-section">
          <h3>Insumos</h3>
          {errors.insumos && (
            <div className="add-error-text">{errors.insumos}</div>
          )}
          {insumos.map((ins, idx) => {
            const usados = new Set(
              insumos.map((i, iidx) => (iidx !== idx ? i.insumo_id : null))
            );
            const disponibles = insumosDisponibles.filter(
              (i) => !usados.has(i.id) || i.id === ins.insumo_id
            );

            return (
              <div key={idx} className="add-insumo-item">
                <div className="add-form-field">
                  <label>ID</label>
                  <select
                    value={ins.insumo_id}
                    onChange={(e) =>
                      updateInsumo(idx, "insumo_id", +e.target.value)
                    }
                  >
                    <option value={0}>Seleccione un insumo</option>
                    {disponibles.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre_comercial}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="add-form-field">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={ins.cantidad}
                    min={1}
                    onChange={(e) =>
                      updateInsumo(idx, "cantidad", +e.target.value)
                    }
                  />
                </div>
                {idx > 0 && (
                  <button
                    type="button"
                    className="add-btn add-btn-danger"
                    onClick={() => removeInsumoField(idx)}
                  >
                    –
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            className="add-btn add-btn-add"
            onClick={addInsumoField}
          >
            + Agregar Insumo
          </button>
        </div>

        <div className="add-form-actions">
          <button type="submit" className="add-btn add-btn-primary">
            Guardar Cambios
          </button>
          <button
            type="button"
            className="add-btn add-btn-secondary"
            onClick={() => navigate("/production")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
