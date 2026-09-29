// Dentro de ReporteMensual.jsx
useEffect(() => {
  const cargarReporte = async () => {
    if (!seccionId) return;

    try {
      setCargando(true);
      
      // Asegúrate de enviar los parámetros con los nombres correctos
      const url = `${API_BASE}/reporte_mensual.php?seccion_id=${encodeURIComponent(seccionId)}&asignatura_id=${encodeURIComponent(asignaturaId)}&anio=${anio}&mes=${mes}`;

      const response = await fetch(url);
      const data = await response.json();

      // Mantiene compatibilidad si devuelve data.reporte o data.data
      const lista = data.reporte || data.data || [];

      if (data.success && Array.isArray(lista)) {
        setReporte(lista);
      } else {
        setReporte([]);
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error);
      setReporte([]);
    } finally {
      setCargando(false);
    }
  };

  cargarReporte();
}, [seccionId, asignaturaId, anio, mes]);

export default ReporteMensual;