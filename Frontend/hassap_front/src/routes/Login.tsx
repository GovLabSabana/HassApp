import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Aquí puedes manejar el submit, validaciones, etc.
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <form>
      <h1>Login</h1>

      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ingresa tu correo"
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Ingresa tu contraseña"
      />

      <Button variant="primary" onClick={handleLogin}>
        Iniciar sesión
      </Button>
    </form>
  );
}