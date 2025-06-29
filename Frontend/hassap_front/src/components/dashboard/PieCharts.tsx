import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "../../componentsStyles/Metricas.css";
import "../../componentsStyles/dashboard/Sondeo.css";
import Loader from "../utils/Loader";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
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

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (loading) return <Loader />;

  return (
    <div className="graficos-torta-grid">
      {preguntas.map((pregunta) => {
        const data = convertirOpciones(pregunta.conteo_opciones);

        return (
          <div key={pregunta.id} className="kpi-card torta-card">
            <h4 className="kpi-title">{pregunta.texto}</h4>
            <div className="torta-chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.85)",
                      borderRadius: "0.5rem",
                      border: "1px solid #e5e7eb",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GraficosTorta;
