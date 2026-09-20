import React, { useState, useEffect } from 'react';

const API_URL = 'https://asistencia-backend-qgim.onrender.com/api';

export const TablaAsistencia = () => {
  const obtenerFechaLocal = (fechaObj = new Date()) => {
    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [periodo, setPeriodo] = useState('1');
  const [seccion, setSeccion] = useState('1° A Software');
  const [asignatura, setAsignatura] = useState('Mod 1.1 DS');
  const [fecha, setFecha] = useState(obtenerFechaLocal());

  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alumnosModal, setAlumnosModal] = useState([]);

  const cargarAsistencia = async () => {
    if (!seccion) return;
    setCargando(true);
    try {
      const queryParams = new URLSearchParams({
        seccion: seccion,
        asignatura: asignatura,
        periodo: periodo,
        fecha: fecha
      });

      const res = await fetch(`${API_URL}/asistencia.php?${queryParams.toString()}`);
      const data = await res.json();

      let lista = [];
      if (Array.isArray(data)) {
        lista = data;
      } else if (data && (data.alumnos || data.estudiantes || data.data)) {
        lista = data.alumnos || data.estudiantes || data.data || [];
      }

      setAlumnos(lista);
    } catch (error) {
      console.error('Error al consultar asistencia:', error);
      setAlumnos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAsistencia();
  }, [seccion, asignatura, periodo, fecha]);

  const handleAbrirModal = () => {
    const copiaInicial = alumnos.map((est) => ({
      estudiante_id: est.estudiante_id || est.id,
      nie: est.nie,
      apellidos: est.apellidos,
      nombres: est.nombres,
      asistencia: est.asistencia || est.estado || 'Asistió',
      inasistencia_por: est.inasistencia_por || '',
      observacion: est.observacion || ''
    }));
    setAlumnosModal(copiaInicial);
    setModalAbierto(true);
  };

  const handleCambioModal = (index, campo, valor) => {
    const listaActualizada = [...alumnosModal];
    listaActualizada[index][campo] = valor;

    if (campo === 'asistencia' && valor === 'Asistió') {
      listaActualizada[index].inasistencia_por = '';
      listaActualizada[index].observacion = '';
    }
    setAlumnosModal(listaActualizada);
  };

  const handleGuardarAsistencia = async () => {
    setGuardando(true);
    try {
      const payload = {
        fecha: fecha,
        seccion: seccion,
        asignatura: asignatura,
        periodo: periodo,
        asistencias: alumnosModal.map((est) => ({
          estudiante_id: est.estudiante_id,
          asistencia: est.asistencia,
          inasistencia_por: est.inasistencia_por,
          observacion: est.observacion
        }))
      };

      const res = await fetch(`${API_URL}/guardar_asistencia.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data && (data.success || res.ok)) {
        setModalAbierto(false);
        // Volvemos a pedir los datos a la base de datos inmediatamente
        await cargarAsistencia();
      } else {
        alert('Respuesta del servidor: ' + (data.message || 'Error al guardar.'));
      }
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      alert('Error de conexión al intentar guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="contenedor-principal">
      {/* Tarjeta de Filtros Superior */}
      <div className="tarjeta-filtro">
        <div className="fila-superior">
          <button
            onClick={handleAbrirModal}
            disabled={alumnos.length === 0}
            className="btn-tomar-asistencia"
          >
            + Tomar Asistencia
          </button>

          <div className="grupo-fecha">
            <label className="label-filtro">Fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input-fecha"
            />
          </div>
        </div>

        <div className="grid-filtros">
          <div className="campo-filtro">
            <label className="label-filtro">PERÍODO</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="select-filtro"
            >
              <option value="1">1° Período</option>
              <option value="2">2° Período</option>
              <option value="3">3° Período</option>
            </select>
          </div>

          <div className="campo-filtro">
            <label className="label-filtro">SECCIÓN</label>
            <select
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
              className="select-filtro"
            >
              <option value="1° A Software">1° A Software</option>
              <option value="1° B Software">1° B Software</option>
            </select>
          </div>

          <div className="campo-filtro">
            <label className="label-filtro">ASIGNATURA</label>
            <select
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              className="select-filtro"
            >
              <option value="Mod 1.1 DS">Mod 1.1 DS</option>
              <option value="Mod 1.2 BD">Mod 1.2 BD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="contenedor-tabla">
        {cargando ? (
          <div className="mensaje-cargando">Cargando registros...</div>
        ) : (
          <table className="tabla-asistencia">
            <thead>
              <tr>
                <th style={{ textAlign: 'center', width: '40px' }}>#</th>
                <th>NIE</th>
                <th>APELLIDOS</th>
                <th>NOMBRES</th>
                <th style={{ textAlign: 'center' }}>
                  {fecha.split('-').reverse().slice(0, 2).join('/')}
                </th>
              </tr>
            </thead>
            <tbody>
              {alumnos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No se encontraron registros para esta selección.
                  </td>
                </tr>
              ) : (
                alumnos.map((est, idx) => {
                  const estadoActual = est.asistencia || est.estado || 'Asistió';
                  let claseBadge = 'badge-asistio';
                  if (estadoActual === 'Faltó') claseBadge = 'badge-falto';
                  if (estadoActual === 'Permiso') claseBadge = 'badge-permiso';

                  return (
                    <tr key={est.estudiante_id || est.id || idx}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>{est.nie}</td>
                      <td><strong>{est.apellidos}</strong></td>
                      <td>{est.nombres}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge-asistencia ${claseBadge}`}>
                          {estadoActual}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Flotante Superpuesto */}
      {modalAbierto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            {/* Header Modal */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Asistencia diaria</h3>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
              >
                &times;
              </button>
            </div>

            {/* Selector Fecha Modal */}
            <div style={{ padding: '12px 20px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Fecha:</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px' }}
              />
            </div>

            {/* Contenido Tabla Modal */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <table className="tabla-asistencia">
                <thead>
                  <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                    <th style={{ textAlign: 'center', width: '35px' }}>#</th>
                    <th>NIE</th>
                    <th>APELLIDOS</th>
                    <th>NOMBRES</th>
                    <th>ESTADO</th>
                    <th>INASISTENCIA POR</th>
                    <th>OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosModal.map((est, idx) => (
                    <tr key={est.estudiante_id || idx}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ fontSize: '12px' }}>{est.nie}</td>
                      <td><strong>{est.apellidos}</strong></td>
                      <td>{est.nombres}</td>
                      <td>
                        <select
                          value={est.asistencia}
                          onChange={(e) => handleCambioModal(idx, 'asistencia', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="Asistió">Asistió</option>
                          <option value="Faltó">Faltó</option>
                          <option value="Permiso">Permiso</option>
                        </select>
                      </td>
                      <td>
                        <select
                          disabled={est.asistencia === 'Asistió'}
                          value={est.inasistencia_por}
                          onChange={(e) => handleCambioModal(idx, 'inasistencia_por', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="Competencia Deportiva">Competencia Deportiva</option>
                          <option value="Enfermedad">Enfermedad</option>
                          <option value="Motivo Personal">Motivo Personal</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          disabled={est.asistencia === 'Asistió'}
                          placeholder="Escribe una observación"
                          value={est.observacion}
                          onChange={(e) => handleCambioModal(idx, 'observacion', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Modal */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f9f9f9' }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarAsistencia}
                disabled={guardando}
                style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaAsistencia;