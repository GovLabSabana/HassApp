import React, { useEffect, useState } from "react";
import data from "../../../BD_Keys.json";

const municipiosOriginal = data.municipios;
const defaultOption = { id: 0, name: "Todos los municipios" };
const municipios = [defaultOption, ...municipiosOriginal];

interface MunicipioSelectorProps {
  onSelect: (id: number | null) => void;
  value?: number | null;
}

const MunicipioSelector: React.FC<MunicipioSelectorProps> = ({
  onSelect,
  value,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: number; name: string }>(
    municipios.find((m) => m.id === value) || defaultOption
  );
  const [open, setOpen] = useState(false);

  const filtered = municipios.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (municipio: { id: number; name: string }) => {
    setSelected(municipio);
    setSearch(municipio.id === 0 ? "" : municipio.name);
    setOpen(false);
    onSelect(municipio.id === 0 ? null : municipio.id);
  };

  useEffect(() => {
    if (value === undefined || value === null) {
      setSelected(defaultOption);
      setSearch("");
    } else {
      const found = municipios.find((m) => m.id === value);
      if (found) {
        setSelected(found);
        setSearch(found.name);
      }
    }
  }, [value]);

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
          color: "black",
          backgroundColor: "white",
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
                backgroundColor: selected?.id === m.id ? "#f0f0f0" : "transparent",
                color: "black",
              }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f2f2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selected?.id === m.id ? "#f0f0f0" : "transparent")
              }
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
