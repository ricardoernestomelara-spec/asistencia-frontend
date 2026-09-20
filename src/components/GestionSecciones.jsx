import React from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://asistencia-backend-qgim.onrender.com/api';

const GestionSecciones = () => {
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
          // cargarSecciones(); // Recargar vista si aplica
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error("Error al vaciar alumnos:", err));
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Secciones</h2>
      {/* Contenido de tu interfaz de secciones */}
    </div>
  );
};

// ESTA LÍNEA ES LA QUE RESUELVE EL ERROR DE VERCEL/VITE:
export default GestionSecciones;