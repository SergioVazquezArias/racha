/**
 * Los comodines (sección 7 del documento de arquitectura).
 *
 * Un comodín congela: la racha no crece, pero tampoco se rompe. Las cuatro
 * reglas que lo gobiernan:
 *
 * - Hay **uno al mes**. Se recarga el día 1 y **no se acumulan**.
 * - Se aplica sobre una semana roja, o sobre un día fallado si la cadencia es
 *   diaria.
 * - Alcanza **hasta tres días hacia atrás**.
 * - **Nunca** sirve para un hábito negativo: una recaída es una recaída.
 */

import { claveSemana, diasEntre } from './fechas'
import type { ClaveSemana, Comodin, Fecha, Habito } from '../tipos'

/** Cuántos comodines se pueden gastar en un mes. Uno, y no se acumulan. */
export const COMODINES_POR_MES = 1

/** Hasta cuántos días hacia atrás alcanza un comodín. */
export const DIAS_MAXIMOS_HACIA_ATRAS = 3

/** El mes de una fecha, `"2026-09"`. */
function mesDe(fecha: Fecha): string {
  return fecha.slice(0, 7)
}

/**
 * Cuántos comodines quedan este mes.
 *
 * Cuenta por `aplicadoEn`, el día en que se gastó, no por el día que cubre: un
 * comodín gastado el 1 de septiembre sobre el 30 de agosto sale del cupo de
 * septiembre. El cupo es del usuario, no de cada hábito.
 */
export function comodinesDisponibles(comodines: Comodin[], hoy: Fecha): number {
  const gastadosEsteMes = comodines.filter((comodin) => mesDe(comodin.aplicadoEn) === mesDe(hoy)).length
  return Math.max(0, COMODINES_POR_MES - gastadosEsteMes)
}

/** ¿Se puede gastar hoy un comodín sobre ese día? */
export function puedeAplicarComodin(habito: Habito, fecha: Fecha, comodines: Comodin[], hoy: Fecha): boolean {
  // Un negativo nunca, ni aunque su bandera diga lo contrario por un error.
  if (habito.tipo === 'negativo' || !habito.permiteComodin) return false
  // Ni al futuro, ni antes de que el hábito existiera.
  if (fecha < habito.creadoEn) return false

  const diasHaciaAtras = diasEntre(fecha, hoy)
  if (diasHaciaAtras < 0 || diasHaciaAtras > DIAS_MAXIMOS_HACIA_ATRAS) return false

  return comodinesDisponibles(comodines, hoy) > 0
}

/** ¿Hay un comodín congelando ese día de ese hábito? */
export function comodinCubreDia(comodines: Comodin[], habitoId: string, fecha: Fecha): boolean {
  return comodines.some((comodin) => comodin.habitoId === habitoId && comodin.fecha === fecha)
}

/** ¿Hay un comodín congelando esa semana? En cadencia semanal congela los siete días. */
export function comodinCubreSemana(comodines: Comodin[], habitoId: string, clave: ClaveSemana): boolean {
  return comodines.some((comodin) => comodin.habitoId === habitoId && claveSemana(comodin.fecha) === clave)
}
