/**
 * El documento completo: leerlo, guardarlo y arrancar la app.
 *
 * Todo Racha vive en un solo documento JSON guardado en `localStorage` bajo la
 * llave `"racha.v1"`. Esta es la única parte del código que toca
 * `localStorage`; el resto del repositorio pasa por aquí (regla 5).
 */

import { documentoDeEjemplo, documentoEnLimpio, documentoVacio } from '../ejemplo/documento'
import type { DocumentoRacha } from '../../tipos'

/** La llave de `localStorage`. El `v1` permite migrar mañana sin pisar lo viejo. */
const LLAVE = 'racha.v1'

/** Comprueba que lo guardado tenga la forma de un documento de Racha. */
function esDocumento(valor: unknown): valor is DocumentoRacha {
  if (typeof valor !== 'object' || valor === null) return false
  const posible = valor as Partial<Record<keyof DocumentoRacha, unknown>>
  const listas: (keyof DocumentoRacha)[] = ['habitos', 'registros', 'semanas', 'metas', 'mediciones']
  // La lista de comodines se valida aparte: los documentos guardados antes de
  // la fase 03 no la traen, y eso no los vuelve documentos dañados.
  return listas.every((clave) => Array.isArray(posible[clave])) && typeof posible.ajustes === 'object'
}

/** Rellena la lista de comodines si el documento viene de antes de la fase 03. */
function conComodines(documento: DocumentoRacha): DocumentoRacha {
  return Array.isArray(documento.comodines) ? documento : { ...documento, comodines: [] }
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
    if (!esDocumento(analizado)) return documentoVacio()
    return conComodines(analizado)
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

/** Borra todo. Lo usan la importación de un respaldo y el empezar de cero. */
export function borrarTodo(): void {
  localStorage.removeItem(LLAVE)
}

/**
 * Escribe un respaldo ya revisado encima de todo lo que había (sección 14).
 *
 * Quien comprueba que el respaldo sea legible, de esta versión y que esté
 * completo es `src/logica/validarRespaldo.ts`, antes de llegar aquí. Este
 * archivo solo escribe: cuando se le llama, la decisión ya se tomó y lo de
 * antes se pierde.
 */
export function importarDocumento(documento: DocumentoRacha): void {
  guardarDocumento(documento)
}

/**
 * Borrar todo y empezar de cero (sección 14).
 *
 * Deja los ocho hábitos y las dos metas puestos, para no tener que escribirlos
 * desde la nada, y **nada más**: ni un día registrado, ni una semana cerrada,
 * ni una medición. No es lo mismo que una instalación nueva, que sí trae
 * historial de ejemplo para que ninguna pantalla se vea vacía el primer día;
 * aquí las rachas empiezan en cero de verdad.
 *
 * Los detalles de por qué eso no es solo vaciar listas están en
 * `documentoEnLimpio`, junto a las pruebas que lo vigilan.
 */
export function empezarDeCero(): DocumentoRacha {
  const documento = documentoEnLimpio()
  guardarDocumento(documento)
  return documento
}

/** Lee, deja que la función cambie el documento y lo vuelve a guardar. */
export function modificar(cambio: (documento: DocumentoRacha) => void): void {
  const documento = leerDocumento()
  cambio(documento)
  guardarDocumento(documento)
}

/** Mete el elemento en la lista, o reemplaza el que ya tuviera el mismo `id`. */
export function colocar<T extends { id: string }>(lista: T[], elemento: T): void {
  const posicion = lista.findIndex((existente) => existente.id === elemento.id)
  if (posicion === -1) lista.push(elemento)
  else lista[posicion] = elemento
}
