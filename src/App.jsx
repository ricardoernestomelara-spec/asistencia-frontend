import React, { useState } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import TablaAsistencia from './components/TablaAsistencia';
import CargaAcademica from './components/CargaAcademica';
import GestionDocentes from './components/GestionDocentes';
import GestionSecciones from './components/GestionSecciones';
import GestionAsignaturas from './components/GestionAsignaturas';
import GestionCargaAdmin from './components/GestionCargaAdmin';

function App() {
  const [usuario, setUsuario] = useState(localStorage.getItem('usuario') || null);
  const [rol, setRol] = useState(localStorage.getItem('rol') || null);

  // Determinar la pestaña inicial según el rol almacenado
  const getInitialTab = (rolUsuario) => {
    return rolUsuario === 'docente' ? 'asistencia' : 'secciones';
  };

  const [tabActiva, setTabActiva] = useState(() => {
    const savedRol = localStorage.getItem('rol');
    return getInitialTab(savedRol);
  });

  // Función compatible con cualquier nombre de prop que espere Login.jsx
  const handleLogin = (user, userRol) => {
    let u = user;
    let r = userRol || 'admin';

    // Si recibe un objeto en vez de parámetros separados
    if (typeof user === 'object' && user !== null) {
      u = user.usuario || user.user || 'Usuario';
      r = user.rol || 'admin';
    }

    setUsuario(u);
    setRol(r);
    setTabActiva(getInitialTab(r));

    localStorage.setItem('usuario', u);
    localStorage.setItem('rol', r);
  };

  const handleLogout = () => {
    setUsuario(null);
    setRol(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} login={handleLogin} setUsuario={handleLogin} />;
  }

  // Comprobar si el usuario actual es docente
  const esDocente = rol === 'docente';

  return (
    <DashboardLayout 
      usuario={usuario} 
      rol={rol} 
      tabActiva={tabActiva} 
      setTabActiva={setTabActiva} 
      onLogout={handleLogout}
    >
      {/* Vista de Asistencia accesible para Docentes y Administradores */}
      {(tabActiva === 'asistencia' || esDocente) && <TablaAsistencia usuario={usuario} rol={rol} />}

      {/* Módulos exclusivos para Administrador */}
      {!esDocente && (
        <>
          {tabActiva === 'asignar' && <CargaAcademica />}
          {tabActiva === 'docentes' && <GestionDocentes />}
          {tabActiva === 'secciones' && <GestionSecciones />}
          {tabActiva === 'asignaturas' && <GestionAsignaturas />}
          {tabActiva === 'todo' && <GestionCargaAdmin />}
        </>
      )}
    </DashboardLayout>
  );
}

export default App;