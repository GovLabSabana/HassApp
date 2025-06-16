import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL;

export default function Export() {
  const [exportaciones, setExportaciones] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [compradores, setCompradores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExportaciones();
    fetchCompradores();
  }, []);

  const fetchExportaciones = async () => {
    const res = await fetch(`${API_URL}/exportaciones/`);
    const data = await res.json();
    setExportaciones(data);
  };

  const fetchCompradores = async () => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/compradores/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  setCompradores(data);
  };

  const eliminarExportacion = async (id) => {
    await fetch(`${API_URL}/exportaciones/${id}`, {
      method: "DELETE",
    });
    fetchExportaciones();
  };

  const exportacionesFiltradas = exportaciones.filter((exp) => {
    const fechaOk = !filtroFecha || exp.fecha === filtroFecha;
    const metodoOk = !filtroMetodo || exp.metodo_salida === filtroMetodo;
    return fechaOk && metodoOk;
  });

  const getNombreComprador = (id) => {
    const comprador = compradores.find((c) => c.id === id);
    return comprador ? comprador.nombre : "Desconocido";
  };

  return (
    <div>
      {/*<Sidebar />*/}
      <h1 style={{ textAlign: "center" }}>Exportación</h1>

      <div style={{ display: "flex", gap: "1rem", margin: "1rem" }}>
        <div>
          <label>Filtrar por Fecha:</label>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>
        <div>
          <label>Método de Salida:</label>
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Tierra">Tierra</option>
            <option value="Aire">Aire</option>
            <option value="Agua">Agua</option>
          </select>
        </div>
      </div>

      <table style={{ width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Método</th>
            <th>Toneladas</th>
            <th>Valor FOB</th>
            <th>Puerto Salida</th>
            <th>Puerto Llegada</th>
            <th>Comprador</th>
            <th>Cosechas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {exportacionesFiltradas.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.fecha}</td>
              <td>{exp.metodo_salida}</td>
              <td>{exp.toneladas}</td>
              <td>{exp.valor_fob}</td>
              <td>{exp.puerto_salida}</td>
              <td>{exp.puerto_llegada}</td>
              <td>{getNombreComprador(exp.comprador_id)}</td>
              <td>{exp.cosecha_ids.join(", ")}</td>
              <td>
                <button onClick={() => navigate(`/export/edit?id=${exp.id}`)}>
                  Editar
                </button>
                <button
                  onClick={() => eliminarExportacion(exp.id)}
                  style={{ marginLeft: "5px" }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button onClick={() => navigate("/export/add")}>Agregar Exportación</button>
        <button
          onClick={() => navigate("/export/history")}
          style={{ marginLeft: "1rem" }}
        >
          Historial
        </button>
      </div>
    </div>
  );
}
