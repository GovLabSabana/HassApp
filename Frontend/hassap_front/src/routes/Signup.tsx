import { useForm, Controller } from "react-hook-form";
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { SelectInput } from '../components/SelectInput';
import { FileInput } from '../components/FileInput';

type FormInputs = {
  email: string;
  password: string;
  tipo_persona: string;
  razon_social: string;
  telefono: string;
  direccion?: string;
  pagina_web?: string;
  tipo_documento_id: number; // Cambiado a string para compatibilidad con Input
  num_documento: string;
  rut_document?: FileList;
  logo_document?: FileList;
};

export default function Signup() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const onSubmit = async (data: FormInputs) => {
    const formData = new FormData();

    // Campos de texto
    Object.entries(data).forEach(([key, value]) => {
      if (key === "rut_document" || key === "logo_document") return;
      if (value !== undefined) {
        // Convertir tipo_documento_id a número si existe
        const finalValue = key === "tipo_documento_id" && value ? Number(value) : value;
        formData.append(key, finalValue as string);
      }
    });

    // Archivos
    if (data.rut_document?.[0]) {
      formData.append("rut_document", data.rut_document[0]);
    }

    if (data.logo_document?.[0]) {
      formData.append("logo_document", data.logo_document[0]);
    }

    try {
      const response = await fetch("https://hassapp-production.up.railway.app/auth/custom/register", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("¡Registro exitoso!");
      } else {
        const error = await response.json();
        alert("Error en el registro: " + JSON.stringify(error));
      }
    } catch (err) {
      alert("Error en la conexión: " + err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4">
      <h1>Signup</h1>
    <Controller
        name="email"
        control={control}
        rules={{ required: "El email es requerido" }}
        render={({ field }) => (
        <Input
            {...field}
            label="Email *"
            placeholder="tu@email.com"
            type="email"
            errorMessage={errors.email?.message}
        />
        )}
    />

    <Controller
        name="password"
        control={control}
        rules={{ required: "La contraseña es requerida" }}
        render={({ field }) => (
        <Input
            {...field}
            label="Contraseña *"
            placeholder="••••••••"
            type="password"
            errorMessage={errors.password?.message}
        />
        )}
    />

    <Controller
        name="tipo_persona"
        control={control}
        rules={{ required: "El tipo de persona es requerido" }}
        render={({ field }) => (
        <SelectInput
            {...field}
            label="Tipo de Persona *"
            options={[
            { value: "natural", label: "Natural" },
            { value: "juridica", label: "Jurídica" },
            ]}
            errorMessage={errors.tipo_persona && "Seleccione el tipo de persona"}
        />
        )}
    />

    <Controller
        name="razon_social"
        control={control}
        rules={{ required: "La razón social es requerida" }}
        render={({ field }) => (
        <Input
            {...field}
            label="Nombre ó Razón Social *"
            placeholder="Nombre propio o de empresa (si aplica)"
            errorMessage={errors.razon_social?.message}
        />
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
        <Input
        {...field}
        label="Teléfono *"
        placeholder="312 234 5678"
        type="tel"
        errorMessage={errors.telefono?.message}
        />
    )}
    />

    <Controller
        name="direccion"
        control={control}
        render={({ field }) => (
        <Input
            {...field}
            label="Dirección"
            placeholder="Tu dirección"
        />
        )}
    />

    <Controller
        name="pagina_web"
        control={control}
        render={({ field }) => (
        <Input
            {...field}
            label="Página Web"
            placeholder="https://tu-sitio.com"
            type="url"
        />
        )}
    />

    <Controller
        name="tipo_documento_id"
        control={control}
        rules={{ required: "El tipo de documento es requerido" }}
        render={({ field }) => (
        <SelectInput
            label="Tipo de Documento *"
            value={field.value}
            onChange={field.onChange}
            name={field.name}
            options={[
            { value: 1, label: "Cédula de Ciudadanía" },
            { value: 2, label: "Cédula de Extranjería" },
            { value: 3, label: "Pasaporte" },
            { value: 4, label: "NIT" },
            ]}
            errorMessage={errors.tipo_documento_id && "Campo requerido"}
        />
        )}
    />

    <Controller
        name="num_documento"
        control={control}
        rules={{ required: "El número de documento es requerido" }}
        render={({ field }) => (
        <Input
            {...field}
            label="Número de Documento *"
            placeholder="123456789"
            errorMessage={errors.num_documento?.message}
        />
        )}
    />

    <Controller
    name="rut_document"
    control={control}
    render={({ field }) => (
        <FileInput
        {...field}
        label="Documento RUT"
        accept="application/pdf,image/*"
        errorMessage={errors.rut_document?.message}
        />
    )}
    />

    <Controller
    name="logo_document"
    control={control}
    render={({ field }) => (
        <FileInput
        label="Logo (Imagen)"
        accept="image/*"
        name={field.name}
        onChange={field.onChange}
        errorMessage={errors.logo_document?.message}
        />
    )}
    />

    <Button type="submit" className="w-full">
        Registrarse
    </Button>
    </form>

  );
}