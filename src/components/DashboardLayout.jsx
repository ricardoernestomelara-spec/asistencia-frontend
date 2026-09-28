import React from 'react';

const DashboardLayout = ({ usuario, rol, tabActiva, setTabActiva, onLogout, children }) => {
  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar Lateral Izquierdo */}
      <aside 
        className="bg-dark text-white p-3 d-flex flex-column justify-content-between shadow"
        style={{ width: '260px', minWidth: '260px' }}
      >
        <div>
          {/* Encabezado / Título */}
          <div className="border-bottom border-secondary pb-3 mb-4 text-center">
            <h5 className="fw-bold text-primary mb-1">Sistema Académico</h5>
            <span className="badge bg-secondary text-uppercase">{rol || 'Usuario'}</span>
          </div>

          {/* Menú de Navegación Vertical */}
          <nav className="nav nav-pills flex-column gap-2">
            {rol === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => setTabActiva('asistencia')}
                  className={`nav-link text-start d-flex align-items-center gap-2 ${tabActiva === 'asistencia' ? 'active fw-bold' : 'text-white-50'}`}
                >
                  📌 <span>Vista Asistencia</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabActiva('asignar')}
                  className={`nav-link text-start d-flex align-items-center gap-2 ${tabActiva === 'asignar' ? 'active fw-bold' : 'text-white-50'}`}
                >
                  📝 <span>Asignar Carga</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabActiva('docentes')}
                  className={`nav-link text-start d-flex align-items-center gap-2 ${tabActiva === 'docentes' ? 'active fw-bold' : 'text-white-50'}`}
                >
                  👨‍🏫 <span>Gestionar Docentes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabActiva('secciones')}
                  className={`nav-link text-start d-flex align-items-center gap-2 ${tabActiva === 'secciones' ? 'active fw-bold' : 'text-white-50'}`}
                >
                  🏫 <span>Gestionar Secciones</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabActiva('asignaturas')}
                  className={`nav-link text-start d-flex align-items-center gap-2 ${tabActiva === 'asignaturas' ? 'active fw-bold' : 'text-white-50'}`}
                >
                  📚 <span>Gestionar Asignaturas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTabActiva('todo')}
                  className={`nav-link text-start d-flex align-items-center gap-2 ${tabActiva === 'todo' ? 'active fw-bold' : 'text-white-50'}`}
                >
                  🌐 <span>Vista General</span>
                </button>
              </>
            )}

            {rol === 'docente' && (
              <button
                type="button"
                onClick={() => setTabActiva('asistencia')}
                className={`nav-link text-start d-flex align-items-center gap-2 ${tabActiva === 'asistencia' ? 'active fw-bold' : 'text-white-50'}`}
              >
                📋 <span>Mis Clases / Asistencia</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sección inferior: Usuario y Cerrar Sesión */}
        <div className="border-top border-secondary pt-3 mt-4">
          <div className="mb-2 text-center text-truncate small fw-semibold text-white-50">
            👤 {usuario}
          </div>
          <button 
            type="button"
            onClick={onLogout} 
            className="btn btn-outline-danger btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            🚪 <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal a la Derecha */}
      <main className="flex-grow-1 p-4 overflow-auto" style={{ maxHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;