/**
 * La vida de un hábito: desde cuándo cuenta y hasta cuándo.
 *
 * Tres fechas mandan sobre cualquier cuenta que se haga de un hábito —rachas,
 * porcentajes, mapa de calor— y aquí se resuelven una sola vez, para que los
 * cinco módulos que las necesitan no las interpreten cada uno a su manera:
 *
 * - **`creadoEn`** — nunca se mira más atrás. Un hábito nuevo no inventa fallas
 *   de días en que no existía (sección 9, regla 1).
 * - **`revividoEn`** — si el hábito estuvo archivado y volvió, el conteo
 *   arranca aquí. Los meses guardados no cuentan ni a favor ni en contra.
 * - **`archivadoEn`** — un hábito archivado deja de acumular. No sigue juntando
 *   días fallados mientras está guardado.
 *
 * Y una cuarta regla que no es una fecha del hábito sino del calendario: **hoy
 * nunca cuenta**. El juicio llega a medianoche (sección 6). Por eso el día de
 * hoy entra siempre como parámetro y aquí no se lee el reloj.
 */

import { diasEntre, sumarDias } from './fechas'
import type { Fecha, Habito } from '../tipos'

/** El primer día que cuenta: el de su vuelta si revivió, o el de su alta. */
export function inicioDeConteo(habito: Habito): Fecha {
  return habito.revividoEn ?? habito.creadoEn
}

/** El último día que cuenta: ayer, o la víspera del archivado si está guardado. */
export function finDeConteo(habito: Habito, hoy: Fecha): Fecha {
  const ayer = sumarDias(hoy, -1)
  if (habito.archivadoEn === null) return ayer

  const vispera = sumarDias(habito.archivadoEn, -1)
  return vispera < ayer ? vispera : ayer
}

/** ¿Este día cuenta para este hábito? */
export function cuentaElDia(habito: Habito, fecha: Fecha, hoy: Fecha): boolean {
  return fecha >= inicioDeConteo(habito) && fecha <= finDeConteo(habito, hoy)
}

/**
 * Cuántos días lleva contando el hábito, de su inicio a su fin.
 *
 * Es el denominador honesto de cualquier porcentaje: si el hábito nació hace
 * nueve días, su cumplimiento «a 30 días» se calcula sobre nueve, no sobre
 * treinta con veintiún fallas inventadas.
 */
export function diasQueCuentan(habito: Habito, hoy: Fecha): number {
  return Math.max(0, diasEntre(inicioDeConteo(habito), finDeConteo(habito, hoy)) + 1)
}
