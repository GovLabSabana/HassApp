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
    if (!respuesta.trim()) {
      setError("Debe seleccionar o ingresar una respuesta.");
      return;
    }

    setError(null);
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
        onClose();
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo enviar la respuesta. Inténtalo de nuevo.");
      })
      .finally(() => setEnviando(false));
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-box">
        <h3 id="modal-title">{pregunta.texto}</h3>

        <div className="modal-form-group">
          {pregunta.tipo === "opcion" && pregunta.opciones ? (
            <div className="modal-options">
              {pregunta.opciones.map((opcion, idx) => (
                <div key={idx} className="modal-option">
                  <input
                    type="radio"
                    id={`opcion-${idx}`}
                    name="respuesta"
                    value={opcion}
                    checked={respuesta === opcion}
                    onChange={() => setRespuesta(opcion)}
                  />
                  <label htmlFor={`opcion-${idx}`}>{opcion}</label>
                </div>
              ))}
            </div>
          ) : (
            <input
              type="number"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Ingrese su respuesta"
              className="modal-input"
              aria-label="Respuesta numérica"
            />
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button 
            onClick={onClose} 
            disabled={enviando}
            className="btn btn-secondary"
            type="button"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={enviando}
            className={`btn btn-primary ${enviando ? 'btn-loading' : ''}`}
            type="button"
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;