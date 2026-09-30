/**
 * Lo que revisa el formulario de un hábito antes de guardar.
 *
 * Devuelve frases en español listas para enseñarse, no códigos de error: son
 * las mismas que se leen en pantalla. Vive aquí, y no dentro del componente,
 * para poder probarse sin dibujar la interfaz (regla 10).
 *
 * Es lo mínimo que impide guardar un hábito que después no se podría calcular.
 * No regaña de más: un hábito sin contextos o sin emoji se guarda sin problema.
 */

import { diasEntre } from './fechas'
import type { CamposDeHabito } from './altas'
import type { Fecha } from '../tipos'

/**
 * Lo más atrás que se puede poner la fecha de inicio de un hábito.
 *
 * No es una regla de negocio, es un cerrojo contra el dedo gordo: en el
 * selector de fechas del iPhone es facilísimo irse dos años sin querer, y un
 * hábito diario que nace en 2019 se pone a rellenar dos mil días de golpe.
 */
export const DIAS_MAXIMOS_HACIA_ATRAS = 365

/**
 * Los problemas de un hábito, en orden de aparición en el formulario. Lista
 * vacía quiere decir que se puede guardar.
 */
export function problemasDe(campos: CamposDeHabito, hoy: Fecha): string[] {
  const problemas: string[] = []

  if (campos.nombre.trim() === '') problemas.push('Ponle un nombre.')

  problemas.push(...problemasDeLaFecha(campos.creadoEn, hoy))

  // Un hábito privado sin alias se vería como «Hábito privado» en la pantalla
  // Hoy, y entre los demás eso canta más que un nombre cualquiera (sección 8).
  if (campos.privado && (campos.alias === null || campos.alias.trim() === '')) {
    problemas.push('Un hábito privado necesita un alias: es lo que se ve en pantalla.')
  }

  if (campos.cadencia === 'semanal') problemas.push(...problemasDelSemaforo(campos))

  return problemas
}

/**
 * La fecha desde la que se lleva el hábito.
 *
 * Mañana no existe: un hábito que empieza en el futuro no tiene un solo día que
 * contar y deja todas las cuentas en negativo. Y hacia atrás hay un tope, que
 * está explicado arriba.
 */
function problemasDeLaFecha(creadoEn: Fecha, hoy: Fecha): string[] {
  if (creadoEn === '') return ['Ponle la fecha desde la que lo llevas.']
  if (creadoEn > hoy) return ['La fecha desde la que lo llevas no puede ser en el futuro.']

  if (diasEntre(creadoEn, hoy) > DIAS_MAXIMOS_HACIA_ATRAS) {
    return ['La fecha desde la que lo llevas no puede ser de hace más de un año.']
  }

  return []
}

/**
 * Los dos números de un hábito semanal (sección 6).
 *
 * El objetivo es lo que se propuso y el mínimo el piso que mantiene viva la
 * racha, así que el mínimo no puede ser mayor que el objetivo: no habría manera
 * de quedar en ámbar y la racha se rompería sin aviso.
 */
function problemasDelSemaforo(campos: CamposDeHabito): string[] {
  const objetivo = campos.objetivo
  const minimo = campos.minimo

  if (objetivo === null || objetivo < 1 || objetivo > 7) {
    return ['El objetivo va de 1 a 7 veces por semana.']
  }

  if (minimo === null || minimo < 1) return ['El mínimo va de 1 a 7 veces por semana.']
  if (minimo > objetivo) return ['El mínimo no puede ser mayor que el objetivo.']

  return []
}
