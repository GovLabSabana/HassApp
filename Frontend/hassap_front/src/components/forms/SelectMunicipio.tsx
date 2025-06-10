import React, { useState } from "react";
import data from "../../../BD_Keys.json";

const municipios = data.municipios;

interface MunicipioSelectorProps {
  onSelect: (id: number) => void;
  value?: number;
}

const MunicipioSelector: React.FC<MunicipioSelectorProps> = ({
  onSelect,
  value,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(
    municipios.find((m) => m.id === value) || null
  );
  const [open, setOpen] = useState(false);

  const filtered = municipios.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (municipio: { id: number; name: string }) => {
    setSelected(municipio);
    setSearch(municipio.name);
    setOpen(false);
    onSelect(municipio.id); // <-- Aquí enviamos solo el ID al padre
  };

  return (
    <div
      style={{ width: "250px", fontFamily: "sans-serif", position: "relative" }}
    >
      <input
        type="text"
        value={search}
        placeholder="Buscar municipio"
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "8px",
          boxSizing: "border-box",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            maxHeight: "150px",
            overflowY: "auto",
            margin: 0,
            padding: 0,
            listStyle: "none",
            zIndex: 1000,
          }}
        >
          {filtered.length === 0 && (
            <li style={{ padding: "8px", color: "#999" }}>Sin resultados</li>
          )}
          {filtered.map((m) => (
            <li
              key={m.id}
              onClick={() => handleSelect(m)}
              style={{
                padding: "8px",
                cursor: "pointer",
                backgroundColor:
                  selected?.id === m.id ? "#f0f0f0" : "transparent",
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {m.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MunicipioSelector;
