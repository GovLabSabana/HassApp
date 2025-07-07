import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../componentsStyles/Buyers.css";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export default function BuyersDocumentAdd() {
  const [name, setNombre] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/tipo-documento/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Error al agregar tipo de documento");

      toast.success("Tipo de documento agregado correctamente.");
      setTimeout(() => navigate("/buyers"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo agregar el tipo de documento.");
    }
  };

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="form-container">
          <h1 className="form-title">Agregar Tipo de Documento</h1>

          <div className="form-group full-width">
            <label className="form-label">Nombre del Tipo de Documento</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: C.C., NIT, C.E., etc."
            />
          </div>

          <div className="form-actions">
            <button className="btn-primary-insumo" onClick={handleCreate}>
              GUARDAR
            </button>
            <button className="btn-secondary-insumo" onClick={() => navigate("/buyers")}>
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
