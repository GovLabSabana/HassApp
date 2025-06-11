import React, { useState } from "react";
import "./styles.css";

interface Pregunta {
  id: number;
  texto: string;
  clave: string;
  tipo: "opcion" | "numero";
  opciones: string[] | null;
}

interface ModalProps {
  pregunta: Pregunta;
  onClose: () => void;
  API_URL: string;
  token: string;
}

const Modal: React.FC<ModalProps> = ({ pregunta, onClose, API_URL, token }) => {
  const [respuesta, setRespuesta] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!respuesta) {
      setError("Debe seleccionar o ingresar una respuesta.");
      return;
    }

    setEnviando(true);
    fetch(`${API_URL}/respuestas/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pregunta_id: pregunta.id,
        respuesta,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al enviar respuesta");
        return res.json();
      })
      .then(() => {
        alert("✅ Respuesta enviada con éxito");
        onClose(); // cerrar modal si se envió bien
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo enviar la respuesta.");
      })
      .finally(() => setEnviando(false));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{pregunta.texto}</h3>

        {pregunta.tipo === "opcion" && pregunta.opciones ? (
          <div style={{ marginTop: "12px" }}>
            {pregunta.opciones.map((op, idx) => (
              <label
                key={idx}
                style={{ display: "block", marginBottom: "8px" }}
              >
                <input
                  type="radio"
                  name="respuesta"
                  value={op}
                  checked={respuesta === op}
                  onChange={() => setRespuesta(op)}
                  style={{ marginRight: "8px" }}
                />
                {op}
              </label>
            ))}
          </div>
        ) : (
          <input
            type="number"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Ingrese su respuesta"
            style={{ width: "95%", padding: "8px", marginTop: "12px" }}
          />
        )}

        {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button onClick={onClose} disabled={enviando}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
