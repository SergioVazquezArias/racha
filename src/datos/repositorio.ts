/**
 * Repositorio: el único punto de acceso a los datos (regla 5).
 *
 * Todo Racha vive en un solo documento JSON guardado en `localStorage` bajo la
 * llave `"racha.v1"`. Ningún componente de la app puede tocar `localStorage`
 * directamente: si necesita datos, los pide aquí.
 */

import { documentoDeEjemplo, documentoVacio } from './ejemplo/documento'
import type { Ajustes, DocumentoRacha, Fecha, Habito, Medicion, Meta, Registro, Semana } from '../tipos'

/** La llave de `localStorage`. El `v1` permite migrar mañana sin pisar lo viejo. */
const LLAVE = 'racha.v1'

// ---------------------------------------------------------------------------
// Lectura y escritura del documento completo
// ---------------------------------------------------------------------------

/** Comprueba que lo guardado tenga la forma de un documento de Racha. */
function esDocumento(valor: unknown): valor is DocumentoRacha {
  if (typeof valor !== 'object' || valor === null) return false
  const posible = valor as Partial<Record<keyof DocumentoRacha, unknown>>
  const listas: (keyof DocumentoRacha)[] = ['habitos', 'registros', 'semanas', 'metas', 'mediciones']
  return listas.every((clave) => Array.isArray(posible[clave])) && typeof posible.ajustes === 'object'
}

/**
 * Lee el documento guardado. Si no hay nada, o si lo guardado está dañado,
 * devuelve un documento vacío en vez de reventar: la app nunca se cae por un
 * dato mal escrito.
 */
export function leerDocumento(): DocumentoRacha {
  try {
    const crudo = localStorage.getItem(LLAVE)
    if (crudo === null) return documentoVacio()
    const analizado: unknown = JSON.parse(crudo)
    return esDocumento(analizado) ? analizado : documentoVacio()
  } catch {
    return documentoVacio()
  }
}

/** Guarda el documento completo. Es la única escritura a `localStorage`. */
export function guardarDocumento(documento: DocumentoRacha): void {
  localStorage.setItem(LLAVE, JSON.stringify(documento))
}

/** ¿Ya hay datos en este teléfono? */
export function hayDatos(): boolean {
  return localStorage.getItem(LLAVE) !== null
}

/**
 * Arranque de la app. Si el teléfono está vacío, siembra los datos de ejemplo.
 * Si ya hay datos, no toca nada.
 */
export function inicializar(): DocumentoRacha {
  if (hayDatos()) return leerDocumento()
  const documento = documentoDeEjemplo()
  guardarDocumento(documento)
  return documento
}

/** Borra todo. Se usará al importar un respaldo y al empezar de cero. */
export function borrarTodo(): void {
  localStorage.removeItem(LLAVE)
}

/** Lee, deja que la función cambie el documento y lo vuelve a guardar. */
function modificar(cambio: (documento: DocumentoRacha) => void): void {
  const documento = leerDocumento()
  cambio(documento)
  guardarDocumento(documento)
}

/** Mete el elemento en la lista, o reemplaza el que ya tuviera el mismo `id`. */
function colocar<T extends { id: string }>(lista: T[], elemento: T): void {
  const posicion = lista.findIndex((existente) => existente.id === elemento.id)
  if (posicion === -1) lista.push(elemento)
  else lista[posicion] = elemento
}

// ---------------------------------------------------------------------------
// Hábitos
// ---------------------------------------------------------------------------

export function obtenerHabitos(): Habito[] {
  return leerDocumento().habitos.sort((uno, otro) => uno.orden - otro.orden)
}

/** Los que se ven en la pantalla Hoy: todos menos los archivados. */
export function obtenerHabitosActivos(): Habito[] {
  return obtenerHabitos().filter((habito) => habito.archivadoEn === null)
}

export function guardarHabito(habito: Habito): void {
  modificar((documento) => colocar(documento.habitos, habito))
}

/** Archivar conserva todo el historial (sección 9). Es lo habitual. */
export function archivarHabito(habitoId: string, fecha: Fecha): void {
  modificar((documento) => {
    const habito = documento.habitos.find((candidato) => candidato.id === habitoId)
    if (habito !== undefined) habito.archivadoEn = fecha
  })
}

/** Eliminar borra el hábito y todo su historial. Sin vuelta atrás. */
export function eliminarHabito(habitoId: string): void {
  modificar((documento) => {
    documento.habitos = documento.habitos.filter((habito) => habito.id !== habitoId)
    documento.registros = documento.registros.filter((r) => r.habitoId !== habitoId)
    documento.semanas = documento.semanas.filter((semana) => semana.habitoId !== habitoId)
  })
}

// ---------------------------------------------------------------------------
// Registros y semanas
// ---------------------------------------------------------------------------

export function obtenerRegistros(): Registro[] {
  return leerDocumento().registros
}

export function obtenerRegistrosDe(habitoId: string): Registro[] {
  return obtenerRegistros().filter((registro) => registro.habitoId === habitoId)
}

export function guardarRegistro(registro: Registro): void {
  modificar((documento) => colocar(documento.registros, registro))
}

/** Desmarcar un día: se quita el registro, no se guarda como fallado. */
export function eliminarRegistro(registroId: string): void {
  modificar((documento) => {
    documento.registros = documento.registros.filter((registro) => registro.id !== registroId)
  })
}

export function obtenerSemanas(): Semana[] {
  return leerDocumento().semanas
}

/** Los veredictos se guardan una vez y no se recalculan (regla 8). */
export function guardarSemana(semana: Semana): void {
  modificar((documento) => colocar(documento.semanas, semana))
}

// ---------------------------------------------------------------------------
// Metas y mediciones
// ---------------------------------------------------------------------------

export function obtenerMetas(): Meta[] {
  return leerDocumento().metas
}

export function guardarMeta(meta: Meta): void {
  modificar((documento) => colocar(documento.metas, meta))
}

/** Eliminar una meta borra también sus mediciones (sección 9). */
export function eliminarMeta(metaId: string): void {
  modificar((documento) => {
    documento.metas = documento.metas.filter((meta) => meta.id !== metaId)
    documento.mediciones = documento.mediciones.filter((m) => m.metaId !== metaId)
  })
}

export function obtenerMediciones(): Medicion[] {
  return leerDocumento().mediciones
}

export function obtenerMedicionesDe(metaId: string): Medicion[] {
  return obtenerMediciones().filter((medicion) => medicion.metaId === metaId)
}

export function guardarMedicion(medicion: Medicion): void {
  modificar((documento) => colocar(documento.mediciones, medicion))
}

// ---------------------------------------------------------------------------
// Ajustes
// ---------------------------------------------------------------------------

export function obtenerAjustes(): Ajustes {
  return leerDocumento().ajustes
}

export function guardarAjustes(ajustes: Ajustes): void {
  modificar((documento) => {
    documento.ajustes = ajustes
  })
}
