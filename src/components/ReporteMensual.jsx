// Cargar Catálogos Filtrados por Docente
useEffect(() => {
  const obtenerCatalogos = async () => {
    try {
      // 1. Enviamos el docenteId a la API si no es admin
      const url = esAdmin 
        ? `${API_BASE}/obtener_catalogos.php` 
        : `${API_BASE}/obtener_catalogos.php?docente_id=${docenteId}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        let listSecciones = data.secciones || [];
        let listAsignaturas = data.asignaturas || [];

        // 2. Si el Backend devuelve la carga asignada en una propiedad especifica (ej. docente_carga)
        if (!esAdmin && data.docente_carga) {
          listSecciones = data.docente_carga.secciones || listSecciones;
          listAsignaturas = data.docente_carga.asignaturas || listAsignaturas;
        }

        setSecciones(listSecciones);
        if (listSecciones.length > 0) {
          setSeccionId(String(listSecciones[0].id));
        }

        setAsignaturas(listAsignaturas);
        if (listAsignaturas.length > 0) {
          setAsignaturaId(String(listAsignaturas[0].id));
        }
      }
    } catch (err) {
      console.error('Error al obtener catálogos:', err);
    }
  };

  obtenerCatalogos();
}, [docenteId, esAdmin]);