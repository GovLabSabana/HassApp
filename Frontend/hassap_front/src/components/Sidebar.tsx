import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../componentsStyles/Sidebar.css";

type SidebarItem = {
  label: string;
  path: string;
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = React.useState<string>("");

  const items: SidebarItem[] = [
    { label: "Inicio", path: "/dashboard" },
    { label: "Cuenta", path: "/account" },
    { label: "Predios", path: "/properties" },
    { label: "Producción", path: "/production" },
    { label: "Exportación", path: "/export" },
    { label: "Insumos", path: "/inputs" },
    { label: "Sondeo", path: "/sondeo" },
    { label: "Desarrolladores", path: "/Developer" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src="/logo_hass.svg" alt="logoapp" className="logo" />
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <li key={item.label} className="sidebar-menu-item">
              <a
                onClick={() => navigate(item.path)}
                className={`sidebar-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="sidebar-label">{item.label}</span>
                <div className="sidebar-indicator"></div>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button-minimal" onClick={handleLogout}>
          <div className="user-info">
            <span className="user-role">Cerrar sesión</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
