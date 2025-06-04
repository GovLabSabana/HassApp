import { Navigate } from "react-router-dom";
import React from "react";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const isAuth = !!token;

  return isAuth ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
