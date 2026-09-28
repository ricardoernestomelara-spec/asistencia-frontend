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
  const [tabActiva, setTabActiva] = useState('secciones');

  // Función compatible con cualquier nombre de prop que espere Login.jsx
  const handleLogin = (user, userRol) => {
    // Si recibe un objeto en vez de parámetros separados (por desestructuración en Login.jsx)
    if (typeof user === 'object' && user !== null) {
      const u = user.usuario || user.user || 'Usuario';
      const r = user.rol || 'admin';
      setUsuario(u);
      setRol(r);
      localStorage.setItem('usuario', u);
      localStorage.setItem('rol', r);
      return;
    }

    setUsuario(user);
    setRol(userRol || 'admin');
    localStorage.setItem('usuario', user);
    localStorage.setItem('rol', userRol || 'admin');
  };

  const handleLogout = () => {
    setUsuario(null);
    setRol(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
  };

  if (!usuario) {
    // Pasamos tanto 'onLogin' como 'login' por compatibilidad con Login.jsx
    return <Login onLogin={handleLogin} login={handleLogin} setUsuario={handleLogin} />;
  }

  return (
    <DashboardLayout 
      usuario={usuario} 
      rol={rol} 
      tabActiva={tabActiva} 
      setTabActiva={setTabActiva} 
      onLogout={handleLogout}
    >
      {tabActiva === 'asistencia' && <TablaAsistencia />}
      {tabActiva === 'asignar' && <CargaAcademica />}
      {tabActiva === 'docentes' && <GestionDocentes />}
      {tabActiva === 'secciones' && <GestionSecciones />}
      {tabActiva === 'asignaturas' && <GestionAsignaturas />}
      {tabActiva === 'todo' && <GestionCargaAdmin />}
    </DashboardLayout>
  );
}

export default App;