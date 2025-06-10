import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Account.css"; // Asegúrate de tener estilos

interface User {
  id: number;
  email: string;
  tipo_persona: string;
  razon_social: string;
  telefono: string;
  direccion: string;
  pagina_web: string;
  rut: string;
  logo: string;
  created_at: string;
  tipo_documento_id: number;
  tipo_documento: {
    id: number;
    name: string;
  };
  num_documento: string;
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token") || "";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/usuarios/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("Error al cargar usuario:", err);
      })
      .finally(() => setLoading(false));
  }, [API_URL, token, navigate]);

  if (loading) {
    return (
      <div className="account-container">
        <div className="account-sidebar">
          <Sidebar />
        </div>
        <main className="account-main">
          <div className="account-loading">
            Cargando información del usuario...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-sidebar">
        <Sidebar />
      </div>

      <main className="account-main">
        <h1 className="account-title">Mi Perfil</h1>

        {user ? (
          <div className="account-info">
            <div className="account-row">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="account-row">
              <strong>Tipo de persona:</strong> {user.tipo_persona}
            </div>
            <div className="account-row">
              <strong>Razón social:</strong> {user.razon_social}
            </div>
            <div className="account-row">
              <strong>Teléfono:</strong> {user.telefono}
            </div>
            <div className="account-row">
              <strong>Dirección:</strong> {user.direccion}
            </div>
            <div className="account-row">
              <strong>Página web:</strong>{" "}
              {user.pagina_web ? (
                <a
                  href={user.pagina_web}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver página
                </a>
              ) : (
                "No cargado"
              )}
            </div>
            <div className="account-row">
              <strong>RUT:</strong>{" "}
              {user.rut ? (
                <a href={user.rut} target="_blank" rel="noopener noreferrer">
                  Ver documento
                </a>
              ) : (
                "No cargado"
              )}
            </div>
            <div className="account-row">
              <strong>Tipo de documento:</strong> {user.tipo_documento?.name}
            </div>
            <div className="account-row">
              <strong>Número de documento:</strong> {user.num_documento}
            </div>

            {user.logo && (
              <div className="account-logo">
                <strong>Logo:</strong>
                <br />
                <img src={user.logo} alt="Logo" className="account-logo-img" />
              </div>
            )}

            <button
              onClick={() => navigate("/account/edit")}
              className="account-edit-btn"
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          <div>No se encontró información del usuario.</div>
        )}
      </main>
    </div>
  );
}
