import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Sidebar } from "../components/Sidebar"; // Descomenta si usás Sidebar

interface Predio {
  id: number;
  nombre: string;
}

interface Insumo {
  insumo_id: number;
  cantidad: string;
  costo_unitario: string;
  id: number;
  nombre_comercial: string;
}

interface Producto {
  id: number;
  nombre: string;
}

interface Calidad {
  id: number;
  name: string;
}

interface Cosecha {
  id: number;
  fecha: string;
  producto: Producto;
  calidad: Calidad;
  toneladas: string;
  hectareas: string;
  observaciones: string;
  predios: Predio[];
  insumos: Insumo[];
}

export default function Production() {
  const navigate = useNavigate();
  const [list, setList] = useState<Cosecha[]>([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [predioId, setPredioId] = useState("");
  const [productoId, setProductoId] = useState("");
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/cosechas/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data: Cosecha[] = await res.json();
      setList(data);
    } catch (err) {
      console.error("Error al cargar las cosechas", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producción?")) return;
    await fetch(`${API_URL}/cosechas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const filtered = list.filter((c) => {
    const fecha = c.fecha;
    if (fechaDesde && fecha < fechaDesde) return false;
    if (fechaHasta && fecha > fechaHasta) return false;
    if (predioId && !c.predios.some((p) => p.id.toString().includes(predioId)))
      return false;
    if (productoId && c.producto.id.toString() !== productoId) return false;
    return true;
  });

  return (
    <div className="production-container">
      {/* <Sidebar /> */}
      <main>
        <h1>Producción</h1>

        <div className="filters">
          <label>
            Desde:{" "}
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </label>
          <label>
            Hasta:{" "}
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </label>
          <label>
            ID Predio:{" "}
            <input
              value={predioId}
              onChange={(e) => setPredioId(e.target.value)}
            />
          </label>
          <label>
            ID Producto:{" "}
            <input
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
            />
          </label>
        </div>

        <table className="production-table">
          <thead>
            <tr>
              <th>Id</th><th>Fecha</th><th>Producto</th><th>Calidad</th><th>Toneladas</th><th>Hectáreas</th><th>Observaciones</th><th>Predios(nombre-id)</th><th>Insumos(nombre-cantidad)</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c =>
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.fecha}</td><td>{c.producto? `${c.producto.nombre}-${c.producto.id}`: 'N/A'}</td><td>{c.calidad?.id ?? 'N/A'}</td><td>{c.toneladas}</td><td>{c.hectareas}</td><td>{c.observaciones}</td><td>{c.predios.map(p => `${p.nombre}-${p.id}`).join(', ')}</td><td>{c.insumos.map(i => <div key={i.insumo_id}>{i.nombre_comercial} — {i.cantidad}</div>)}</td><td><button onClick={() => navigate(`/production/edit?id=${c.id}`)}>Editar</button><button onClick={() => handleDelete(c.id)}>Eliminar</button></td>
              </tr>
            )}
          </tbody>
        </table>

        <button onClick={() => navigate("/production/add")}>
          Agregar Producción
        </button>
      </main>
    </div>
  );
}
