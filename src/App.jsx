import React, { useState } from 'react';
import TablaAsistencia from './components/TablaAsistencia';
import ReporteMensual from './components/ReporteMensual';

export const AsistenciaVistaPrincipal = ({ docenteId, usuario }) => {
  // Estado para controlar qué pestaña está activa ('asistencia' o 'reporte')
  const [pestanaActiva, setPestanaActiva] = useState('asistencia');

  return (
    <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* BOTONES DE NAVEGACIÓN (PESTAÑAS) */}
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
            cursor: 'pointer',
            transition: 'all 0.2s ease'
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
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📊 Reporte Mensual
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL DE LA VISTA */}
      {pestanaActiva === 'asistencia' ? (
        <TablaAsistencia docenteId={docenteId} usuario={usuario} />
      ) : (
        <ReporteMensual docenteId={docenteId} esAdmin={false} />
      )}

    </div>
  );
};

export default AsistenciaVistaPrincipal;