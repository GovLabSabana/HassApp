import React, { useEffect, useState } from "react";
import data from "../../../BD_Keys.json";

const proveedores = data.proveedor;

interface ProveedorSelectorProps {
  onSelect: (id: number) => void;
  value?: number;
}

const ProveedorSelector: React.FC<ProveedorSelectorProps> = ({
  onSelect,
  value,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(
    proveedores.find((p) => p.id === value) || null
  );
  const [open, setOpen] = useState(false);

  const filtered = proveedores.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (proveedor: { id: number; name: string }) => {
    setSelected(proveedor);
    setSearch(proveedor.name);
    setOpen(false);
    onSelect(proveedor.id);
  };

  useEffect(() => {
    if (value) {
      const found = proveedores.find((p) => p.id === value);
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
        placeholder="Buscar proveedor"
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
          {filtered.map((p) => (
            <li
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                padding: "8px",
                cursor: "pointer",
                color: "#000",
                backgroundColor: selected?.id === p.id ? "#e6e6e6" : "transparent",
              }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selected?.id === p.id ? "#e6e6e6" : "transparent")
              }
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProveedorSelector;
