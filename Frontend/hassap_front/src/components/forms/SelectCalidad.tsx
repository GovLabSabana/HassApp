import React, { useEffect, useState } from "react";
import data from "../../../BD_Keys.json";

const calidadesOriginal = data.calidad;
const defaultOption = { id: 0, name: "Todas las calidades" };
const calidades = [defaultOption, ...calidadesOriginal];

interface CalidadSelectorProps {
  onSelect: (id: number | null) => void;
  value?: number | null;
}

const CalidadSelector: React.FC<CalidadSelectorProps> = ({
  onSelect,
  value,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: number; name: string }>(
    calidades.find((c) => c.id === value) || defaultOption
  );
  const [open, setOpen] = useState(false);

  const filtered = calidades.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (calidad: { id: number; name: string }) => {
    setSelected(calidad);
    setSearch(calidad.id === 0 ? "" : calidad.name);
    setOpen(false);
    onSelect(calidad.id === 0 ? null : calidad.id);
  };

  useEffect(() => {
    if (value === undefined || value === null) {
      setSelected(defaultOption);
      setSearch("");
    } else {
      const found = calidades.find((c) => c.id === value);
      if (found) {
        setSelected(found);
        setSearch(found.name);
      }
    }
  }, [value]);

  return (
    <div style={{ width: "250px", fontFamily: "sans-serif", position: "relative" }}>
      <input
        type="text"
        value={search}
        placeholder="Buscar calidad"
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
          {filtered.map((c) => (
            <li
              key={c.id}
              onClick={() => handleSelect(c)}
              style={{
                padding: "8px",
                cursor: "pointer",
                color: "#000",
                backgroundColor:
                  selected?.id === c.id ? "#e6e6e6" : "transparent",
              }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f2f2f2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selected?.id === c.id ? "#e6e6e6" : "transparent")
              }
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalidadSelector;
