/**
 * El porcentaje de cumplimiento (sección 6 del documento de arquitectura).
 *
 * Es «el número honesto»: el que no se deja salvar por un comodín ni por una
 * semana ámbar. La racha dice si vas seguido; esto dice cuánto de lo que te
 * propusiste has hecho.
 *
 * Se calcula sobre tres ventanas —7 días, 30 días y todo— y se muestran las
 * tres juntas, porque cada una contesta algo distinto: cómo vengo, cómo voy y
 * quién soy.
 *
 * Tres cuidados, los mismos de siempre:
 *
 * - **Hoy no cuenta.** El día en curso no se juzga hasta medianoche.
 * - **El denominador es honesto.** Si el hábito nació hace nueve días, su
 *   cumplimiento «a 30 días» se calcula sobre nueve, no sobre treinta con
 *   veintiún fallas inventadas (sección 9).
 * - **Los meses archivado no entran**, ni arriba ni abajo de la división.
 */

import { diasEntre, sumarDias } from './fechas'
import { finDeConteo, inicioDeConteo } from './vida'
import type { Fecha, Habito, Registro } from '../tipos'

/** Un porcentaje y los días sobre los que se sacó. */
export interface Cumplimiento {
  /** De 0 a 100. `null` cuando todavía no hay ni un día que contar. */
  porcentaje: number | null
  dias: number
}

/** Las tres ventanas que se enseñan siempre juntas. */
export interface TresVentanas {
  sieteDias: Cumplimiento
  treintaDias: Cumplimiento
  total: Cumplimiento
}

/** Las tres de un jalón, que es como se ven en el detalle del hábito. */
export function cumplimientos(habito: Habito, registros: Registro[], hoy: Fecha): TresVentanas {
  return {
    sieteDias: cumplimientoDe(habito, registros, hoy, 7),
    treintaDias: cumplimientoDe(habito, registros, hoy, 30),
    total: cumplimientoDe(habito, registros, hoy, null),
  }
}

/**
 * El cumplimiento de un hábito en una ventana de días. `null` de ventana
 * quiere decir toda su vida.
 *
 * Cada clase de hábito se mide como se vive (sección 5):
 *
 * - **Negativo** — días limpios entre días contados.
 * - **Diario** — días cumplidos entre días contados.
 * - **Semanal** — marcas hechas entre marcas propuestas. El objetivo se reparte
 *   por día, así que treinta días con objetivo de 5 piden 21.4 marcas. Por eso
 *   una semana ámbar salva la racha pero baja este número, que es justo lo que
 *   el documento pide de él.
 */
export function cumplimientoDe(
  habito: Habito,
  registros: Registro[],
  hoy: Fecha,
  ventanaDeDias: number | null,
): Cumplimiento {
  const fin = finDeConteo(habito, hoy)
  const inicio = arranqueDeLaVentana(habito, fin, ventanaDeDias)

  if (fin < inicio) return { porcentaje: null, dias: 0 }

  const dias = diasEntre(inicio, fin) + 1
  const contados = registros.filter(
    (registro) => registro.habitoId === habito.id && registro.fecha >= inicio && registro.fecha <= fin,
  )

  if (habito.tipo === 'negativo') {
    const recaidas = contados.filter((registro) => registro.estado === 'fallado').length
    return { porcentaje: aPorcentaje(dias - recaidas, dias), dias }
  }

  const hechas = contados.filter((registro) => registro.estado === 'cumplido').length

  if (habito.cadencia !== 'semanal') return { porcentaje: aPorcentaje(hechas, dias), dias }

  const propuestas = ((habito.objetivo ?? 0) * dias) / 7
  return { porcentaje: aPorcentaje(hechas, propuestas), dias }
}

/** El primer día de la ventana, sin salirse nunca de la vida del hábito. */
function arranqueDeLaVentana(habito: Habito, fin: Fecha, ventanaDeDias: number | null): Fecha {
  const inicio = inicioDeConteo(habito)
  if (ventanaDeDias === null) return inicio

  const arranque = sumarDias(fin, -(ventanaDeDias - 1))
  return arranque > inicio ? arranque : inicio
}

/** De 0 a 100, redondeado. Nunca pasa de 100 aunque se haya hecho de más. */
function aPorcentaje(hechas: number, propuestas: number): number | null {
  if (propuestas <= 0) return null
  return Math.min(100, Math.round((hechas / propuestas) * 100))
}
