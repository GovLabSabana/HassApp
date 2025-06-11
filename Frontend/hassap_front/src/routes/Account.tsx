import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../componentsStyles/Account.css";

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
        <div className="account-content-wrapper">
          <h1 className="account-title">Cuenta</h1>

          {user ? (
            <div className="account-info">
              <div className="account-section">
                <h2 className="account-section-title">Información Personal</h2>

                <div className="account-field">
                  <label>Name</label>
                  <div className="account-field-value">
                    {user.razon_social || 'No especificado'}
                  </div>
                </div>

                <div className="account-field">
                  <label>Email</label>
                  <div className="account-field-value">{user.email}</div>
                </div>

                <div className="account-field">
                  <label>Phone</label>
                  <div className="account-field-value">{user.telefono || 'No especificado'}</div>
                </div>

                <div className="account-field">
                  <label>Address</label>
                  <div className="account-field-value">{user.direccion || 'No especificado'}</div>
                </div>

                <div className="account-field">
                  <label>Tipo de persona</label>
                  <div className="account-field-value">{user.tipo_persona}</div>
                </div>

                <div className="account-field">
                  <label>Página web</label>
                  <div className="account-field-value">
                    {user.pagina_web ? (
                      <a href={user.pagina_web} target="_blank" rel="noopener noreferrer">
                        {user.pagina_web}
                      </a>
                    ) : (
                      'No cargado'
                    )}
                  </div>
                </div>

                <div className="account-field">
                  <label>RUT</label>
                  <div className="account-field-value">
                    {user.rut ? (
                      <a href={user.rut} target="_blank" rel="noopener noreferrer">
                        Ver documento
                      </a>
                    ) : (
                      'No cargado'
                    )}
                  </div>
                </div>

                <div className="account-field">
                  <label>Tipo de documento</label>
                  <div className="account-field-value">{user.tipo_documento?.name || 'No especificado'}</div>
                </div>

                <div className="account-field">
                  <label>Número de documento</label>
                  <div className="account-field-value">{user.num_documento || 'No especificado'}</div>
                </div>

                {user.logo && (
                  <div className="account-logo">
                    <strong>Logo:</strong>
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
            </div>
          ) : (
            <div>No se encontró información del usuario.</div>
          )}
        </div>
      </main>
    </div>
  );
}