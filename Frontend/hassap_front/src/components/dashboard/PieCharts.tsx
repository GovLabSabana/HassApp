import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Puedes personalizar esta paleta de colores
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA66CC",
  "#FF4444",
];

const convertirOpciones = (conteo_opciones) => {
  return Object.entries(conteo_opciones).map(([opcion, valor]) => ({
    name: opcion,
    value: valor,
  }));
};

const GraficosTorta = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access_token") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/estadisticas/sondeo/opciones`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener los datos");

        const data = await res.json();
        setPreguntas(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los gráficos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <p>Cargando gráficos...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {preguntas.map((pregunta, index) => {
        const data = convertirOpciones(pregunta.conteo_opciones);

        return (
          <div key={pregunta.id} style={{ width: 300 }}>
            <h4 style={{ fontSize: "1rem", marginBottom: "8px" }}>
              {pregunta.texto}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};

export default GraficosTorta;
