/**
 * El estado de una meta: dónde deberías ir según el plan y dónde vas de verdad.
 *
 * La **recta del plan** es la línea que une el valor inicial con el objetivo
 * (sección 11). No es una predicción, es la referencia contra la que se compara
 * cada medición: el 15 de septiembre toca 80 kg, el 14 de abril tocan 72, y
 * cualquier día de en medio toca lo que caiga sobre esa recta. La predicción
 * —hacia dónde apuntan tus mediciones de verdad— vive aparte, en `tendencia.ts`.
 *
 * El **campo principal** de una meta es el primero de su lista: `peso` en la
 * meta de peso, `puntaje` en la de inglés. Los demás campos se capturan, se
 * guardan y se usan para otras cosas —la cintura y el cuello estiman la grasa—
 * pero no son los que la meta persigue.
 */

import { diasEntre, sumarDias } from './fechas'
import type { Fecha, Medicion, Meta } from '../tipos'

/** La clave del campo que la meta persigue: el primero de su lista. */
export function campoPrincipal(meta: Meta): string {
  return meta.campos[0]?.clave ?? ''
}

/** Las mediciones, de la más vieja a la más reciente. */
export function ordenadas(mediciones: Medicion[]): Medicion[] {
  return [...mediciones].sort((una, otra) => una.fecha.localeCompare(otra.fecha))
}

/**
 * El valor del campo principal en una medición, o `null` si esa medición no lo
 * trae.
 *
 * Puede faltar de verdad: una medición donde solo se anotó la cintura es
 * válida y se guarda igual. Lo que no se vale es inventarle un peso.
 */
export function valorPrincipal(meta: Meta, medicion: Medicion): number | null {
  return medicion.valores[campoPrincipal(meta)] ?? null
}

/** La medición más reciente que trae el campo principal. */
export function ultimaConValor(meta: Meta, mediciones: Medicion[]): Medicion | null {
  const conValor = ordenadas(mediciones).filter((medicion) => valorPrincipal(meta, medicion) !== null)
  return conValor.at(-1) ?? null
}

/**
 * Dónde debería ir la meta en una fecha, según la recta del plan.
 *
 * Antes de empezar vale el valor inicial y después de la fecha objetivo vale el
 * objetivo: la recta no se prolonga hacia ningún lado, porque fuera del plan no
 * hay plan.
 */
export function valorPlaneado(meta: Meta, fecha: Fecha): number {
  const total = diasEntre(meta.fechaInicio, meta.fechaObjetivo)
  if (total <= 0) return meta.valorObjetivo

  const transcurridos = diasEntre(meta.fechaInicio, fecha)
  const avance = Math.min(1, Math.max(0, transcurridos / total))
  return meta.valorInicial + (meta.valorObjetivo - meta.valorInicial) * avance
}

/**
 * Las cuatro esquinas de una meta: de dónde sale, a dónde va y entre qué fechas.
 *
 * Una `Meta` entera las cumple, y también el formulario a medio llenar, que es
 * quien lo necesita para colocar un hito antes de que la meta exista.
 */
export interface PlanDeMeta {
  fechaInicio: Fecha
  fechaObjetivo: Fecha
  valorInicial: number
  valorObjetivo: number
}

/** En qué fecha la recta del plan pasa por un valor. Sirve para fechar un hito. */
export function fechaPlaneadaPara(plan: PlanDeMeta, valor: number): Fecha {
  const recorrido = plan.valorObjetivo - plan.valorInicial
  if (recorrido === 0) return plan.fechaObjetivo

  const total = diasEntre(plan.fechaInicio, plan.fechaObjetivo)
  const avance = Math.min(1, Math.max(0, (valor - plan.valorInicial) / recorrido))
  return sumarDias(plan.fechaInicio, Math.round(total * avance))
}

/** Si un valor ya alcanzó el objetivo, según se baje o se suba. */
export function alcanzado(meta: Meta, valor: number): boolean {
  return meta.direccion === 'bajar' ? valor <= meta.valorObjetivo : valor >= meta.valorObjetivo
}

export interface ProgresoDeMeta {
  /** El valor más reciente del campo principal. `null` si todavía no hay ninguno. */
  valorActual: number | null
  fechaDelValor: Fecha | null
  /** Lo que tocaría hoy según la recta del plan. */
  planDeHoy: number
  /**
   * Cuánto le ganas al plan, en la unidad de la meta. Positivo vas adelante,
   * negativo vas atrás. `null` mientras no haya ninguna medición.
   */
  ventaja: number | null
  /** Cuánto falta para el objetivo. Cero si ya se alcanzó. */
  restante: number | null
  /** De 0 a 100, cuánto del camino llevas andado. */
  avance: number | null
  /** Si el valor de hoy ya alcanzó el objetivo. */
  logrado: boolean
}

/** Todo lo que el renglón de la lista y la cabecera del detalle necesitan saber. */
export function progresoDe(meta: Meta, mediciones: Medicion[], hoy: Fecha): ProgresoDeMeta {
  const planDeHoy = valorPlaneado(meta, hoy)
  const ultima = ultimaConValor(meta, mediciones)
  const valorActual = ultima === null ? null : valorPrincipal(meta, ultima)

  if (ultima === null || valorActual === null) {
    return {
      valorActual: null,
      fechaDelValor: null,
      planDeHoy,
      ventaja: null,
      restante: null,
      avance: null,
      logrado: false,
    }
  }

  const signo = meta.direccion === 'bajar' ? -1 : 1
  const recorrido = meta.valorObjetivo - meta.valorInicial
  const andado = valorActual - meta.valorInicial

  return {
    valorActual,
    fechaDelValor: ultima.fecha,
    planDeHoy,
    ventaja: redondear((valorActual - planDeHoy) * signo),
    restante: alcanzado(meta, valorActual) ? 0 : redondear(Math.abs(meta.valorObjetivo - valorActual)),
    avance: recorrido === 0 ? 100 : Math.round(Math.min(100, Math.max(0, (andado / recorrido) * 100))),
    logrado: alcanzado(meta, valorActual),
  }
}

/** Dos decimales, que es todo lo que significan un kilo o un punto. */
function redondear(numero: number): number {
  return Math.round(numero * 100) / 100
}
