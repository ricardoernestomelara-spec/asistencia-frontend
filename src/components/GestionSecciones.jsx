// Agrega esta función dentro de tu componente GestionSecciones.jsx
const vaciarAlumnos = (seccionId, nombreSeccion) => {
  if (!window.confirm(`¿Seguro que deseas vaciar TODOS los alumnos cargados en '${nombreSeccion}'?`)) {
    return;
  }

  fetch(`${API_BASE}/gestion_secciones.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'vaciar_alumnos', seccion_id: seccionId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        cargarSecciones(); // Recargar vista
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch((err) => console.error("Error al vaciar alumnos:", err));
};

// En tu renderizado (dentro del map de secciones en la tabla):
// <button onClick={() => vaciarAlumnos(sec.id, sec.nombre)} className="btn-vaciar">
//   Vaciar Alumnos
// </button>