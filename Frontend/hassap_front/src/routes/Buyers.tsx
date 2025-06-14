import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL;

interface Comprador {
  id: number;
  nombre: string;
  tipo_doc: number;
  num_doc: string;
  ciudad: string;
  pais: string;
  direccion: string;
  contacto: string;
}

export default function Buyers() {
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const navigate = useNavigate();

  const fetchCompradores = async () => {
    const res = await fetch(`${API_URL}/compradores/`);
    const data = await res.json();
    setCompradores(data);
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/compradores/${id}`, { method: "DELETE" });
    fetchCompradores();
  };

  useEffect(() => {
    fetchCompradores();
  }, []);

  return (
    <div>
      {/* <Sidebar /> */}
      <h1 style={{ textAlign: "center" }}>Compradores</h1>
      <table border={1} style={{ margin: "auto", width: "90%", marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo de Documento</th>
            <th>Número de Documento</th>
            <th>Ciudad</th>
            <th>País</th>
            <th>Dirección</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compradores.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{["", "C.C.", "NIT", "C.E."][c.tipo_doc]}</td>
              <td>{c.num_doc}</td>
              <td>{c.ciudad}</td>
              <td>{c.pais}</td>
              <td>{c.direccion}</td>
              <td>{c.contacto}</td>
              <td>
                <button onClick={() => navigate(`/buyers/edit?id=${c.id}`)}>Editar</button>
                <button onClick={() => handleDelete(c.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => navigate("/buyers/add")}>Agregar Comprador</button>
      </div>
    </div>
  );
}