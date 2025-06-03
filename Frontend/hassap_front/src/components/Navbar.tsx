import * as React from 'react';
import { useState } from "react";
import '../componentsStyles/Navbar.css';

type NavItem = {
  title: string;
  subItems?: string[];
};

export const Navbar: React.FC = () => {
  const navItems: NavItem[] = [
    { title: 'Nosotros', subItems: ['Historia', 'Equipo'] },
    { title: 'Iniciativas' },
    { title: 'Alianzas' },
    { title: 'EduHass' },
    { title: 'Infórmate', subItems: ['Blog', 'Noticias'] },
  ];

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="normal">Corpo</span><span className="bold">hass</span>
      </div>
      <ul className="navbar-menu">
        {navItems.map((item) => (
          <li 
            key={item.title}
            onMouseEnter={() => item.subItems && setActiveDropdown(item.title)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <a href="#">{item.title}{item.subItems && ' ▼'}</a>
            {item.subItems && activeDropdown === item.title && (
              <ul className="dropdown">
                {item.subItems.map((subItem) => (
                  <li key={subItem}>
                    <a href="#">{subItem}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};