/**
 * El historial de un hábito: las últimas catorce semanas, día por día.
 *
 * De aquí salen las dos cosas que se ven en su detalle —las barras semanales
 * con el color del semáforo y el mapa de calor— y salen **de un solo recorrido**,
 * porque son la misma información contada dos veces: la barra es el resumen de
 * la semana y el mapa son sus siete días.
 *
 * Los colores de las semanas **no se calculan aquí**: se leen del veredicto que
 * se guardó al cerrarlas (regla 8). Si una semana no tiene veredicto —porque el
 * hábito es diario, o negativo, o porque la semana sigue en curso— la barra no
 * lleva color de semáforo y se dibuja neutra.
 */

import { comodinCubreDia, comodinCubreSemana } from './comodines'
import { claveSemana, diaYMesCorto, diasDeLaSemana, lunesDeLaSemana, sumarDias } from './fechas'
import { hechosDeSemana } from './semaforo'
import { cuentaElDia } from './vida'
import type { DatosDeRacha } from './rachas'
import type { ClaveSemana, ColorSemana, Fecha, Habito } from '../tipos'

/** Cuántas semanas se dibujan, contando la de hoy. */
export const SEMANAS_DEL_HISTORIAL = 14

/**
 * Cómo se pinta un día en el mapa de calor.
 *
 * Son ocho y no tres porque los días no significan lo mismo en cada clase de
 * hábito (sección 5): un día sin marcar es una falla en uno diario, un día
 * libre en uno semanal —ahí nunca se pinta rojo (sección 6)— y un día limpio,
 * que cuenta a favor, en uno negativo.
 */
export type EstadoDia =
  | 'cumplido'
  | 'limpio'
  | 'libre'
  | 'fallado'
  | 'recaida'
  | 'comodin'
  | 'hoy'
  | 'fuera'

export interface DiaDelMapa {
  fecha: Fecha
  estado: EstadoDia
}

/** Una semana del historial: su barra y sus siete días. */
export interface SemanaDelHistorial {
  clave: ClaveSemana
  lunes: Fecha
  /** Para el eje de las barras: `"15 sept"`. */
  etiqueta: string
  /** Marcas hechas, o días limpios en un hábito negativo. */
  hechos: number
  /** Marcas propuestas, o días que contaron. Nunca cero salvo en una semana muerta. */
  total: number
  /** El color guardado del semáforo, o `null` si esa semana no tiene veredicto. */
  color: ColorSemana | null
  comodin: boolean
  dias: DiaDelMapa[]
}

/**
 * Las últimas catorce semanas, de la más vieja a la más nueva. La última es la
 * semana en curso, que todavía no tiene veredicto.
 */
export function historialDeSemanas(
  habito: Habito,
  datos: DatosDeRacha,
  hoy: Fecha,
  cuantas: number = SEMANAS_DEL_HISTORIAL,
): SemanaDelHistorial[] {
  const lunesDeHoy = lunesDeLaSemana(hoy)

  return Array.from({ length: cuantas }, (_, posicion) => {
    const lunes = sumarDias(lunesDeHoy, -7 * (cuantas - 1 - posicion))
    return semanaDelHistorial(habito, datos, hoy, lunes)
  })
}

function semanaDelHistorial(
  habito: Habito,
  datos: DatosDeRacha,
  hoy: Fecha,
  lunes: Fecha,
): SemanaDelHistorial {
  const clave = claveSemana(lunes)
  const dias = diasDeLaSemana(lunes).map((fecha) => ({
    fecha,
    estado: estadoDelDia(habito, datos, hoy, fecha),
  }))

  const guardada = datos.semanas.find((semana) => semana.id === `${habito.id}:${clave}`)
  const semanal = habito.tipo === 'positivo' && habito.cadencia === 'semanal'

  return {
    clave,
    lunes,
    etiqueta: diaYMesCorto(lunes),
    hechos: semanal ? (guardada?.hechos ?? hechosDeSemana(habito, clave, datos.registros)) : aFavor(dias),
    total: semanal ? (guardada?.objetivo ?? habito.objetivo ?? 0) : contados(dias),
    color: guardada?.color ?? null,
    comodin: comodinCubreSemana(datos.comodines, habito.id, clave),
    dias,
  }
}

/**
 * De qué color va un día.
 *
 * El orden importa: primero lo que quedó registrado —eso pasó y no se
 * reinterpreta—, luego el día de hoy, que se ve distinto porque todavía no se
 * juzga, y hasta el final lo que se deduce de la clase de hábito.
 */
function estadoDelDia(habito: Habito, datos: DatosDeRacha, hoy: Fecha, fecha: Fecha): EstadoDia {
  const registro = datos.registros.find(
    (candidato) => candidato.habitoId === habito.id && candidato.fecha === fecha,
  )

  if (registro?.estado === 'cumplido') return 'cumplido'
  if (registro?.estado === 'fallado') return habito.tipo === 'negativo' ? 'recaida' : 'fallado'

  if (fecha === hoy) return 'hoy'
  // Fuera de su vida: antes de su alta, o mientras estuvo archivado. Ni a favor
  // ni en contra, y sobre todo sin inventar fallas (sección 9).
  if (!cuentaElDia(habito, fecha, hoy)) return 'fuera'

  if (comodinCubreDia(datos.comodines, habito.id, fecha)) return 'comodin'
  // Un negativo está limpio mientras no haya registro: cuenta a favor solo.
  if (habito.tipo === 'negativo') return 'limpio'
  // Con cadencia semanal, un día sin marcar no es una falla: es un día libre y
  // nunca se pinta rojo (sección 6). Con cadencia diaria sí lo es.
  return habito.cadencia === 'semanal' ? 'libre' : 'fallado'
}

/** Los días de la semana que cuentan a favor: cumplidos, limpios o con comodín. */
function aFavor(dias: DiaDelMapa[]): number {
  return dias.filter((dia) => ['cumplido', 'limpio', 'comodin'].includes(dia.estado)).length
}

/** Los días de la semana que contaron, sean a favor o en contra. */
function contados(dias: DiaDelMapa[]): number {
  return dias.filter((dia) => !['fuera', 'hoy'].includes(dia.estado)).length
}
