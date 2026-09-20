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

      if (data && (data.success || data.status === 'ok' || res.ok)) {
        setModalAbierto(false);
        await cargarAsistencia();
      } else {
        alert('Respuesta del servidor: ' + (data.message || 'Error al registrar la asistencia.'));
      }
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      alert('Error de conexión al intentar guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Panel Superior de Filtros */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <button
            onClick={handleAbrirModal}
            disabled={alumnos.length === 0}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
              alumnos.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow cursor-pointer'
            }`}
          >
            + Tomar Asistencia
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Fecha:</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
              PERÍODO
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="1">1° Período</option>
              <option value="2">2° Período</option>
              <option value="3">3° Período</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
              SECCIÓN
            </label>
            <select
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="1° A Software">1° A Software</option>
              <option value="1° B Software">1° B Software</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5">
              ASIGNATURA
            </label>
            <select
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Mod 1.1 DS">Mod 1.1 DS</option>
              <option value="Mod 1.2 BD">Mod 1.2 BD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {cargando ? (
          <div className="p-10 text-center text-slate-500 font-medium">Cargando registros...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5 text-center w-12">#</th>
                <th className="p-3.5">NIE</th>
                <th className="p-3.5">APELLIDOS</th>
                <th className="p-3.5">NOMBRES</th>
                <th className="p-3.5 text-center">{fecha.split('-').reverse().slice(0, 2).join('/')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alumnos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No se encontraron registros para esta selección.
                  </td>
                </tr>
              ) : (
                alumnos.map((est, idx) => {
                  const estadoActual = est.asistencia || est.estado || 'Asistió';
                  return (
                    <tr key={est.estudiante_id || est.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 text-slate-600">{est.nie}</td>
                      <td className="p-3.5 font-bold text-slate-800">{est.apellidos}</td>
                      <td className="p-3.5 text-slate-700">{est.nombres}</td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            estadoActual === 'Faltó'
                              ? 'bg-red-100 text-red-700'
                              : estadoActual === 'Permiso'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
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

      {/* Modal Flotante Superpuesto con Tailwind */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-slate-800">Asistencia diaria</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none px-2"
              >
                &times;
              </button>
            </div>

            {/* Subheader Fecha */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Fecha:</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-1 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Contenido Tabla Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white font-semibold">
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3">NIE</th>
                    <th className="p-3">APELLIDOS</th>
                    <th className="p-3">NOMBRES</th>
                    <th className="p-3">ESTADO</th>
                    <th className="p-3">INASISTENCIA POR</th>
                    <th className="p-3">OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {alumnosModal.map((est, idx) => (
                    <tr key={est.estudiante_id || idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 text-xs text-slate-600">{est.nie}</td>
                      <td className="p-2.5 font-bold text-slate-800">{est.apellidos}</td>
                      <td className="p-2.5 text-slate-700">{est.nombres}</td>
                      <td className="p-2.5">
                        <select
                          value={est.asistencia}
                          onChange={(e) => handleCambioModal(idx, 'asistencia', e.target.value)}
                          className="border border-slate-300 rounded-md px-2.5 py-1 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="Asistió">Asistió</option>
                          <option value="Faltó">Faltó</option>
                          <option value="Permiso">Permiso</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <select
                          disabled={est.asistencia === 'Asistió'}
                          value={est.inasistencia_por}
                          onChange={(e) =>
                            handleCambioModal(idx, 'inasistencia_por', e.target.value)
                          }
                          className="border border-slate-300 rounded-md px-2.5 py-1 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="Competencia Deportiva">Competencia Deportiva</option>
                          <option value="Enfermedad">Enfermedad</option>
                          <option value="Motivo Personal">Motivo Personal</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          disabled={est.asistencia === 'Asistió'}
                          placeholder="Escribe una observación"
                          value={est.observacion}
                          onChange={(e) =>
                            handleCambioModal(idx, 'observacion', e.target.value)
                          }
                          className="border border-slate-300 rounded-md px-2.5 py-1 text-sm w-full bg-white outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-100 font-medium text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarAsistencia}
                disabled={guardando}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:bg-blue-300"
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