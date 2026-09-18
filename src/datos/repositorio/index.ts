/**
 * Repositorio: el único punto de acceso a los datos (regla 5).
 *
 * Ningún componente de la app toca `localStorage` directamente: si necesita
 * datos, los pide aquí. Por dentro está repartido en tres archivos para no
 * pasar de doscientos renglones (regla 4), pero desde fuera se sigue usando
 * como uno solo.
 */

export {
  borrarTodo,
  empezarDeCero,
  guardarDocumento,
  hayDatos,
  importarDocumento,
  inicializar,
  leerDocumento,
} from './documento'
export {
  eliminarHabito,
  eliminarRegistro,
  guardarComodin,
  guardarHabito,
  guardarRegistro,
  guardarSemana,
  guardarSemanas,
  obtenerComodines,
  obtenerHabitos,
  obtenerHabitosActivos,
  obtenerRegistros,
  obtenerRegistrosDe,
  obtenerSemanas,
} from './habitos'
export {
  eliminarMedicion,
  eliminarMeta,
  guardarAjustes,
  guardarMedicion,
  guardarMeta,
  marcarRespaldo,
  obtenerAjustes,
  obtenerMediciones,
  obtenerMedicionesDe,
  obtenerMetas,
} from './metas'
