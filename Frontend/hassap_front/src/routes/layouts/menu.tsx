import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import "./menu.css";

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="layout-container">
      {isMobile && (
        <header className="mobile-header">
          <div className="mobile-logo">
            <img src="/logo_hass.svg" alt="logoapp" className="mobile-logo" />
          </div>
          <button className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
        </header>
      )}

      <div
        className={`layout-sidebar ${isMobile ? "mobile" : ""} ${
          isSidebarOpen ? "open" : ""
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      <main className="layout-main">
        <div>{children}</div>
      </main>
    </div>
  );
}
