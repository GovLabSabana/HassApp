import React from "react";
import "./styles.css";

interface Pregunta {
  id: number;
  texto: string;
  clave: string;
  tipo: "opcion" | "numero";
  opciones: string[] | null;
}

interface Props {
  pregunta: Pregunta;
  onClick: () => void;
}

const QuestionCard: React.FC<Props> = ({ pregunta, onClick }) => {
  return (
    <div className="card" onClick={onClick} style={{ cursor: "pointer" }}>
      <p className="card-title">{pregunta.texto}</p>
    </div>
  );
};

export default QuestionCard;
