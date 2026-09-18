/**
 * El porcentaje de grasa corporal estimado (sección 11).
 *
 * Es la fórmula de la Marina de EE.UU. para hombres, que necesita tres medidas
 * en centímetros: cintura, cuello y la estatura que está en Ajustes.
 *
 *     %grasa = 495 / (1.0324 - 0.19077 * log10(cintura - cuello)
 *                     + 0.15456 * log10(estatura)) - 450
 *
 * **Es una estimación y se presenta siempre como tal**, nunca como una
 * medición clínica: una cinta métrica mal puesta mueve el resultado un punto
 * entero. Lo que sirve de aquí es la tendencia a lo largo de los meses, no el
 * número de un día suelto.
 *
 * Devuelve `null` en vez de un número inventado cuando falta una medida o
 * cuando la cintura no es mayor que el cuello —ahí el logaritmo no existe—,
 * para que la pantalla sepa que no hay nada que enseñar.
 */

import type { Medicion } from '../tipos'

export function grasaEstimada(
  cinturaCm: number | null,
  cuelloCm: number | null,
  estaturaCm: number | null,
): number | null {
  if (cinturaCm === null || cuelloCm === null || estaturaCm === null) return null
  if (cinturaCm <= cuelloCm || estaturaCm <= 0) return null

  const divisor =
    1.0324 - 0.19077 * Math.log10(cinturaCm - cuelloCm) + 0.15456 * Math.log10(estaturaCm)
  if (divisor <= 0) return null

  const porcentaje = 495 / divisor - 450
  if (!Number.isFinite(porcentaje) || porcentaje <= 0) return null

  return Math.round(porcentaje * 10) / 10
}

/** La grasa estimada de una medición, si trae cintura y cuello. */
export function grasaDeMedicion(medicion: Medicion, estaturaCm: number): number | null {
  return grasaEstimada(medicion.valores.cintura ?? null, medicion.valores.cuello ?? null, estaturaCm)
}

/** Si a una meta se le puede estimar la grasa: necesita cintura y cuello. */
export function midePorcentajeDeGrasa(claves: string[]): boolean {
  return claves.includes('cintura') && claves.includes('cuello')
}
