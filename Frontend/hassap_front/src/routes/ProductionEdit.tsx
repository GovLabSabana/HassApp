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
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!cosechaId) return;

    const loadData = async () => {
      await fetchPrediosValidos();
      await fetchCosecha();
    };

    loadData();
  }, [cosechaId]);

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
      setPredios((data.predios || []).map(p => p.id));
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
      alert("Producción actualizada correctamente.");
      navigate("/production");
    } catch (err) {
      console.error(err);
      setErrors({ general: "No fue posible actualizar la producción." });
    }
  };

  const addPredioField = () =>
    setPredios((prev) => [...prev, 0]);

  const removePredioField = (idx: number) =>
    setPredios((prev) => prev.filter((_, i) => i !== idx));

  const updatePredio = (idx: number, val: number) =>
    setPredios((prev) =>
      prev.map((v, i) => (i === idx ? val : v))
    );

  const addInsumoField = () =>
    setInsumos((prev) => [...prev, { insumo_id: 0, cantidad: 0 }]);

  const removeInsumoField = (idx: number) =>
    setInsumos((prev) => prev.filter((_, i) => i !== idx));

  const updateInsumo = (idx: number, field: keyof Insumo, val: number) =>
    setInsumos((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: val } : item
      )
    );

  return (
    <div className="production-container">
      <h1>Editar Producción</h1>
      {errors.general && <div className="error-text">{errors.general}</div>}
      <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
        {/* Fecha */}
        <div>
          <label>Fecha*</label>
          {errors.fecha && <div className="error-text">{errors.fecha}</div>}
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        {/* Producto */}
        <div>
          <label>Producto*</label>
          {errors.productoId && <div className="error-text">{errors.productoId}</div>}
          <ProductoSelector value={productoId} onSelect={setProductoId} />
        </div>

        {/* Calidad */}
        <div>
          <label>Calidad*</label>
          {errors.calidadId && <div className="error-text">{errors.calidadId}</div>}
          <CalidadSelector value={calidadId} onSelect={setCalidadId} />
        </div>

        {/* Toneladas y Hectareas */}
        <div>
          <label>Toneladas*</label>
          {errors.toneladas && <div className="error-text">{errors.toneladas}</div>}
          <input type="number" min="1" value={toneladas} onChange={(e) => setToneladas(+e.target.value)} />
        </div>
        <div>
          <label>Hectáreas*</label>
          {errors.hectareas && <div className="error-text">{errors.hectareas}</div>}
          <input type="number" min="1" value={hectareas} onChange={(e) => setHectareas(+e.target.value)} />
        </div>

        {/* Observaciones */}
        <div>
          <label>Observaciones</label>
          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        </div>

        {/* Predios */}
        <div>
          <label>Predios*</label>
          {errors.predios && <div className="error-text">{errors.predios}</div>}
          {predios.map((id, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={id} onChange={(e) => updatePredio(idx, +e.target.value)}>
                <option value={0}>Seleccione un predio</option>
                {prediosDisponibles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {idx > 0 && (
                <button type="button" onClick={() => removePredioField(idx)}>–</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPredioField}>+ Agregar Predio</button>
        </div>

        {/* Insumos */}
        <div>
          <label>Insumos*</label>
          {errors.insumos && <div className="error-text">{errors.insumos}</div>}
          {insumos.map((ins, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <div>
                <label>ID</label>
                <input type="number" min="1" value={ins.insumo_id} onChange={(e) => updateInsumo(idx, "insumo_id", +e.target.value)} />
              </div>
              <div>
                <label>Cantidad</label>
                <input type="number" min="1" value={ins.cantidad} onChange={(e) => updateInsumo(idx, "cantidad", +e.target.value)} />
              </div>
              {idx > 0 && (
                <button type="button" onClick={() => removeInsumoField(idx)}>–</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInsumoField}>+ Agregar Insumo</button>
        </div>

        {/* Acciones */}
        <div style={{ marginTop: 16 }}>
          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={() => navigate("/production")}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
