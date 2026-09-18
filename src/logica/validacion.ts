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

import type { CamposDeHabito } from './altas'

/**
 * Los problemas de un hábito, en orden de aparición en el formulario. Lista
 * vacía quiere decir que se puede guardar.
 */
export function problemasDe(campos: CamposDeHabito): string[] {
  const problemas: string[] = []

  if (campos.nombre.trim() === '') problemas.push('Ponle un nombre.')

  // Un hábito privado sin alias se vería como «Hábito privado» en la pantalla
  // Hoy, y entre los demás eso canta más que un nombre cualquiera (sección 8).
  if (campos.privado && (campos.alias === null || campos.alias.trim() === '')) {
    problemas.push('Un hábito privado necesita un alias: es lo que se ve en pantalla.')
  }

  if (campos.cadencia === 'semanal') problemas.push(...problemasDelSemaforo(campos))

  return problemas
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
