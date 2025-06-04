import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Login exitoso:', data);
      // Guardar token en localStorage
      localStorage.setItem('access_token', data.access_token);

      // Redirigir a dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error('Error en el login:', error);
      alert('Login fallido. Revisa tus credenciales.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>

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
    </form>
  );
}