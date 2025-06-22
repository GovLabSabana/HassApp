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
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SyncLoader color="#36d7b7" />
      <p style={{ marginTop: "1rem", fontSize: "1.25rem", color: "#555" }}>
        {text}
      </p>
    </div>
  );
};

export default Loader;
