/**
 * Los textos que se leen en pantalla.
 *
 * Viven aquí, y no dentro de los componentes, por dos razones: para que el
 * español quede en un solo lugar y se pueda corregir de una vez (regla 1), y
 * para que se puedan probar sin tener que dibujar la interfaz (regla 10).
 *
 * Ninguno de estos textos juzga. En los hábitos negativos no hay «qué lástima»
 * ni caritas: se registra y se sigue (sección 10).
 */

import type { Habito, Registro } from '../tipos'

/** `"1 semana"`, `"3 semanas"`. */
export function pluralizar(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

/**
 * La racha de un hábito, en su unidad.
 *
 * La unidad la manda la cadencia (sección 6): un hábito diario cuenta días, uno
 * semanal cuenta semanas cumplidas. En cero no se regaña: se dice que todavía
 * no hay racha.
 */
export function textoDeRacha(habito: Habito, actual: number): string {
  if (actual === 0) return 'sin racha todavía'
  const unidad = habito.cadencia === 'semanal' ? pluralizar(actual, 'semana', 'semanas') : pluralizar(actual, 'día', 'días')
  return `racha de ${unidad}`
}

/** El progreso de la semana en curso de un hábito semanal: `"3 de 5 esta semana"`. */
export function textoDeSemana(hechos: number, objetivo: number): string {
  return `${hechos} de ${objetivo} esta semana`
}

/** La etiqueta del contador de un hábito negativo: `"día limpio"` / `"días limpios"`. */
export function textoDiasLimpios(dias: number): string {
  return dias === 1 ? 'día limpio' : 'días limpios'
}

/**
 * El renglón chico de la fila de un hábito negativo.
 *
 * La fila es compacta —dos renglones, como la de un positivo— así que aquí cabe
 * **un solo dato**, el que más importe saber en ese momento:
 *
 * 1. Si hubo recaída hoy, cuándo y en qué contexto.
 * 2. Si no, el récord, y solo cuando hay uno mejor que el de ahora.
 * 3. Si el contador de ahora **es** el récord, se dice, que es lo que se quiere
 *    oír.
 * 4. Y si el hábito acaba de nacer, que hoy empieza a contar.
 *
 * Ninguna de las cuatro frases juzga (sección 10).
 */
export function textoDeNegativo(actual: number, mejor: number, recaidaDeHoy: Registro | undefined): string {
  if (recaidaDeHoy !== undefined) {
    const cuando = recaidaDeHoy.hora === null ? 'hoy' : `hoy ${recaidaDeHoy.hora}`
    return recaidaDeHoy.contexto === null ? cuando : `${cuando} · ${recaidaDeHoy.contexto}`
  }
  if (mejor > actual) return `mejor: ${pluralizar(mejor, 'día', 'días')}`
  if (actual > 0) return 'tu mejor racha hasta ahora'
  return 'empieza a contar hoy'
}

/** Los comodines que quedan del mes: `"1 comodín disponible"`, `"sin comodines este mes"`. */
export function textoDeComodines(disponibles: number): string {
  if (disponibles === 0) return 'sin comodines este mes'
  return `${pluralizar(disponibles, 'comodín disponible', 'comodines disponibles')}`
}
