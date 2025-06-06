import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../componentsStyles/Sidebar.css';

type SidebarItem = {
  label: string;
  path: string;
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items: SidebarItem[] = [
    { label: 'Inicio', path: '/dashboard' },
    { label: 'Cuenta', path: '/account' },
    { label: 'Predios', path: '/properties' },
    { label: 'Producción', path: '/production' },
    { label: 'Exportación', path: '/export' },
    { label: 'Insumos', path: '/inputs' },
  ];

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">Menú</h3>
      <ul className="sidebar-menu">
        {items.map((item) => (
          <li key={item.label}>
            <a
              onClick={() => navigate(item.path)}
              className={location.pathname === item.path ? 'active' : ''}
              style={{ cursor: 'pointer' }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};
