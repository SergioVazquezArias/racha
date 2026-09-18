/**
 * Las bandas del nivel de inglés (sección 11).
 *
 * La escala es fija y se dibuja como franjas de fondo en la gráfica de la meta
 * de inglés, para que un puntaje se lea como lo que significa —«voy en B1»— y
 * no como un número suelto entre 0 y 100.
 *
 *     40-54 = A2 · 55-69 = B1 · 70-84 = B2 · 85+ = C1
 *
 * Solo aplican a metas medidas en puntos. Ninguna otra meta las enseña.
 */

import type { Meta } from '../tipos'

export interface BandaDeIngles {
  nombre: string
  desde: number
  /** El último puntaje de la banda. La más alta no tiene techo. */
  hasta: number
}

export const BANDAS_DE_INGLES: BandaDeIngles[] = [
  { nombre: 'A2', desde: 40, hasta: 54 },
  { nombre: 'B1', desde: 55, hasta: 69 },
  { nombre: 'B2', desde: 70, hasta: 84 },
  { nombre: 'C1', desde: 85, hasta: 100 },
]

/** Si a esta meta le tocan las bandas: las medidas en puntos. */
export function usaBandasDeIngles(meta: Meta): boolean {
  return meta.unidad === 'puntos'
}

/** En qué banda cae un puntaje, o `null` si queda por debajo de A2. */
export function bandaDe(puntaje: number): BandaDeIngles | null {
  return BANDAS_DE_INGLES.find((banda) => puntaje >= banda.desde && puntaje <= banda.hasta) ?? null
}

/** Las bandas que se cruzan con lo que la gráfica está enseñando. */
export function bandasVisibles(minimo: number, maximo: number): BandaDeIngles[] {
  return BANDAS_DE_INGLES.filter((banda) => banda.hasta >= minimo && banda.desde <= maximo)
}
