import React from "react";
import "./styles.css";

interface Pregunta {
  id: number;
  texto: string;
  clave: string;
  tipo: "opcion" | "numero";
  opciones: string[] | null;
  respondida: boolean;
}

interface Props {
  pregunta: Pregunta;
  onClick: () => void;
}

const QuestionCard: React.FC<Props> = ({ pregunta, onClick }) => {
  return (
    <div
      className={`card ${pregunta.respondida ? "respondida" : ""}`}
      onClick={() => {
        if (!pregunta.respondida) onClick();
      }}
      style={{
        cursor: pregunta.respondida ? "not-allowed" : "pointer",
        position: "relative",
      }}
    >
      {pregunta.respondida && (
        <div className="badge-respondida">Respondida</div>
      )}
      <p className="card-title">{pregunta.texto}</p>
    </div>
  );
};

export default QuestionCard;
