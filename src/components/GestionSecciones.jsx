import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://asistencia-backend-qgim.onrender.com/api';

const GestionSecciones = () => {
  const [secciones, setSecciones] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  const [procesandoCsv, setProcesandoCsv] = useState(false);

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

  // Función para procesar y subir archivo CSV
  const handleSubirCSV = (e) => {
    e.preventDefault();
    if (!archivo) {
      alert('Por favor selecciona un archivo CSV.');
      return;
    }
    if (!seccionSeleccionada) {
      alert('Por favor selecciona la sección destino.');
      return;
    }

    setProcesandoCsv(true);

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('seccion', seccionSeleccionada);

    fetch(`${API_BASE}/subir_estudiantes_csv.php`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.ok) {
          alert(data.message || 'Carga masiva completada con éxito.');
          setArchivo(null);
          const input = document.getElementById('input-file-csv');
          if (input) input.value = '';
          cargarSecciones();
        } else {
          alert("Error: " + (data.message || "No se pudo procesar el archivo."));
        }
      })
      .catch((err) => {
        console.error("Error al subir CSV:", err);
        alert("Error de conexión al subir el archivo.");
      })
      .finally(() => setProcesandoCsv(false));
  };

  return (
    <div className="container mt-4">
      {/* 1. Tarjeta de Carga Masiva (CSV) */}
      <div className="card shadow-sm p-4 mb-4 border-primary">
        <h4 className="fw-bold text-primary mb-2">📂 Carga Masiva de Alumnos (CSV)</h4>
        <p className="text-muted small mb-3">
          Selecciona la sección y sube el archivo CSV con los integrantes de la sección.
        </p>

        <form onSubmit={handleSubirCSV} className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label fw-bold small text-secondary">SECCIÓN DESTINO</label>
            <select
              className="form-select form-select-sm"
              value={seccionSeleccionada}
              onChange={(e) => setSeccionSeleccionada(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Sección --</option>
              <option value="1° A Software">1° A Software</option>
              <option value="1° B Software">1° B Software</option>
              {secciones.map((sec) => (
                <option key={sec.id || sec.nombre || sec.seccion} value={sec.nombre || sec.seccion}>
                  {sec.nombre || sec.seccion}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-bold small text-secondary">ARCHIVO CSV</label>
            <input
              id="input-file-csv"
              type="file"
              accept=".csv"
              className="form-control form-control-sm"
              onChange={(e) => setArchivo(e.target.files[0])}
              required
            />
          </div>

          <div className="col-md-3">
            <button
              type="submit"
              disabled={procesandoCsv}
              className="btn btn-primary btn-sm w-100 fw-bold"
            >
              {procesandoCsv ? 'Subiendo...' : '📥 Cargar Alumnos'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Tabla Principal de Gestión */}
      <div className="card shadow-sm p-4">
        <h3 className="fw-bold mb-1">Gestión de Secciones</h3>
        <p className="text-muted">Administra las secciones registradas en el sistema.</p>
        
        <div className="table-responsive mt-3">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre de la Sección</th>
                <th className="text-end">Acciones</th>
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
                    <td className="text-end">
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