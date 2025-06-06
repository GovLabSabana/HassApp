import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { FiMail, FiLock } from "react-icons/fi";
import "../Loginstyles.css";

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
      navigate("/Dashboard");
    } catch (error) {
      // Manejo del error en el catch sin loguearlo en la consola
      setError('Ocurrió un error. Intenta nuevamente más tarde.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-icon">
              <img src="/logo_hass.svg" alt="Logo de HassApp" className="logo-img" />
            </div>
            <h2 className="login-title">Login</h2>
            <p className="login-subtitle">Accede a tu cuenta</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                Correo Electrónico
              </label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo"
                  required
                   className="login-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                Contraseña
              </label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  className="login-input"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="login-button"
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>
              ¿No tienes cuenta?
              <Link to="/Signup" className="signup-link">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}