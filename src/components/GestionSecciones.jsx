import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://asistencia-backend-qgim.onrender.com/api';

const GestionSecciones = () => {
  const [secciones, setSecciones] = useState([]);

  // Cargar lista de secciones
  const cargarSecciones = () => {
    fetch(`${API_BASE}/gestion_secciones.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSecciones(data.secciones || []);
        }
      })
      .catch((err) => console.error("Error al cargar secciones:", err));
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  // Función para vaciar alumnos de la sección
  const vaciarAlumnos = (seccionId, nombreSeccion) => {
    if (!window.confirm(`¿Seguro que deseas vaciar TODOS los alumnos cargados en '${nombreSeccion}'?`)) {
      return;
    }

    fetch(`${API_BASE}/gestion_secciones.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vaciar_alumnos', seccion_id: seccionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          cargarSecciones();
        } else {
          alert("Error: " + (data.message || "No se pudo vaciar la sección."));
        }
      })
      .catch((err) => console.error("Error al vaciar alumnos:", err));
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h3 className="fw-bold mb-3">Gestión de Secciones</h3>
        <p className="text-muted">Administra las secciones registradas en el sistema.</p>
        
        <div className="table-responsive mt-3">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre de la Sección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {secciones.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-3 text-muted">
                    No hay secciones registradas o cargadas.
                  </td>
                </tr>
              ) : (
                secciones.map((sec, index) => (
                  <tr key={sec.id || index}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{sec.nombre || sec.seccion}</td>
                    <td>
                      <button 
                        onClick={() => vaciarAlumnos(sec.id, sec.nombre || sec.seccion)} 
                        className="btn btn-outline-danger btn-sm fw-bold"
                      >
                        Vaciar Alumnos
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// EXPORTACIÓN POR DEFECTO PARA CORREGIR EL ERROR DE VERCEL
export default GestionSecciones;