import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../componentsStyles/ResetPassword.css";

const ResetPassword = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("Token no encontrado en la URL.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setMessage("Contraseña restablecida correctamente.");
      } else {
        const data = await res.json();
        setMessage(data.detail || "Error al restablecer la contraseña.");
      }
    } catch (err) {
      setMessage("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Restablecer"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ResetPassword;
