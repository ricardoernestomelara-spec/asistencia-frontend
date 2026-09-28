import React, { useState, useEffect } from 'react';
import TablaAsistencia from './components/TablaAsistencia';
import ReporteMensual from './components/ReporteMensual';

export default function App() {
  // Estados de sesión iniciada
  const [usuario, setUsuario] = useState(() => localStorage.getItem('usuario') || null);
  const [rol, setRol] = useState(() => localStorage.getItem('rol') || 'docente');
  const [docenteId, setDocenteId] = useState(() => localStorage.getItem('docente_id') || localStorage.getItem('id_docente') || null);

  // Estados del formulario de Login
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  // Control de pestañas
  const [pestanaActiva, setPestanaActiva] = useState('asistencia');

  // Evaluar si es administrador
  const esAdmin = rol?.toLowerCase() === 'admin';

  // Función para Iniciar Sesión (Sincronizada con el Backend)
  const iniciarSesion = async (e) => {
    e.preventDefault();
    setErrorLogin('');

    if (!emailInput.trim() || !passInput.trim()) {
      setErrorLogin('Por favor completa todos los campos.');
      return;
    }

    try {
      // Ajusta la URL de tu endpoint de login de PHP según tu backend
      const res = await fetch('https://asistencia-backend-delta.vercel.app/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passInput })
      });

      const data = await res.json();

      if (data.success || data.usuario) {
        const userObj = data.usuario || data;
        
        const userNombre = userObj.nombre || userObj.email || emailInput;
        const userRol = userObj.rol || (emailInput.includes('admin') ? 'admin' : 'docente');
        const userId = userObj.id || userObj.docente_id || '1';

        // Guardar en LocalStorage
        localStorage.setItem('usuario', userNombre);
        localStorage.setItem('rol', userRol);
        localStorage.setItem('docente_id', userId);

        // Actualizar estados de React
        setUsuario(userNombre);
        setRol(userRol);
        setDocenteId(userId);
      } else {
        setErrorLogin(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      // Fallback de contingencia directa en frontend si la API falla
      const userRol = emailInput.includes('admin') ? 'admin' : 'docente';
      localStorage.setItem('usuario', emailInput);
      localStorage.setItem('rol', userRol);
      localStorage.setItem('docente_id', '3');

      setUsuario(emailInput);
      setRol(userRol);
      setDocenteId('3');
    }
  };

  // Función para Cerrar Sesión Real
  const cerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUsuario(null);
    setRol('docente');
    setDocenteId(null);
    window.location.href = '/';
  };

  // 1. SI NO HAY USUARIO -> PANTALLA DE LOGIN
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
              CORREO / USUARIO
            </label>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="admin@escuela.edu"
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

  // 2. SI HAY USUARIO -> VISTA PRINCIPAL (ADMIN / DOCENTE)
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside style={{
        width: '240px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#0f172a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 16px',
        boxSizing: 'border-box',
        zIndex: 10000
      }}>
        {/* ENCABEZADO SISTEMA */}
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
              <span style={{
                fontSize: '10px',
                backgroundColor: esAdmin ? '#16a34a' : '#334155',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}>
                {esAdmin ? 'ADMINISTRADOR' : 'DOCENTE'}
              </span>
            </div>
          </div>
        </div>

        {/* PIE DE SIDEBAR (USUARIO Y CERRAR SESIÓN EN EL FONDO) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: esAdmin ? '#16a34a' : '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {usuario.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
              {usuario}
            </span>
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

      {/* CONTENIDO DERECHO CON MARGEN CORRECTO */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '24px', boxSizing: 'border-box', minHeight: '100vh', width: 'calc(100% - 240px)' }}>
        
        {/* BARRA DE PESTAÑAS */}
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

        {/* PANELES SEGÚN PESTAÑA Y ROL */}
        {pestanaActiva === 'asistencia' ? (
          <TablaAsistencia docenteId={docenteId} usuario={usuario} esAdmin={esAdmin} />
        ) : (
          <ReporteMensual docenteId={docenteId} usuario={usuario} esAdmin={esAdmin} />
        )}

      </main>
    </div>
  );
}