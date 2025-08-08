import React, { useState, useEffect } from 'react';
import './Peliculas.css';

const Peliculas = ({ user, onLogout }) => {
  const [peliculas, setPeliculas] = useState([]);
  const [filteredPeliculas, setFilteredPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [productoraFilter, setProductoraFilter] = useState('');
  const [presupuestoSort, setPresupuestoSort] = useState('');
  const [productoras, setProductoras] = useState([]);
  const [error, setError] = useState('');

  const peliculasPorPagina = 10;

  useEffect(() => {
    fetchPeliculas();
  }, []);

  useEffect(() => {
    filterAndSortPeliculas();
  }, [peliculas, searchTerm, productoraFilter, presupuestoSort]);

  const fetchPeliculas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost/duca/peliculas.php');
      const data = await response.json();
      
      if (data.success) {
        setPeliculas(data.peliculas);
        // Extraer productoras únicas
        const productorasUnicas = [...new Set(data.peliculas.map(p => p.productora))];
        setProductoras(productorasUnicas.filter(p => p && p.trim() !== ''));
      } else {
        setError(data.message || 'Error al cargar las películas');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu servidor.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPeliculas = () => {
    let filtered = [...peliculas];

    // Filtro por nombre
    if (searchTerm) {
      filtered = filtered.filter(pelicula =>
        pelicula.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por productora
    if (productoraFilter) {
      filtered = filtered.filter(pelicula =>
        pelicula.productora === productoraFilter
      );
    }

    // Ordenamiento por presupuesto
    if (presupuestoSort) {
      filtered.sort((a, b) => {
        const presupuestoA = parseFloat(a.presupuesto) || 0;
        const presupuestoB = parseFloat(b.presupuesto) || 0;
        return presupuestoSort === 'asc' 
          ? presupuestoA - presupuestoB 
          : presupuestoB - presupuestoA;
      });
    }

    setFilteredPeliculas(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setProductoraFilter('');
    setPresupuestoSort('');
    setCurrentPage(1);
  };

  // Calcular películas de la página actual
  const indexInicio = (currentPage - 1) * peliculasPorPagina;
  const indexFin = indexInicio + peliculasPorPagina;
  const peliculasActuales = filteredPeliculas.slice(indexInicio, indexFin);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(filteredPeliculas.length / peliculasPorPagina);

  // Crear filas de 5 películas
  const createRows = () => {
    const rows = [];
    for (let i = 0; i < peliculasActuales.length; i += 5) {
      rows.push(peliculasActuales.slice(i, i + 5));
    }
    return rows;
  };

  const formatPresupuesto = (presupuesto) => {
    if (!presupuesto) return 'No disponible';
    const numero = parseFloat(presupuesto);
    if (numero >= 1000000) {
      return `$${(numero / 1000000).toFixed(1)}M`;
    } else if (numero >= 1000) {
      return `$${(numero / 1000).toFixed(1)}K`;
    }
    return `$${numero.toLocaleString()}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPaginas) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPaginas, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botón anterior
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-btn prev-btn"
        >
          ‹
        </button>
      );
    }

    // Primera página
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Última página
    if (endPage < totalPaginas) {
      if (endPage < totalPaginas - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button
          key={totalPaginas}
          onClick={() => handlePageChange(totalPaginas)}
          className="pagination-btn"
        >
          {totalPaginas}
        </button>
      );
    }

    // Botón siguiente
    if (currentPage < totalPaginas) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-btn next-btn"
        >
          ›
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="peliculas-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Cargando películas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="peliculas-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <h1>Dulcami</h1>
            <span className="brand-subtitle">Cinema</span>
          </div>
          
          <div className="navbar-user">
            <span className="welcome-text">¡Hola, {user?.nombre}!</span>
            <button onClick={onLogout} className="logout-btn">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filters-content">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre de película..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>

          <div className="filters-row">
            <select
              value={productoraFilter}
              onChange={(e) => setProductoraFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Todas las productoras</option>
              {productoras.map(productora => (
                <option key={productora} value={productora}>
                  {productora}
                </option>
              ))}
            </select>

            <select
              value={presupuestoSort}
              onChange={(e) => setPresupuestoSort(e.target.value)}
              className="filter-select"
            >
              <option value="">Ordenar por presupuesto</option>
              <option value="asc">Menor a mayor</option>
              <option value="desc">Mayor a menor</option>
            </select>

            <button onClick={clearFilters} className="clear-filters-btn">
              Limpiar filtros
            </button>
          </div>

          <div className="results-info">
            <span>Mostrando {filteredPeliculas.length} películas</span>
            <span>Página {currentPage} de {totalPaginas}</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-container">
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={fetchPeliculas} className="retry-btn">
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Películas */}
      {!error && (
        <div className="peliculas-content">
          {filteredPeliculas.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🎬</div>
              <h3>No se encontraron películas</h3>
              <p>Prueba con otros filtros de búsqueda</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Ver todas las películas
              </button>
            </div>
          ) : (
            <>
              <div className="peliculas-grid">
                {createRows().map((row, rowIndex) => (
                  <div key={rowIndex} className="peliculas-row">
                    {row.map((pelicula, index) => (
                      <div
                        key={pelicula.id}
                        className="pelicula-card"
                        style={{
                          animationDelay: `${(rowIndex * 5 + index) * 0.1}s`
                        }}
                      >
                        <div className="card-inner">
                          <div className="card-front">
                            <div className="card-header">
                              <h3 className="pelicula-titulo">{pelicula.titulo}</h3>
                            </div>
                            <div className="card-body">
                              <div className="info-item">
                                <span className="info-label">Año:</span>
                                <span className="info-value">{pelicula.anio || 'N/A'}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Género:</span>
                                <span className="info-value">{pelicula.genero || 'N/A'}</span>
                              </div>
                              <div className="card-flip-hint">
                                <span>Hover para más info</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="card-back">
                            <div className="card-back-content">
                              <h3 className="pelicula-titulo-back">{pelicula.titulo}</h3>
                              <div className="back-info">
                                <div className="info-item">
                                  <span className="info-label">Productora:</span>
                                  <span className="info-value">{pelicula.productora || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Director:</span>
                                  <span className="info-value">{pelicula.director || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Presupuesto:</span>
                                  <span className="info-value budget">
                                    {formatPresupuesto(pelicula.presupuesto)}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Duración:</span>
                                  <span className="info-value">{pelicula.duracion || 'N/A'} min</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="pagination-container">
                  <div className="pagination">
                    {renderPagination()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Peliculas;