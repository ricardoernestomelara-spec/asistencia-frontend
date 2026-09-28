import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost/asistencia_docente/api';

export default function GestionSecciones() {
  const [secciones, setSecciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Formulario Sección
  const [id, setId] = useState(0);
  const [idAsignatura, setIdAsignatura] = useState('');
  const [nombre, setNombre] = useState('');
  const [aula, setAula] = useState('');
  const [horario, setHorario] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Carga Masiva de Alumnos (CSV)
  const [modalCsvAbierto, setModalCsvAbierto] = useState(false);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [archivoCsv, setArchivoCsv] = useState(null);
  const [procesandoCsv, setProcesandoCsv] = useState(false);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    try {
      await Promise.all([cargarSecciones(), cargarAsignaturas()]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarSecciones = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/secciones.php`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSecciones(data);
      } else if (data.success && Array.isArray(data.data)) {
        setSecciones(data.data);
      }
    } catch (error) {
      console.error('Error al cargar secciones:', error);
    }
  };

  const cargarAsignaturas = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/asignaturas.php`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAsignaturas(data);
      } else if (data.success && Array.isArray(data.data)) {
        setAsignaturas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    }
  };

  const limpiarFormulario = () => {
    setId(0);
    setIdAsignatura('');
    setNombre('');
    setAula('');
    setHorario('');
  };

  const handleNuevo = () => {
    limpiarFormulario();
    setModalAbierto(true);
  };

  const handleEditar = (sec) => {
    setId(sec.id);
    setIdAsignatura(sec.id_asignatura);
    setNombre(sec.nombre);
    setAula(sec.aula || '');
    setHorario(sec.horario || '');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!idAsignatura || !nombre) {
      alert('Por favor selecciona una asignatura e ingresa el nombre de la sección.');
      return;
    }

    const payload = {
      id: id > 0 ? id : undefined,
      id_asignatura: idAsignatura,
      nombre,
      aula,
      horario
    };

    const metodo = id > 0 ? 'PUT' : 'POST';

    try {
      const res = await fetch(`${API_BASE_URL}/secciones.php`, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success || res.ok) {
        alert(id > 0 ? 'Sección actualizada correctamente' : 'Sección creada correctamente');
        setModalAbierto(false);
        limpiarFormulario();
        cargarSecciones();
      } else {
        alert(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al guardar sección:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleEliminar = async (idEliminar) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta sección?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/secciones.php?id=${idEliminar}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success || res.ok) {
        alert('Sección eliminada con éxito.');
        cargarSecciones();
      } else {
        alert(data.message || 'No se pudo eliminar la sección.');
      }
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  // --- DESCARGAR PLANTILLA ESPECÍFICA PARA UNA SECCIÓN YA CREADA ---
  const handleDescargarPlantillaSeccion = (sec) => {
    // Nombre del archivo toma el nombre exacto de la sección (ej: "SEC-01.csv")
    const nombreArchivo = `${sec.nombre.trim().replace(/[/\\?%*:|"<>]/g, '_')}.csv`;

    // Solo columnas del alumno, sin pedir id_seccion al docente
    const contenido = `sep=;\nnie;nombre;apellido;email\n12345678;Juan;Perez;juan.perez@email.com`;

    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- CARGA MASIVA DE ALUMNOS A UNA SECCIÓN ---
  const handleAbrirCsvModal = (sec) => {
    setSeccionSeleccionada(sec);
    setArchivoCsv(null);
    setModalCsvAbierto(true);
  };

  const handleSubirCsv = async (e) => {
    e.preventDefault();
    if (!archivoCsv) {
      alert('Por favor selecciona un archivo CSV.');
      return;
    }

    if (!seccionSeleccionada) {
      alert('Debes seleccionar una sección para cargar los alumnos.');
      return;
    }

    const formData = new FormData();
    formData.append('csv', archivoCsv);
    formData.append('id_seccion', seccionSeleccionada.id);

    setProcesandoCsv(true);

    try {
      const res = await fetch(`${API_BASE_URL}/alumnos_csv.php`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message || 'Alumnos cargados con éxito en la sección.');
        setModalCsvAbierto(false);
        setArchivoCsv(null);
        cargarSecciones();
      } else {
        alert(data.message || 'Error al procesar el archivo CSV.');
      }
    } catch (error) {
      console.error('Error al subir CSV:', error);
      alert('Error al conectar con el servidor para la carga masiva.');
    } finally {
      setProcesandoCsv(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h2>Gestión de Secciones</h2>
        <button className="btn btn-primary" onClick={handleNuevo}>
          <i className="bi bi-plus-circle me-1"></i> Nueva Sección
        </button>
      </div>

      {cargando ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Asignatura</th>
                <th>Sección</th>
                <th>Aula</th>
                <th>Horario</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {secciones.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay secciones registradas.
                  </td>
                </tr>
              ) : (
                secciones.map((sec) => (
                  <tr key={sec.id}>
                    <td>{sec.id}</td>
                    <td>{sec.asignatura_nombre || sec.nombre_asignatura || `ID: ${sec.id_asignatura}`}</td>
                    <td><strong>{sec.nombre}</strong></td>
                    <td>{sec.aula || '-'}</td>
                    <td>{sec.horario || '-'}</td>
                    <td className="text-end">
                      {/* Botón 1: Descargar Plantilla con el nombre de la sección */}
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        title={`Descargar plantilla ${sec.nombre}.csv`}
                        onClick={() => handleDescargarPlantillaSeccion(sec)}
                      >
                        <i className="bi bi-download me-1"></i> Plantilla
                      </button>

                      {/* Botón 2: Cargar alumnos directamente a esta sección */}
                      <button
                        className="btn btn-sm btn-outline-success me-2"
                        title={`Cargar alumnos en ${sec.nombre}`}
                        onClick={() => handleAbrirCsvModal(sec)}
                      >
                        <i className="bi bi-upload me-1"></i> Cargar Alumnos
                      </button>

                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditar(sec)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(sec.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR / EDITAR SECCIÓN */}
      {modalAbierto && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{id > 0 ? 'Editar Sección' : 'Nueva Sección'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalAbierto(false)}></button>
              </div>
              <form onSubmit={handleGuardar}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Asignatura *</label>
                    <select
                      className="form-select"
                      value={idAsignatura}
                      onChange={(e) => setIdAsignatura(e.target.value)}
                      required
                    >
                      <option value="">-- Seleccione una asignatura --</option>
                      {asignaturas.map((asig) => (
                        <option key={asig.id} value={asig.id}>
                          {asig.codigo ? `[${asig.codigo}] ` : ''}{asig.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nombre de la Sección (ej. SEC-01) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Sección A / Grupo 01"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Aula</label>
                    <input
                      type="text"
                      className="form-control"
                      value={aula}
                      onChange={(e) => setAula(e.target.value)}
                      placeholder="Ej: Edificio B - Aula 204"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Horario</label>
                    <input
                      type="text"
                      className="form-control"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      placeholder="Ej: Lun y Mie 08:00 - 10:00"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARGA MASIVA CSV PARA LA SECCIÓN SELECCIONADA */}
      {modalCsvAbierto && seccionSeleccionada && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Cargar Alumnos en Sección: <strong>{seccionSeleccionada.nombre}</strong>
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalCsvAbierto(false)}></button>
              </div>
              <form onSubmit={handleSubirCsv}>
                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Selecciona el archivo CSV (ej: <code>{seccionSeleccionada.nombre}.csv</code>) preparado para asociar los estudiantes directamente a esta sección.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Archivo CSV</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".csv"
                      onChange={(e) => setArchivoCsv(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalCsvAbierto(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success" disabled={procesandoCsv}>
                    {procesandoCsv ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Procesando...
                      </>
                    ) : (
                      'Subir y Cargar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}