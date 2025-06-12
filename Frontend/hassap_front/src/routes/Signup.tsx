import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link } from 'react-router-dom';
import '../Signupstyles.css'; // Importar el archivo CSS

type FormInputs = {
  email: string;
  password: string;
  tipo_persona: string;
  razon_social: string;
  telefono: string;
  direccion?: string;
  pagina_web?: string;
  tipo_documento_id: number;
  num_documento: string;
  rut_document?: FileList;
  logo_document?: FileList;
};

export default function Signup() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormInputs>({
    defaultValues: {
      email: '',
      password: '',
      tipo_persona: '',
      razon_social: '',
      telefono: '',
      direccion: '',
      pagina_web: '',
      tipo_documento_id: undefined,
      num_documento: '',
    }
  });

  const onSubmit = async (data: FormInputs) => {
    const formData = new FormData();

    // Agregar campos de texto
    Object.entries(data).forEach(([key, value]) => {
      if (key === "rut_document" || key === "logo_document") return;
      if (value !== undefined && value !== '') {
        const finalValue = key === "tipo_documento_id" && value ? Number(value) : value;
        formData.append(key, finalValue as string);
      }
    });

    // Manejar archivos de forma más segura
    if (data.rut_document && data.rut_document.length > 0) {
      formData.append("rut_document", data.rut_document[0]);
    }

    if (data.logo_document && data.logo_document.length > 0) {
      formData.append("logo_document", data.logo_document[0]);
    }

    // Debug: Ver qué se está enviando
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
    const response = await fetch(`${API_URL}/auth/custom/register`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("¡Registro exitoso!");
      navigate("/");
    } else {
      const errorData = await response.json();
      console.error("Error response:", errorData);

      if (
        errorData?.message?.toLowerCase?.().includes("correo") ||
        errorData?.error?.toLowerCase?.().includes("correo") ||
        errorData?.email
      ) {
        setError("email", {
          type: "manual",
          message: "Este correo electrónico ya está registrado.",
        });
      } else {
        alert("Error en el registro: " + JSON.stringify(errorData));
      }
    }
  } catch (err) {
    console.error("Connection error:", err);
    alert("Error en la conexión: " + err);
  }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Regístrate</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="signup-form">

          <Controller
            name="email"
            control={control}
            rules={{
              required: "El email es requerido",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "El email no es válido",
              },
            }}
            render={({ field }) => (
              <div className="field-container">
                <label className="form-label">Email *</label>
                <input
                  {...field}
                  type="email"
                  placeholder="tu@email.com"
                  className="form-input email-input"
                />
                {errors.email?.message && (
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    {errors.email.message}
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: "La contraseña es requerida" }}
            render={({ field }) => (
              <div className="field-container">
                <label className="form-label">Contraseña *</label>
                <input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  className="form-input password-input"
                />
                {errors.password?.message && (
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    {errors.password.message}
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name="tipo_persona"
            control={control}
            rules={{ required: "El tipo de persona es requerido" }}
            render={({ field }) => (
              <div className="field-container">
                <label className="form-label">Tipo de Persona *</label>
                <select {...field} className="form-select person-type-select">
                  <option value="">Seleccionar...</option>
                  <option value="natural">Natural</option>
                  <option value="juridica">Jurídica</option>
                </select>
                {errors.tipo_persona && (
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    Seleccione el tipo de persona
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name="razon_social"
            control={control}
            rules={{ required: "La razón social es requerida" }}
            render={({ field }) => (
              <div className="field-container">
                <label className="form-label">Nombre ó Razón Social *</label>
                <input
                  {...field}
                  type="text"
                  placeholder="Nombre propio o de empresa (si aplica)"
                  className="form-input name-input"
                />
                {errors.razon_social?.message && (
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    {errors.razon_social.message}
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name="telefono"
            control={control}
            rules={{
              required: "El teléfono es requerido",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "El teléfono debe tener exactamente 10 dígitos numéricos",
              },
            }}
            render={({ field }) => (
              <div className="field-container">
                <label className="form-label">Teléfono *</label>
                <input
                  {...field}
                  type="tel"
                  placeholder="312 234 5678"
                  className="form-input phone-input"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                />
                {errors.telefono?.message && (
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    {errors.telefono.message}
                  </div>
                )}
              </div>
            )}
          />

          <div className="form-grid">
            <Controller
              name="direccion"
              control={control}
              render={({ field }) => (
                <div className="field-container">
                  <label className="form-label">Dirección</label>
                  <input
                    {...field}
                    type="text"
                    placeholder="Tu dirección"
                    className="form-input address-input"
                  />
                </div>
              )}
            />

            <Controller
              name="pagina_web"
              control={control}
              render={({ field }) => (
                <div className="field-container">
                  <label className="form-label">Página Web</label>
                  <input
                    {...field}
                    type="url"
                    placeholder="https://tu-sitio.com"
                    className="form-input website-input"
                  />
                </div>
              )}
            />
          </div>

          <div className="form-grid">
            <Controller
              name="tipo_documento_id"
              control={control}
              rules={{ required: "El tipo de documento es requerido" }}
              render={({ field }) => (
                <div className="field-container">
                  <label className="form-label">Tipo de Documento *</label>
                  <select {...field} className="form-select document-type-select">
                    <option value="">Seleccionar...</option>
                    <option value={1}>Cédula de Ciudadanía</option>
                    <option value={2}>NIT</option>
                    <option value={3}>Cédula de Extranjería</option>
                  </select>
                  {errors.tipo_documento_id && (
                    <div className="error-message">
                      <span className="error-icon">⚠</span>
                      Campo requerido
                    </div>
                  )}
                </div>
              )}
            />

            <Controller
              name="num_documento"
              control={control}
              rules={{
                required: "El número de documento es requerido",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "El número de documento debe contener solo números"
                }
              }}
              render={({ field }) => (
                <div className="field-container">
                  <label className="form-label">Número de Documento *</label>
                  <input
                    {...field}
                    type="text"
                    placeholder="123456789"
                    className="form-input document-input"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                  {errors.num_documento?.message && (
                    <div className="error-message">
                      <span className="error-icon">⚠</span>
                      {errors.num_documento.message}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <div className="form-grid">
            <Controller
              name="rut_document"
              control={control}
              render={({ field: { onChange, name } }) => (
                <div>
                  <label className="form-label">Documento RUT</label>
                  <input
                    type="file"
                    name={name}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onChange(e.target.files);
                    }}
                    className="form-file-input"
                  />
                  {errors.rut_document?.message && (
                    <div className="error-message">
                      <span className="error-icon">⚠</span>
                      {errors.rut_document.message}
                    </div>
                  )}
                </div>
              )}
            />

            <Controller
              name="logo_document"
              control={control}
              render={({ field: { onChange, name } }) => (
                <div>
                  <label className="form-label">Logo de la Empresa</label>
                  <input
                    type="file"
                    name={name}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onChange(e.target.files);
                    }}
                    className="form-file-input"
                  />
                  {errors.logo_document?.message && (
                    <div className="error-message">
                      <span className="error-icon">⚠</span>
                      {errors.logo_document.message}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <button type="submit" className="submit-button">
            <span className="submit-button-content">
              <svg className="submit-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Registrarse
            </span>
          </button>

          <div className="signup-footer">
            <p className="signup-footer-text">¿Ya tienes cuenta?</p>
            <Link to="/" className="login-button-register">
              Iniciar sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}