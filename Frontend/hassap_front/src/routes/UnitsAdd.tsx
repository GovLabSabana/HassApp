import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../componentsStyles/Inputadd.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function UnitsAdd() {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      toast.warn("El nombre no puede estar vacío.");
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${API_URL}/unidades/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      toast.success("Unidad creada exitosamente.");
      navigate("/inputs");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear la unidad.");
    }
  };

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="form-container">
          <h1 className="form-title">Agregar Unidad</h1>

          <div className="form-group full-width">
            <label className="form-label">Nombre de la unidad</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ej: kg, litro, saco..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button className="btn-primary-insumo" onClick={handleSubmit}>
              CREAR
            </button>
            <button
              className="btn-secondary-insumo"
              onClick={() => navigate("/inputs")}
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
