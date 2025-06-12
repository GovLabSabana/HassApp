import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Loginstyles.css";

export default function ForgotPass() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      // Verifica si el email está registrado
      const usersResponse = await fetch(`${API_URL}/usuarios/`);
      const users = await usersResponse.json();
      const isRegistered = users.some((user: any) => user.email === email);

      if (!isRegistered) {
        setError('Este correo no está registrado.');
        setLoading(false);
        return;
      }

      // Enviar el correo para recuperación
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Error al enviar el correo de recuperación.');
      } else {
        setSuccess('Correo de recuperación enviado con éxito.');
      }

    } catch (err) {
      setError('Ocurrió un error. Intenta más tarde.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <h2 className="login-title">Recupere su contraseña</h2>
          <p className="login-subtitle">Ingrese su correo para recibir instrucciones</p>

          {/* Mensaje de error o éxito */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSendEmail} className="login-form">
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="login-input"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
              <button 
                type="button" 
                className="login-button" 
                onClick={() => navigate('/login')}
                style={{ backgroundColor: '#ccc', color: '#000' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}