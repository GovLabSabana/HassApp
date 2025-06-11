import "../componentsStyles/Produccionadd.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Insumo {
  insumo_id: number;
  cantidad: number;
}

export default function ProductionAdd() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState("");
  const [productoId, setProductoId] = useState<number>(0);
  const [calidadId, setCalidadId] = useState<number>(1);
  const [toneladas, setToneladas] = useState<number>(0);
  const [hectareas, setHectareas] = useState<number>(0);
  const [observaciones, setObservaciones] = useState("");
  const [predios, setPredios] = useState<number[]>([0]);
  const [insumos, setInsumos] = useState<Insumo[]>([{ insumo_id: 0, cantidad: 0 }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  const validate = async (): Promise<boolean> => {
    const errs: Record<string, string> = {};
    const today = new Date().toISOString().split("T")[0];

    if (!fecha) errs.fecha = "Fecha es requerida.";
    else if (fecha > today) errs.fecha = "La fecha no puede ser mayor a la actual.";

    if (productoId <= 0) errs.productoId = "Producto ID debe ser > 0.";
    if (calidadId < 1 || calidadId > 5) errs.calidadId = "Calidad debe ser entre 1 y 5.";
    if (toneladas <= 0) errs.toneladas = "Toneladas debe ser > 0.";
    if (hectareas <= 0) errs.hectareas = "Hectáreas debe ser > 0.";

    if (predios.length === 0 || predios.some((id) => id <= 0)) {
        errs.predios = "Debes agregar al menos un Predio ID válido.";
    } else {
        const prediosValidos = await fetchPrediosValidos();
        const prediosInvalidos = predios.filter((id) => !prediosValidos.includes(id));
        if (prediosInvalidos.length > 0) {
        errs.predios = `Los siguientes IDs de predio no existen: ${prediosInvalidos.join(", ")}`;
        }
    }

    if (
        insumos.length === 0 ||
        insumos.some((i) => i.insumo_id <= 0 || i.cantidad <= 0)
    )
        errs.insumos = "Debes agregar al menos un Insumo con ID y cantidad > 0.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
    };

  const fetchPrediosValidos = async (): Promise<number[]> => {
    try {
        const res = await fetch(`${API_URL}/predios/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        if (!res.ok) throw new Error("No se pudieron obtener los predios.");
        const data = await res.json();
        return data.map((p: { id: number }) => p.id); // Ajusta si el backend retorna otra estructura
    } catch (err) {
        console.error(err);
        return [];
    }
    };

  const handleAdd = async () => {
    const isValid = await validate();
    if (!isValid) return;

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

    console.log("JSON a enviar:", JSON.stringify(body, null, 2));

    try {
        const res = await fetch(`${API_URL}/cosechas/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Error al crear producción");
        navigate("/production");
    } catch (err) {
        console.error(err);
        setErrors({ general: "No fue posible crear la producción." });
    }
    };

  const addPredioField = () => setPredios((prev) => [...prev, 0]);
  const removePredioField = (idx: number) =>
    setPredios((prev) => prev.filter((_, i) => i !== idx));
  const updatePredio = (idx: number, value: number) =>
    setPredios((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const addInsumoField = () =>
    setInsumos((prev) => [...prev, { insumo_id: 0, cantidad: 0 }]);
  const removeInsumoField = (idx: number) =>
    setInsumos((prev) => prev.filter((_, i) => i !== idx));
  const updateInsumo = (idx: number, field: keyof Insumo, value: number) =>
    setInsumos((prev) =>
      prev.map((ins, i) => (i === idx ? { ...ins, [field]: value } : ins))
    );

  return (
    <div className="production-container">
      <h1>Agregar Producción</h1>
      {errors.general && <div className="error-text">{errors.general}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <div>
          <label>Fecha*</label>
          {errors.fecha && <div className="error-text">{errors.fecha}</div>}
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div>
          <label>Producto ID*</label>
          {errors.productoId && <div className="error-text">{errors.productoId}</div>}
          <input
            type="number"
            value={productoId}
            min={1}
            onChange={(e) => setProductoId(+e.target.value)}
          />
        </div>

        <div>
          <label>Calidad* (1-5)</label>
          {errors.calidadId && <div className="error-text">{errors.calidadId}</div>}
          <input
            type="number"
            value={calidadId}
            min={1}
            max={5}
            onChange={(e) => setCalidadId(+e.target.value)}
          />
        </div>

        <div>
          <label>Toneladas*</label>
          {errors.toneladas && <div className="error-text">{errors.toneladas}</div>}
          <input
            type="number"
            value={toneladas}
            min={1}
            onChange={(e) => setToneladas(+e.target.value)}
          />
        </div>

        <div>
          <label>Hectáreas*</label>
          {errors.hectareas && <div className="error-text">{errors.hectareas}</div>}
          <input
            type="number"
            value={hectareas}
            min={1}
            onChange={(e) => setHectareas(+e.target.value)}
          />
        </div>

        <div>
          <label>Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div>
          <label>Predio IDs*</label>
          {errors.predios && <div className="error-text">{errors.predios}</div>}
          {predios.map((id, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                value={id}
                min={1}
                onChange={(e) => updatePredio(idx, Number(e.target.value))}
              />
              {idx > 0 && (
                <button type="button" onClick={() => removePredioField(idx)}>
                  –
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPredioField}>
            + Agregar Predio
          </button>
        </div>

        <div>
          <label>Insumos*</label>
          {errors.insumos && <div className="error-text">{errors.insumos}</div>}
          {insumos.map((ins, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <label>ID</label>
                <input
                  type="number"
                  placeholder="ID"
                  value={ins.insumo_id}
                  min={1}
                  onChange={(e) =>
                    updateInsumo(idx, "insumo_id", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label>Cantidad</label>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={ins.cantidad}
                  min={1}
                  onChange={(e) =>
                    updateInsumo(idx, "cantidad", Number(e.target.value))
                  }
                />
              </div>
              {idx > 0 && (
                <button type="button" onClick={() => removeInsumoField(idx)}>
                  –
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInsumoField}>
            + Agregar Insumo
          </button>
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="submit">Crear</button>
          <button type="button" onClick={() => navigate("/production")}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
