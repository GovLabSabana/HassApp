import React, { useEffect, useState } from "react";
import { SyncLoader } from "react-spinners";

interface LoaderProps {
  text?: string;
  visible?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  text = "Cargando...",
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      <SyncLoader color="#4a7a4a" />
      <p style={{ marginTop: "1rem", fontSize: "1.25rem", color: "#555" }}>
        {text}
      </p>
    </div>
  );
};

export default Loader;
