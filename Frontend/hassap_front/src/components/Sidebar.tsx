import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../componentsStyles/Sidebar.css";
import "../routes/layouts/menu.css";

type SidebarItem = {
  label: string;
  path: string;
};
type SidebarProps = {
  onClose?: () => void;
  isMobile?: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items: SidebarItem[] = [
    { label: "INICIO", path: "/dashboard" },
    { label: "CUENTA", path: "/account" },
    { label: "PREDIOS", path: "/properties" },
    { label: "PRODUCCIÓN", path: "/production" },
    { label: "PROVEEDORES", path: "/suppliers" },
    { label: "EXPORTACIÓN", path: "/export" },
    { label: "COMPRADORES", path: "/buyers" },
    { label: "INSUMOS", path: "/inputs" },
    { label: "SONDEO", path: "/sondeo" },
    { label: "DESARROLLADORES", path: "/Developer" },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };
  const handleLogout = () => {
    localStorage.removeItem("access_token");
  };
  return (
    <aside className={`${isMobile ? "sidebar-mobile" : "sidebar"}`}>
      {!isMobile && (
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <img src="/logo_hass.svg" alt="logoapp" className="logo" />
            </div>
          </div>
        </div>
      )}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <li key={item.label} className="sidebar-menu-item">
              <a
                onClick={() => handleNavigate(item.path)}
                className={`sidebar-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="sidebar-label">{item.label}</span>
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
