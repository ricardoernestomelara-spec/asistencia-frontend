import React, { useState, useEffect } from 'react';

// URL exacta de tu backend en Render
const API_URL = 'https://asistencia-backend-qgim.onrender.com/api';

export const TablaAsistencia = () => {
  // Función auxiliar para formatear la fecha local en YYYY-MM-DD sin desfase UTC
  const obtenerFechaLocal = (fechaObj = new Date()) => {
    const year = fechaObj.getFullYear();
    const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const day = String(fechaObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Estados de filtros y control
  const [periodo, setPeriodo] = useState('1');
  const [seccion, setSeccion] = useState('1° A Software');
  const [asignatura, setAsignatura] = useState('Mod 1.1 DS');
  const [fecha, setFecha] = useState(obtenerFechaLocal());

  // Estados de datos
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alumnosModal, setAlumnosModal] = useState([]);

  // 1. Cargar alumnos y su asistencia guardada
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

      if (data && data.success) {
        const listaObtenida = data.alumnos || data.estudiantes || [];
        setAlumnos(listaObtenida);
      } else {
        setAlumnos([]);
      }
    } catch (error) {
      console.error('Error al consultar asistencia:', error);
    } finally {
      setCargando(false);
    }
  };

  // Volver a consultar datos si cambia la sección, asignatura, periodo o fecha
  useEffect(() => {
    cargarAsistencia();
  }, [seccion, asignatura, periodo, fecha]);

  // 2. Abrir Modal de Asistencia
  const handleAbrirModal = () => {
    const copiaInicial = alumnos.map((est) => ({
      ...est,
      estado: est.asistencia || est.estado || 'Asistió',
      inasistencia_por: est.inasistencia_por || '',
      observacion: est.observacion || ''
    }));
    setAlumnosModal(copiaInicial);
    setModalAbierto(true);
  };

  // Handle para actualizar campos dentro del Modal
  const handleCambioModal = (index, campo, valor) => {
    const listaActualizada = [...alumnosModal];
    listaActualizada[index][campo] = valor;
    
    if (campo === 'estado' && valor === 'Asistió') {
      listaActualizada[index].inasistencia_por = '';
      listaActualizada[index].observacion = '';
    }
    setAlumnosModal(listaActualizada);
  };

  // 3. Guardar Asistencia desde el Modal
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

      if (data && data.success) {
        setModalAbierto(false);
        await cargarAsistencia();
      } else {
        alert('Ocurrió un inconveniente al guardar: ' + (data.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      alert('Error de conexión al intentar guardar la asistencia.');
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Barra de Filtros / Controles */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleAbrirModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              + Tomar Asistencia
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              PERÍODO
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="1">1° Período</option>
              <option value="2">2° Período</option>
              <option value="3">3° Período</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              SECCIÓN
            </label>
            <select
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="1° A Software">1° A Software</option>
              <option value="1° B Software">1° B Software</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              ASIGNATURA
            </label>
            <select
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="Mod 1.1 DS">Mod 1.1 DS</option>
              <option value="Mod 1.2 BD">Mod 1.2 BD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando datos de asistencia...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">NIE</th>
                <th className="p-3">APELLIDOS</th>
                <th className="p-3">NOMBRES</th>
                <th className="p-3 text-center">{fecha.split('-').reverse().slice(0, 2).join('/')}</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-400">
                    No se encontraron registros para esta selección.
                  </td>
                </tr>
              ) : (
                alumnos.map((est, idx) => {
                  const estadoActual = est.asistencia || est.estado || 'Asistió';
                  return (
                    <tr key={est.id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-center text-gray-400">{idx + 1}</td>
                      <td className="p-3 text-gray-600">{est.nie}</td>
                      <td className="p-3 font-semibold text-gray-800">{est.apellidos}</td>
                      <td className="p-3 text-gray-700">{est.nombres}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            estadoActual === 'Faltó'
                              ? 'bg-red-100 text-red-700'
                              : estadoActual === 'Permiso'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
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

      {/* Modal para Tomar Asistencia */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Asistencia diaria</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Fecha:</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
              />
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-2.5 text-center w-10">#</th>
                    <th className="p-2.5">NIE</th>
                    <th className="p-2.5">APELLIDOS</th>
                    <th className="p-2.5">NOMBRES</th>
                    <th className="p-2.5">ESTADO</th>
                    <th className="p-2.5">INASISTENCIA POR</th>
                    <th className="p-2.5">OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosModal.map((est, idx) => (
                    <tr key={est.id || idx} className="border-b border-gray-200">
                      <td className="p-2 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-2 text-xs text-gray-600">{est.nie}</td>
                      <td className="p-2 font-medium text-gray-800">{est.apellidos}</td>
                      <td className="p-2 text-gray-700">{est.nombres}</td>
                      <td className="p-2">
                        <select
                          value={est.estado}
                          onChange={(e) => handleCambioModal(idx, 'estado', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                        >
                          <option value="Asistió">Asistió</option>
                          <option value="Faltó">Faltó</option>
                          <option value="Permiso">Permiso</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          disabled={est.estado === 'Asistió'}
                          value={est.inasistencia_por}
                          onChange={(e) =>
                            handleCambioModal(idx, 'inasistencia_por', e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm outline-none disabled:bg-gray-100"
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="Competencia Deportiva">Competencia Deportiva</option>
                          <option value="Enfermedad">Enfermedad</option>
                          <option value="Motivo Personal">Motivo Personal</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          disabled={est.estado === 'Asistió'}
                          placeholder="Escribe una observación"
                          value={est.observacion}
                          onChange={(e) =>
                            handleCambioModal(idx, 'observacion', e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full outline-none disabled:bg-gray-100"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarAsistencia}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
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