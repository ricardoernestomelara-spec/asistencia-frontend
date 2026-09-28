import React, { useState } from 'react';
import TablaAsistencia from './components/TablaAsistencia';
import ReporteMensual from './components/ReporteMensual';

export default function App() {
  const [pestanaActiva, setPestanaActiva] = useState('asistencia');

  const usuarioSesion = localStorage.getItem('usuario') || 'preza';
  const docenteIdSesion = localStorage.getItem('docente_id') || localStorage.getItem('id_docente') || null;

  const cerrarSesion = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* BARRA LATERAL (SIDEBAR FIJA AL 100% DE ALTO) */}
      <aside style={{
        width: '240px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#0f172a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 16px',
        boxSizing: 'border-box',
        zIndex: 1000
      }}>
        {/* PARTE SUPERIOR: LOGO Y SISTEMA */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#2563eb',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              SA
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Sistema Académico</div>
              <span style={{ fontSize: '10px', backgroundColor: '#334155', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', color: '#94a3b8' }}>
                DOCENTE
              </span>
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR: USUARIO Y BOTÓN ABAJO DEL TODO */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {usuarioSesion.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{usuarioSesion}</span>
          </div>

          <button
            onClick={cerrarSesion}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px'
            }}
          >
            📕 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO DERECHO CON MARGEN A LA IZQUIERDA PARA NO CHOCAR CON LA BARRA */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '24px', boxSizing: 'border-box', width: 'calc(100vw - 240px)' }}>
        
        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setPestanaActiva('asistencia')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: pestanaActiva === 'asistencia' ? '3px solid #00a8e8' : '3px solid transparent',
              background: 'none',
              fontWeight: 'bold',
              fontSize: '15px',
              color: pestanaActiva === 'asistencia' ? '#00a8e8' : '#64748b',
              cursor: 'pointer'
            }}
          >
            📋 Tomar / Modificar Asistencia
          </button>

          <button
            onClick={() => setPestanaActiva('reporte')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: pestanaActiva === 'reporte' ? '3px solid #00a8e8' : '3px solid transparent',
              background: 'none',
              fontWeight: 'bold',
              fontSize: '15px',
              color: pestanaActiva === 'reporte' ? '#00a8e8' : '#64748b',
              cursor: 'pointer'
            }}
          >
            📊 Reporte Mensual
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA */}
        {pestanaActiva === 'asistencia' ? (
          <TablaAsistencia docenteId={docenteIdSesion} usuario={usuarioSesion} />
        ) : (
          <ReporteMensual docenteId={docenteIdSesion} usuario={usuarioSesion} esAdmin={false} />
        )}

      </main>
    </div>
  );
}

//este es un comentario