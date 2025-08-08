import React, { useState, useEffect } from 'react';
import './Register.css';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    // Crear burbujas flotantes
    const newBubbles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      speed: Math.random() * 3 + 2,
      delay: Math.random() * 10
    }));
    setBubbles(newBubbles);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost/duca/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => {
          onRegisterSuccess();
        }, 2000);
      } else {
        setError(data.message || 'Error en el registro');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Burbujas de fondo */}
      <div className="bubbles">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.speed + 5}s`
            }}
          />
        ))}
      </div>

      {/* Ondas de fondo */}
      <div className="waves">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>

      <div className="register-content">
        <div className="register-card">
          <div className="card-glow"></div>
          
          <div className="register-header">
            <h1 className="register-title">
              <span className="title-text">Únete a</span>
              <span className="title-brand">Dulcami</span>
            </h1>
            <p className="register-subtitle">Crea tu cuenta y descubre películas increíbles</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <div className="input-container">
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="form-input"
                    id="nombre"
                  />
                  <label htmlFor="nombre" className="form-label">
                    <span className="label-text">Nombre completo</span>
                  </label>
                  <div className="input-highlight"></div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="input-container">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    id="email"
                  />
                  <label htmlFor="email" className="form-label">
                    <span className="label-text">Correo electrónico</span>
                  </label>
                  <div className="input-highlight"></div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="input-container">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                    id="password"
                  />
                  <label htmlFor="password" className="form-label">
                    <span className="label-text">Contraseña</span>
                  </label>
                  <div className="input-highlight"></div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="input-container">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-input"
                    id="confirmPassword"
                  />
                  <label htmlFor="confirmPassword" className="form-label">
                    <span className="label-text">Confirmar contraseña</span>
                  </label>
                  <div className="input-highlight"></div>
                </div>
              </div>
            </div>

            {error && (
              <div className="message error-message">
                <div className="message-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="message success-message">
                <div className="message-icon">✅</div>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`register-button ${isLoading ? 'loading' : ''}`}
            >
              <div className="button-content">
                <span className="button-text">
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </span>
                {isLoading && <div className="button-spinner"></div>}
              </div>
              <div className="button-ripple"></div>
            </button>

            <div className="register-footer">
              <p>¿Ya tienes una cuenta?</p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="switch-link"
              >
                <span>Inicia sesión</span>
                <div className="link-underline"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;