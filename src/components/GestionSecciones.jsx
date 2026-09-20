import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import CargaMasivaModal from './CargaMasivaModal';

export default function GestionSecciones() {
  const [secciones, setSecciones] = useState([]);
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  const [mostrarModalCarga, setMostrarModalCarga] = useState(false);

  const cargarSecciones = () => {
    fetch(`${API_BASE}/obtener_catalogos.php`)
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

  // ... (mantener handleSubmit, seleccionarEditar, eliminarSeccion, limpiarFormulario de la versión previa) ...

  return (
    <div className="app-main-container">
      <div className="panel-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-secondary m-0">Gestión de Secciones</h5>
          <button 
            type="button" 
            className="btn btn-primary fw-bold" 
            onClick={() => setMostrarModalCarga(true)}
          >
            + Cargar Alumnos vía CSV
          </button>
        </div>

        {/* ... (mantener alertas, formulario y tabla de secciones) ... */}

      </div>

      {mostrarModalCarga && (
        <CargaMasivaModal 
          secciones={secciones} 
          onClose={() => setMostrarModalCarga(false)} 
          onSuccess={cargarSecciones} 
        />
      )}
    </div>
  );
}