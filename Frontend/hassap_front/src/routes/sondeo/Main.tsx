import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { Sidebar } from "../../components/Sidebar";
import "./styles.css";
import Modal from "./Modal";

interface Pregunta {
  id: number;
  texto: string;
  clave: string;
  tipo: "opcion" | "numero";
  opciones: string[] | null;
}

const Main = () => {
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [selectedPregunta, setSelectedPregunta] = useState<Pregunta | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/preguntas/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPreguntas(data);
        } else if ("data" in data && Array.isArray(data.data)) {
          setPreguntas(data.data);
        } else {
          console.error("Respuesta inesperada de la API:", data);
          setError("Respuesta inesperada del servidor.");
        }
      })
      .catch((err) => {
        console.error("Error al cargar preguntas:", err);
        setError("No se pudieron cargar las preguntas.");
      })
      .finally(() => setLoading(false));
  }, [API_URL, token]);
  const handleCardClick = (pregunta: Pregunta) => {
    setSelectedPregunta(pregunta);
  };

  const closeModal = () => {
    setSelectedPregunta(null);
  };
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="account-container">
      <div className="account-sidebar">
        <Sidebar />
      </div>

      <main className="sondeo-main">
        <h1 className="sondeo-title">Sondeo</h1>

        <div className="grid-container">
          {preguntas.map((pregunta) => (
            <QuestionCard
              key={pregunta.id}
              pregunta={pregunta}
              onClick={() => handleCardClick(pregunta)}
            />
          ))}
        </div>

        {selectedPregunta && (
          <Modal
            pregunta={selectedPregunta}
            onClose={closeModal}
            API_URL={API_URL}
            token={token}
          />
        )}
      </main>
    </div>
  );
};

export default Main;
