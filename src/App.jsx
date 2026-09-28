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

  const handleLogin = (user, userRol) => {
    setUsuario(user);
    setRol(userRol);
    localStorage.setItem('usuario', user);
    localStorage.setItem('rol', userRol);
  };

  const handleLogout = () => {
    setUsuario(null);
    setRol(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
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