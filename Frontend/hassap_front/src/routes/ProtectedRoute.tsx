import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('access_token');
      setIsAuth(!!token);
    };

    const intervalId = setInterval(checkToken, 1000); // Verifica cada segundo

    return () => clearInterval(intervalId); // Limpieza
  }, []);

  return isAuth ? <Outlet /> : <Navigate to="/" />;
}