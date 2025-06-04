import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');  // Para manejar el error
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar los campos
    if (!email || !password) {
      setError('Por favor, ingresa tu correo electrónico y contraseña.');
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', email);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', '');
      formData.append('client_secret', '');

      const response = await fetch('https://hassapp-production.up.railway.app/auth/jwt/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      // Si la respuesta no es exitosa, manejarlo sin lanzar el error
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        // Mostrar un mensaje de error específico si lo proporciona el servidor
        if (errorData.detail && errorData.detail[0] && errorData.detail[0].msg) {
          setError(errorData.detail[0].msg); // Mostrar el mensaje específico de error (por ejemplo, "Invalid credentials")
        } else {
          setError('Login fallido. Revisa tus credenciales.');
        }
        return;
      }

      const data = await response.json();
      console.log('Login exitoso:', data);

      // Guardar token en localStorage
      localStorage.setItem('access_token', data.access_token);

      // Redirigir a dashboard
      navigate("/dashboard");
    } catch (error) {
      // Manejo del error en el catch sin loguearlo en la consola
      setError('Ocurrió un error. Intenta nuevamente más tarde.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>

      {/* Mostrar mensaje de error si lo hay */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ingresa tu correo"
        required
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Ingresa tu contraseña"
        required
      />

      <Button variant="primary" type="submit">
        Iniciar sesión
      </Button>

      <div>
        <p>¿No tienes cuenta?</p>
        <Link to="/signup">
          <Button variant="secondary">
            Crear cuenta
          </Button>
        </Link>
      </div>
    </form>
  );
}