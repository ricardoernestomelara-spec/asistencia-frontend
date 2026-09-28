import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const GestionSecciones = () => {
  const [secciones, setSecciones] = useState([]);
  const [nuevaSeccion, setNuevaSeccion] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 1. Cargar la lista de secciones desde el backend
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

  // 2. Crear una nueva sección
  const handleCrearSeccion = (e) => {
    e.preventDefault();
    if (!nuevaSeccion.trim()) {
      setMensaje({ texto: 'Escribe el nombre de la sección.', tipo: 'warning' });
      return;
    }

    setProcesando(true);
    setMensaje({ texto: '', tipo: '' });

    fetch(`${API_BASE}/gestion_secciones.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'crear_seccion', nombre: nuevaSeccion.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMensaje({ texto: data.message || 'Sección creada con éxito.', tipo: 'success' });
          setNuevaSeccion('');
          cargarSecciones();
        } else {
          setMensaje({ texto: data.message || 'No se pudo crear la sección.', tipo: 'danger' });
        }
      })
      .catch((err) => {
        console.error("Error al crear sección:", err);
        setMensaje({ texto: 'Error de red al crear la sección.', tipo: 'danger' });
      })
      .finally(() => setProcesando(false));
  };

  // 3. Subir el CSV de alumnos a la sección
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

    setProcesando(true);
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
          setMensaje({ texto: data.message || 'Carga de estudiantes completada con éxito.', tipo: 'success' });
          setArchivo(null);
          setSeccionSeleccionada('');
          const input = document.getElementById('input-file-csv');
          if (input) input.value = '';
          cargarSecciones();
        } else {
          setMensaje({ texto: data.message || 'No se pudo procesar el archivo CSV.', tipo: 'danger' });
        }
      })
      .catch((err) => {
        console.error("Error al subir CSV:", err);
        setMensaje({ texto: 'Error de conexión al subir el archivo.', tipo: 'danger' });
      })
      .finally(() => setProcesando(false));
  };

  // 4. Vaciar los alumnos de una sección
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
          setMensaje({ texto: data.message || 'Alumnos eliminados de la sección.', tipo: 'success' });
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

  return (
    <div className="panel-card bg-white p-4 rounded shadow-sm">
      <h4 className="fw-bold text-primary mb-1">🏫 Gestión de Secciones</h4>
      <p className="text-muted small mb-4">
        Crea nuevas secciones académicas y asigna la lista de estudiantes correspondiente.
      </p>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje({ texto: '', tipo: '' })}></button>
        </div>
      )}

      <div className="row g-4 mb-4">
        {/* MÓDULO 1: Crear Nueva Sección */}
        <div className="col-lg-5">
          <div className="border rounded-3 p-3 bg-light h-100">
            <h6 className="fw-bold text-secondary mb-2">➕ Crear Nueva Sección</h6>
            <form onSubmit={handleCrearSeccion}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">NOMBRE DE LA SECCIÓN</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 1° C Software"
                  value={nuevaSeccion}
                  onChange={(e) => setNuevaSeccion(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={procesando}
                className="btn btn-primary w-100 fw-bold"
              >
                {procesando ? 'Guardando...' : 'Guardar Sección'}
              </button>
            </form>
          </div>
        </div>

        {/* MÓDULO 2: Carga Masiva de Alumnos (CSV) */}
        <div className="col-lg-7">
          <div className="border border-info rounded-3 p-3 bg-light h-100">
            <h6 className="fw-bold text-primary mb-2">📂 Cargar Lista de Estudiantes (CSV)</h6>
            <form onSubmit={handleSubirCSV} className="row g-2 align-items-end">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">SECCIÓN DESTINO</label>
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

              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">ARCHIVO CSV</label>
                <input
                  id="input-file-csv"
                  type="file"
                  accept=".csv"
                  className="form-control"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  required
                />
              </div>

              <div className="col-12 text-end mt-3">
                <button
                  type="submit"
                  disabled={procesando}
                  className="btn btn-info text-white fw-bold px-4"
                >
                  {procesando ? 'Subiendo...' : '📥 Cargar Alumnos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* MÓDULO 3: Listado de Secciones Registradas */}
      <h6 className="fw-bold text-secondary mb-2">Secciones Registradas</h6>
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
                  No hay secciones registradas.
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
  );
};

export default GestionSecciones;