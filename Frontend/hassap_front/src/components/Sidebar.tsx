import * as React from 'react';
import './Sidebar.css';

type SidebarItem = {
  label: string;
  icon?: string;
  active?: boolean;
};

export const Sidebar: React.FC = () => {
  const items: SidebarItem[] = [
    { label: 'Inicio', active: true },
    { label: 'Sostenibilidad' },
    { label: 'Proyectos' },
    { label: 'Contacto' },
  ];

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">Menú</h3>
      <ul className="sidebar-menu">
        {items.map((item) => (
          <li key={item.label}>
            <a 
              href="#" 
              className={item.active ? 'active' : ''}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};