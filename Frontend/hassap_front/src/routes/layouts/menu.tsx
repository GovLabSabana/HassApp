import React from "react";
import "../../componentsStyles/Layout.css"; // Opcional: Estilos globales
import { Sidebar } from "../../components/Sidebar";

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      <div className="layout-sidebar">
        <Sidebar />
      </div>

      <main className="layout-main">{children}</main>
    </div>
  );
}
