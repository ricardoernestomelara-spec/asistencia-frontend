import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const GestionSecciones = () => {
  const [secciones, setSecciones] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  const [procesandoCsv, setProcesandoCsv] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 1. Cargar lista real de secciones desde obtener_catalogos.php
  const cargarSecciones = () => {
    fetch(`${API_BASE}/obtener_catalogos.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSecciones(data.secciones || []);
        } else {
          setMensaje({ texto: 'No se pudieron cargar las secciones.', tipo: 'danger' });
        }
      })
      .catch((err) => {
        console.error("Error al cargar secciones:", err);
        setMensaje({ texto: 'Error de conexión al obtener secciones.', tipo: 'danger' });
      });
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  // 2. Función para vaciar alumnos de una sección
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
          setMensaje({ texto: data.message, tipo: 'success' });
          cargarSecciones();
        } else {
          setMensaje({ texto: data.message || 'No se pudo vaciar la sección.', tipo: 'danger' });
        }
      })
      .catch((err) => {
        console.error("Error al vaciar alumnos:", err);
        setMensaje({ texto: 'Error de red al vaciar la sección.', tipo: 'danger' });
      });
  };

  // 3. Función para subir el CSV
  const handleSubirCSV = (e) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje({ texto: 'Por favor selecciona un archivo CSV.', tipo: 'warning' });
      return;
    }
    if (!seccionSeleccionada) {
      setMensaje({ texto: 'Por favor selecciona la sección destino.', tipo: 'warning' });
      return;
    }

    setProcesandoCsv(true);
    setMensaje({ texto: '', tipo: '' });

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('seccion', seccionSeleccionada);

    fetch(`${API_BASE}/insertar_alumnos.php`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMensaje({ texto: data.message || 'Carga masiva completada con éxito.', tipo: 'success' });
          setArchivo(null);
          setSeccionSeleccionada('');
          const input = document.getElementById('input-file-csv');
          if (input) input.value = '';
          cargarSecciones();
        } else {
          setMensaje({ texto: data.message || 'No se pudo procesar el archivo.', tipo: 'danger' });
        }
      })
      .catch((err) => {
        console.error("Error al subir CSV:", err);
        setMensaje({ texto: 'Error de conexión al subir el archivo.', tipo: 'danger' });
      })
      .finally(() => setProcesandoCsv(false));
  };

  return (
    <div className="app-main-container">
      <div className="panel-card">

        {mensaje.texto && (
          <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
            {mensaje.texto}
            <button type="button" className="btn-close" onClick={() => setMensaje({ texto: '', tipo: '' })}></button>
          </div>
        )}

        {/* Zona 1: Carga Masiva de Alumnos (CSV) */}
        <div className="border border-info rounded-3 p-3 mb-4 bg-light">
          <h5 className="fw-bold text-primary mb-1">📂 Carga Masiva de Alumnos (CSV)</h5>
          <p className="text-muted small mb-3">
            Selecciona la sección y sube el archivo CSV con los integrantes de la sección.
          </p>

          <form onSubmit={handleSubirCSV} className="row g-2 align-items-end">
            <div className="col-md-5">
              <label className="form-label fw-bold small text-secondary">SECCIÓN DESTINO</label>
              <select
                className="form-select"
                value={seccionSeleccionada}
                onChange={(e) => setSeccionSeleccionada(e.target.value)}
                required
              >
                <option value="">-- Seleccionar Sección --</option>
                {secciones.map((sec) => (
                  <option key={sec.id} value={sec.nombre}>
                    {sec.nombre}
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
                className="form-control"
                onChange={(e) => setArchivo(e.target.files[0])}
                required
              />
            </div>

            <div className="col-md-3">
              <button
                type="submit"
                disabled={procesandoCsv}
                className="btn btn-info text-white w-100 fw-bold"
              >
                {procesandoCsv ? 'Subiendo...' : '📥 Cargar Alumnos'}
              </button>
            </div>
          </form>
        </div>

        {/* Zona 2: Tabla Principal de Secciones */}
        <h5 className="fw-bold text-secondary mb-1">Gestión de Secciones</h5>
        <p className="text-muted small mb-3">Administra las secciones registradas en el sistema.</p>
        
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '15%' }}># / ID</th>
                <th style={{ width: '60%' }}>NOMBRE DE LA SECCIÓN</th>
                <th style={{ width: '25%' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {secciones.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-muted py-3">
                    No hay secciones registradas o cargadas.
                  </td>
                </tr>
              ) : (
                secciones.map((sec, index) => (
                  <tr key={sec.id || index}>
                    <td>{sec.id || index + 1}</td>
                    <td className="fw-bold text-start ps-3">{sec.nombre}</td>
                    <td>
                      <button 
                        onClick={() => vaciarAlumnos(sec.id, sec.nombre)} 
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

export default GestionSecciones;