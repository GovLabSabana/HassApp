import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../componentsStyles/Accountedit.css";

export default function AccountEdit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo_persona: "",
    razon_social: "",
    telefono: "",
    direccion: "",
    pagina_web: "",
    tipo_documento_id: 0,
    num_documento: "",
    rut_document: null as File | null,
    logo_document: null as File | null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token") || "";

  const tipoDocumentoOpciones = [
    { id: 1, name: "Cédula de Ciudadanía" },
    { id: 2, name: "NIT" },
    { id: 3, name: "Pasaporte" },
    { id: 4, name: "Cédula de Extranjería" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("No se pudo obtener usuario");
        const data = await res.json();

        setFormData({
          tipo_persona: data.tipo_persona || "",
          razon_social: data.razon_social || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
          pagina_web: data.pagina_web || "",
          tipo_documento_id: data.tipo_documento_id || 0,
          num_documento: data.num_documento || "",
          rut_document: null,
          logo_document: null,
        });
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, navigate, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [e.target.name]: file }));
  };

  const validarCampos = () => {
    const errors: Record<string, string> = {};
    const soloLetras = /^[A-Za-z\s]+$/;
    const soloNumeros = /^\d+$/;

    if (
      !formData.tipo_persona ||
      !["Natural", "Jurídica"].includes(formData.tipo_persona)
    ) {
      errors.tipo_persona = "Tipo de persona inválido.";
    }

    if (!soloLetras.test(formData.razon_social)) {
      errors.razon_social = "La razón social solo debe contener letras.";
    }

    if (
      !soloNumeros.test(formData.telefono) ||
      formData.telefono.length !== 10
    ) {
      errors.telefono =
        "El teléfono debe tener exactamente 10 dígitos numéricos.";
    }

    if (
      !formData.tipo_documento_id ||
      isNaN(Number(formData.tipo_documento_id))
    ) {
      errors.tipo_documento_id = "Debes seleccionar un tipo de documento.";
    }

    if (!soloNumeros.test(formData.num_documento)) {
      errors.num_documento =
        "El número de documento debe contener solo números.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarCampos()) return;
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formDataToSend.append(key, value as string | Blob);
        }
      });

      const res = await fetch(`${API_URL}/usuarios/update/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Error al actualizar usuario");
      navigate("/account");
    } catch (err) {
      console.error(err);
      setError("Error al actualizar los datos");
    }
  };

  if (loading) return <div className="account-loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="account-main">
      <div className="account-content-wrapper">
        <h2 className="account-title">Editar Cuenta</h2>
        <form onSubmit={handleSubmit} className="account-info">
          {/* Tipo de Persona */}
          <div className="account-section">
            <label className="account-field">
              Tipo de Persona:
              <select
                name="tipo_persona"
                value={formData.tipo_persona}
                onChange={handleChange}
                className="account-field-value"
              >
                <option value="">Selecciona</option>
                <option value="Natural">Natural</option>
                <option value="Jurídica">Jurídica</option>
              </select>
              {fieldErrors.tipo_persona && (
                <span className="error">{fieldErrors.tipo_persona}</span>
              )}
            </label>
          </div>

          {/* Razón Social */}
          <div className="account-section">
            <label className="account-field">
              Razón Social:
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleChange}
                className="account-field-value"
              />
              {fieldErrors.razon_social && (
                <span className="error">{fieldErrors.razon_social}</span>
              )}
            </label>
          </div>

          {/* Teléfono */}
          <div className="account-section">
            <label className="account-field">
              Teléfono:
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="account-field-value"
              />
              {fieldErrors.telefono && (
                <span className="error">{fieldErrors.telefono}</span>
              )}
            </label>
          </div>

          {/* Dirección */}
          <div className="account-section">
            <label className="account-field">
              Dirección:
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="account-field-value"
              />
            </label>
          </div>

          {/* Página Web */}
          <div className="account-section">
            <label className="account-field">
              Página Web:
              <input
                type="text"
                name="pagina_web"
                value={formData.pagina_web}
                onChange={handleChange}
                className="account-field-value"
              />
            </label>
          </div>

          {/* Tipo de Documento */}
          <div className="account-section">
            <label className="account-field">
              Tipo de Documento:
              <select
                name="tipo_documento_id"
                value={formData.tipo_documento_id}
                onChange={handleChange}
                className="account-field-value"
              >
                <option value={0}>Selecciona</option>
                {tipoDocumentoOpciones.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.name}
                  </option>
                ))}
              </select>
              {fieldErrors.tipo_documento_id && (
                <span className="error">{fieldErrors.tipo_documento_id}</span>
              )}
            </label>
          </div>

          {/* Número de Documento */}
          <div className="account-section">
            <label className="account-field">
              Número de Documento:
              <input
                type="text"
                name="num_documento"
                value={formData.num_documento}
                onChange={handleChange}
                className="account-field-value"
              />
              {fieldErrors.num_documento && (
                <span className="error">{fieldErrors.num_documento}</span>
              )}
            </label>
          </div>

          {/* Documento RUT */}
          <div className="account-section">
            <label className="account-field">
              Documento RUT (PDF):
              <input
                type="file"
                id="rut_document"
                name="rut_document"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="rut_document" className="account-file-btn">
                Seleccionar archivo
              </label>
              {formData.rut_document && (
                <div className="account-file-name">{formData.rut_document.name}</div>
              )}
            </label>
          </div>

          {/* Logo de la Empresa */}
          <div className="account-section">
            <label className="account-field">
              Logo de la Empresa (Imagen):
              <input
                type="file"
                id="logo_document"
                name="logo_document"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="logo_document" className="account-file-btn">
                Seleccionar archivo
              </label>
              {formData.logo_document && (
                <div className="account-file-name">{formData.logo_document.name}</div>
              )}
            </label>
          </div>

          {/* Botones */}
          <button type="submit" className="account-edit-btn">
            Guardar Cambios
          </button>
          <button
            type="button"
            className="account-edit-btn"
            style={{ marginLeft: "10px", backgroundColor: "#666" }}
            onClick={() => navigate("/account")}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
