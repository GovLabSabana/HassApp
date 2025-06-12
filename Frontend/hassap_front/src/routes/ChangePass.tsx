import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePass() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token") || "";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorOld, setErrorOld] = useState("");
  const [errorNew, setErrorNew] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrorOld("");
    setErrorNew("");

    // Validación frontend
    if (!oldPassword || !newPassword) {
      if (!oldPassword) setErrorOld("Debe ingresar la contraseña actual.");
      if (!newPassword) setErrorNew("Debe ingresar una nueva contraseña.");
      return;
    }

    if (oldPassword === newPassword) {
      setErrorNew("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/custom/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        alert("Contraseña actualizada correctamente.");
        navigate("/account");
      } else {
        const errorData = await res.json();
        if (
          errorData.detail &&
          typeof errorData.detail === "string" &&
          errorData.detail.toLowerCase().includes("incorrecta")
        ) {
          setErrorOld("La contraseña actual es incorrecta.");
        } else {
          alert("Error al cambiar la contraseña.");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", textAlign: "center", color: "white" }}>
      <h1>Cambiar Contraseña</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ textAlign: "left" }}>
          <label>Contraseña actual</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
          {errorOld && <p style={{ color: "red", marginTop: "5px" }}>{errorOld}</p>}
        </div>

        <div style={{ textAlign: "left" }}>
          <label>Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
          {errorNew && <p style={{ color: "red", marginTop: "5px" }}>{errorNew}</p>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Establecer contraseña"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/account")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
