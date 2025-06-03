import * as React from 'react';
import '../componentsStyles/Sidebar.css';

type SidebarItem = {
  label: string;
  icon?: string;
  active?: boolean;
};

export const Sidebar: React.FC = () => {
  const items: SidebarItem[] = [
    { label: 'Inicio', /*active: true*/ },
    { label: 'Cuenta' },
    { label: 'Predios' },
    { label: 'Producción' },
    { label: 'Exportación' },
    { label: 'Insumos' },
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