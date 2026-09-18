/**
 * El respaldo: qué se guarda, cómo se llama el archivo y cuándo toca avisar
 * (sección 14).
 *
 * Todo lo de aquí es cálculo puro —no toca `localStorage`, ni el reloj, ni la
 * pantalla— para poder probarlo con Vitest (regla 10). Quien lee los datos es
 * el repositorio; quien le entrega el archivo al teléfono es
 * `src/pantallas/archivos.ts`.
 */

import { diasEntre, fechaLargaEnPalabras } from './fechas'
import type { DocumentoRacha, Fecha } from '../tipos'

/** Cada cuántos días conviene volver a respaldar (sección 14). */
export const DIAS_ENTRE_RESPALDOS = 30

/** La versión de respaldo que esta app sabe leer y escribir. */
export const VERSION_DE_RESPALDO = 1

/**
 * El archivo de respaldo: el documento completo dentro de un sobre.
 *
 * El sobre existe para poder revisar el archivo **antes** de tocar nada al
 * importar. `app` delata un JSON de otro programa y `version` delata un
 * respaldo hecho por una Racha más nueva que la instalada, que traería datos
 * que esta no sabría leer.
 */
export interface Respaldo {
  app: 'racha'
  version: number
  /** El día en que se hizo, en hora local (regla 2). */
  creadoEn: Fecha
  documento: DocumentoRacha
}

/** Mete el documento en el sobre. */
export function armarRespaldo(documento: DocumentoRacha, hoy: Fecha): Respaldo {
  return { app: 'racha', version: VERSION_DE_RESPALDO, creadoEn: hoy, documento }
}

/**
 * El texto que va dentro del archivo.
 *
 * Con saltos de línea y sangrías, no apretado en un solo renglón. Ocupa algo
 * más, y a cambio el respaldo se puede abrir y leer con cualquier cosa: es
 * media garantía de que los datos no quedan presos de esta app.
 */
export function aTexto(respaldo: Respaldo): string {
  return JSON.stringify(respaldo, null, 2)
}

/** `racha-respaldo-2026-09-18.json`, con la fecha local (regla 2). */
export function nombreDeArchivo(hoy: Fecha): string {
  return `racha-respaldo-${hoy}.json`
}

/**
 * Qué trae un documento, en una línea.
 *
 * Se enseña antes de importar, para que se vea si el archivo es el que se
 * cree: un respaldo con cero hábitos delata que se eligió el archivo
 * equivocado antes de reemplazar nada.
 */
export function resumenDelDocumento(documento: DocumentoRacha): string {
  return [
    cuenta(documento.habitos.length, 'hábito', 'hábitos'),
    cuenta(documento.metas.length, 'meta', 'metas'),
    cuenta(documento.registros.length, 'día registrado', 'días registrados'),
  ].join(', ')
}

/** Cuántos días pasaron desde el último respaldo. `null` si nunca hubo uno. */
export function diasSinRespaldo(ultimoRespaldo: Fecha | null, hoy: Fecha): number | null {
  if (ultimoRespaldo === null) return null
  // Nunca negativo: un respaldo con fecha futura —por un reloj movido o por un
  // archivo viejo importado— no debe contar como "faltan días para avisar".
  return Math.max(0, diasEntre(ultimoRespaldo, hoy))
}

/**
 * ¿Toca avisar en Ajustes?
 *
 * Nunca haber respaldado también cuenta, y es el caso más importante: un
 * teléfono con seis meses de rachas y cero respaldos es justo lo que este
 * aviso existe para evitar.
 */
export function tocaAvisar(ultimoRespaldo: Fecha | null, hoy: Fecha): boolean {
  const dias = diasSinRespaldo(ultimoRespaldo, hoy)
  return dias === null || dias > DIAS_ENTRE_RESPALDOS
}

/** El aviso de Ajustes, o `null` si el respaldo está al día. */
export function avisoDeRespaldo(ultimoRespaldo: Fecha | null, hoy: Fecha): string | null {
  if (ultimoRespaldo === null) {
    return 'Todavía no has hecho ningún respaldo. Si se pierde el teléfono, se pierde todo.'
  }

  const dias = diasSinRespaldo(ultimoRespaldo, hoy) ?? 0
  if (dias <= DIAS_ENTRE_RESPALDOS) return null

  return `Hace ${dias} días que no respaldas: el último es del ${fechaLargaEnPalabras(ultimoRespaldo)}.`
}

/** La línea tranquila de Ajustes, la que se ve cuando no hay nada que avisar. */
export function textoUltimoRespaldo(ultimoRespaldo: Fecha | null): string {
  if (ultimoRespaldo === null) return 'Nunca has hecho un respaldo.'
  return `Último respaldo: ${fechaLargaEnPalabras(ultimoRespaldo)}.`
}

/** «1 meta» o «2 metas», sin el paréntesis feo de «1 meta(s)». */
function cuenta(numero: number, singular: string, plural: string): string {
  return `${numero} ${numero === 1 ? singular : plural}`
}
