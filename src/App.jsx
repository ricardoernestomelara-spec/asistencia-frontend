import React, { useState } from 'react';
import TablaAsistencia from './components/TablaAsistencia';
import ReporteMensual from './components/ReporteMensual';

export default function App() {
  // Estado de usuario persistido
  const [usuario, setUsuario] = useState(() => localStorage.getItem('usuario') || null);
  const [docenteId, setDocenteId] = useState(() => localStorage.getItem('docente_id') || localStorage.getItem('id_docente') || null);
  
  // Formulario de login
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  const [pestanaActiva, setPestanaActiva] = useState('asistencia');

  const iniciarSesion = (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setErrorLogin('Por favor ingresa un usuario válido');
      return;
    }

    // Guardar credenciales
    localStorage.setItem('usuario', userInput);
    // Si tienes backend asignas el id real, aquí tomamos un valor por defecto o existente
    const idGuardado = docenteId || '4'; 
    localStorage.setItem('docente_id', idGuardado);

    setUsuario(userInput);
    setDocenteId(idGuardado);
    setErrorLogin('');
  };

  const cerrarSesion = () => {
    // 1. Limpiar LocalStorage completo
    localStorage.clear();
    sessionStorage.clear();

    // 2. Desmontar usuario para forzar la pantalla de Login
    setUsuario(null);
    setDocenteId(null);
  };

  // SI NO HAY USUARIO EN SESIÓN -> MOSTRAR LOGIN
  if (!usuario) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <form onSubmit={iniciarSesion} style={{
          backgroundColor: '#ffffff',
          padding: '32px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              margin: '0 auto 12px auto'
            }}>
              SA
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Sistema Académico</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Ingresa tus credenciales para continuar</p>
          </div>

          {errorLogin && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
              {errorLogin}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
              USUARIO
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ej. preza"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    );
  }

  // SI HAY USUARIO AUTENTICADO -> MOSTRAR PANEL PRINCIPAL
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* BARRA LATERAL FIJA PANTALLA COMPLETA */}
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
        zIndex: 10000
      }}>
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
              {usuario.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{usuario}</span>
          </div>

          <button
            onClick={cerrarSesion}
            type="button"
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

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '24px', boxSizing: 'border-box', minHeight: '100vh', width: 'calc(100% - 240px)' }}>
        
        {/* NAVEGACIÓN */}
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

        {/* VISTAS */}
        {pestanaActiva === 'asistencia' ? (
          <TablaAsistencia docenteId={docenteId} usuario={usuario} />
        ) : (
          <ReporteMensual docenteId={docenteId} usuario={usuario} esAdmin={false} />
        )}

      </main>
    </div>
  );
}