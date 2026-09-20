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
      id: est.id || est.estudiante_id,
      nie: est.nie,
      apellidos: est.apellidos,
      nombres: est.nombres,
      estado: est.asistencia || est.estado || 'Asistió',
      inasistencia_por: est.inasistencia_por || '',
      observacion: est.observacion || ''
    }));
    setAlumnosModal(copiaInicial);
    setModalAbierto(true);
  };

  const handleCambioModal = (index, campo, valor) => {
    const listaActualizada = [...alumnosModal];
    listaActualizada[index][campo] = valor;

    if (campo === 'estado' && valor === 'Asistió') {
      listaActualizada[index].inasistencia_por = '';
      listaActualizada[index].observacion = '';
    }
    setAlumnosModal(listaActualizada);
  };

  const handleGuardarAsistencia = async () => {
    try {
      const payload = {
        fecha: fecha,
        seccion: seccion,
        asignatura: asignatura,
        periodo: periodo,
        detalles: alumnosModal
      };

      const res = await fetch(`${API_URL}/guardar_asistencia.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data && (data.success || data.status === 'ok')) {
        setModalAbierto(false);
        await cargarAsistencia();
      } else {
        alert('Respuesta del servidor: ' + (data.message || 'Asistencia registrada correctamente.'));
        setModalAbierto(false);
        await cargarAsistencia();
      }
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      alert('Error de conexión al intentar guardar.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Contenedor de Filtros */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={handleAbrirModal}
            disabled={alumnos.length === 0}
            style={{
              backgroundColor: alumnos.length === 0 ? '#cccccc' : '#00a8e8',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: alumnos.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            + Tomar Asistencia
          </button>

          <div style={{ display: 'flex', itemsAlign: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>
              PERÍODO
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="1">1° Período</option>
              <option value="2">2° Período</option>
              <option value="3">3° Período</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>
              SECCIÓN
            </label>
            <select
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="1° A Software">1° A Software</option>
              <option value="1° B Software">1° B Software</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>
              ASIGNATURA
            </label>
            <select
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Mod 1.1 DS">Mod 1.1 DS</option>
              <option value="Mod 1.2 BD">Mod 1.2 BD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Cargando datos de asistencia...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}>#</th>
                <th style={{ padding: '12px' }}>NIE</th>
                <th style={{ padding: '12px' }}>APELLIDOS</th>
                <th style={{ padding: '12px' }}>NOMBRES</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{fecha.split('-').reverse().slice(0, 2).join('/')}</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                    No se encontraron registros para esta selección.
                  </td>
                </tr>
              ) : (
                alumnos.map((est, idx) => {
                  const estadoActual = est.asistencia || est.estado || 'Asistió';
                  return (
                    <tr key={est.id || est.estudiante_id || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#9ca3af' }}>{idx + 1}</td>
                      <td style={{ padding: '12px', color: '#4b5563' }}>{est.nie}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#1f2937' }}>{est.apellidos}</td>
                      <td style={{ padding: '12px', color: '#374151' }}>{est.nombres}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor:
                              estadoActual === 'Faltó' ? '#fee2e2' : estadoActual === 'Permiso' ? '#fef3c7' : '#d1fae5',
                            color:
                              estadoActual === 'Faltó' ? '#b91c1c' : estadoActual === 'Permiso' ? '#b45309' : '#047857'
                          }}
                        >
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Asistencia diaria</h2>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Fecha:</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#2563eb', color: '#ffffff' }}>
                    <th style={{ padding: '10px', textAlign: 'center', width: '40px' }}>#</th>
                    <th style={{ padding: '10px' }}>NIE</th>
                    <th style={{ padding: '10px' }}>APELLIDOS</th>
                    <th style={{ padding: '10px' }}>NOMBRES</th>
                    <th style={{ padding: '10px' }}>ESTADO</th>
                    <th style={{ padding: '10px' }}>INASISTENCIA POR</th>
                    <th style={{ padding: '10px' }}>OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosModal.map((est, idx) => (
                    <tr key={est.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
                      <td style={{ padding: '8px', fontSize: '12px', color: '#4b5563' }}>{est.nie}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#1f2937' }}>{est.apellidos}</td>
                      <td style={{ padding: '8px', color: '#374151' }}>{est.nombres}</td>
                      <td style={{ padding: '8px' }}>
                        <select
                          value={est.estado}
                          onChange={(e) => handleCambioModal(idx, 'estado', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option value="Asistió">Asistió</option>
                          <option value="Faltó">Faltó</option>
                          <option value="Permiso">Permiso</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <select
                          disabled={est.estado === 'Asistió'}
                          value={est.inasistencia_por}
                          onChange={(e) => handleCambioModal(idx, 'inasistencia_por', e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            backgroundColor: est.estado === 'Asistió' ? '#f3f4f6' : '#fff'
                          }}
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="Competencia Deportiva">Competencia Deportiva</option>
                          <option value="Enfermedad">Enfermedad</option>
                          <option value="Motivo Personal">Motivo Personal</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="text"
                          disabled={est.estado === 'Asistió'}
                          placeholder="Escribe una observación"
                          value={est.observacion}
                          onChange={(e) => handleCambioModal(idx, 'observacion', e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%',
                            backgroundColor: est.estado === 'Asistió' ? '#f3f4f6' : '#fff'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f9fafb' }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', color: '#374151', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarAsistencia}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaAsistencia;