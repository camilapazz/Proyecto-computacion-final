import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Crear partículas flotantes
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost/duca/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Error en el inicio de sesión');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Partículas de fondo */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.speed + 3}s`
            }}
          />
        ))}
      </div>

      <div className="login-content">
        <div className="login-glass">
          <div className="login-header">
            <h1 className="login-title">
              <span className="title-gradient">Dulcami</span>
            </h1>
            <p className="login-subtitle">Bienvenido de vuelta</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="form-label">Correo electrónico</label>
                <div className="input-border"></div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="form-label">Contraseña</label>
                <div className="input-border"></div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`login-button ${isLoading ? 'loading' : ''}`}
            >
              <span className="button-text">
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </span>
              <div className="button-shine"></div>
            </button>

            <div className="login-footer">
              <p>¿No tienes cuenta?</p>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="switch-button"
              >
                Regístrate aquí
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Formas geométricas decorativas */}
      <div className="geometric-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
  );
};

export default Login;