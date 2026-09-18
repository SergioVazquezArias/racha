/**
 * Hacia dónde apuntan tus mediciones de verdad, que no es lo mismo que el plan.
 *
 * Con **seis mediciones o más** se traza la recta que mejor pasa por todas
 * ellas —mínimos cuadrados— y se prolonga hasta el valor objetivo para saber
 * qué día llegarías a este ritmo. Con menos de seis no se proyecta nada: dos o
 * tres pesadas seguidas no son una tendencia, son el desayuno.
 *
 * **El ajuste nocturno** (sección 11). El peso de la noche viene entre 0.5 y
 * 1.5 kg más alto que el de la mañana, así que meterlos juntos en la misma
 * recta la inclina hacia arriba sin que hayas engordado nada. Por eso a las
 * mediciones nocturnas se les restan 0.8 kg **para calcular la tendencia**, y
 * solo para eso: la curva que se dibuja en la gráfica usa siempre el número que
 * capturaste. El ajuste se avisa en pantalla con una línea de texto. Nada
 * oculto.
 *
 * El ajuste se aplica únicamente a metas medidas en kilos. En una meta de
 * puntaje de inglés la hora del día no cambia nada, y restarle 0.8 puntos a un
 * examen de la tarde sería un disparate.
 */

import { diasEntre, sumarDias } from './fechas'
import { campoPrincipal, valorPrincipal } from './metas'
import type { Fecha, Medicion, Meta } from '../tipos'

/** Cuántas mediciones hacen falta para poder proyectar (sección 11). */
export const MEDICIONES_MINIMAS = 6

/** Lo que se le resta a una pesada nocturna para calcular la tendencia. */
export const AJUSTE_NOCTURNO_KG = 0.8

/** A cuántos años vista dejamos de decir que llegas. Más allá, no llegas. */
const ANIOS_DE_PACIENCIA = 5

/** Si a esta meta le toca el ajuste nocturno: solo a las que se miden en kilos. */
export function ajustaLaNoche(meta: Meta): boolean {
  return meta.unidad === 'kg'
}

/** El valor que entra en la cuenta de la tendencia, ya ajustado si es de noche. */
export function valorAjustado(meta: Meta, medicion: Medicion): number | null {
  const valor = valorPrincipal(meta, medicion)
  if (valor === null) return null
  if (medicion.momento === 'noche' && ajustaLaNoche(meta)) return valor - AJUSTE_NOCTURNO_KG
  return valor
}

/** Cuántas mediciones se están ajustando ahora mismo. Cero si a la meta no le toca. */
export function nocturnasAjustadas(meta: Meta, mediciones: Medicion[]): number {
  if (!ajustaLaNoche(meta)) return 0

  const clave = campoPrincipal(meta)
  return mediciones.filter(
    (medicion) => medicion.momento === 'noche' && medicion.valores[clave] !== undefined,
  ).length
}

/** Una recta: `valor = ordenada + pendiente * días desde el inicio de la meta`. */
export interface Tendencia {
  /** Cuánto cambia el valor por día. Negativo si va bajando. */
  pendientePorDia: number
  ordenada: number
  /** Sobre cuántas mediciones se sacó. */
  puntos: number
}

/** La recta que mejor pasa por las mediciones, o `null` si no hay ni dos. */
export function tendenciaDe(meta: Meta, mediciones: Medicion[]): Tendencia | null {
  const puntos = mediciones
    .map((medicion) => ({
      dia: diasEntre(meta.fechaInicio, medicion.fecha),
      valor: valorAjustado(meta, medicion),
    }))
    .filter((punto): punto is { dia: number; valor: number } => punto.valor !== null)

  if (puntos.length < 2) return null

  const cuantos = puntos.length
  const mediaDia = puntos.reduce((suma, punto) => suma + punto.dia, 0) / cuantos
  const mediaValor = puntos.reduce((suma, punto) => suma + punto.valor, 0) / cuantos

  let arriba = 0
  let abajo = 0
  for (const punto of puntos) {
    arriba += (punto.dia - mediaDia) * (punto.valor - mediaValor)
    abajo += (punto.dia - mediaDia) ** 2
  }

  // Todas las mediciones el mismo día: no hay recta que trazar.
  if (abajo === 0) return null

  const pendientePorDia = arriba / abajo
  return { pendientePorDia, ordenada: mediaValor - pendientePorDia * mediaDia, puntos: cuantos }
}

export interface Proyeccion {
  /** Cuántas mediciones con valor hay. */
  mediciones: number
  /** Cuántas faltan para poder proyectar. Cero si ya se puede. */
  faltan: number
  /** Cuántas se ajustaron por ser de noche. */
  nocturnas: number
  /** A este ritmo, cuándo llegarías al objetivo. `null` si no llegas. */
  fechaLlegada: Fecha | null
  /** Días de diferencia contra la fecha objetivo. Positivo antes, negativo después. */
  diferenciaEnDias: number | null
  /** Si la tendencia lleva al objetivo alguna vez. */
  llegas: boolean
}

/** La proyección de una meta. Es lo que después se redacta en español. */
export function proyeccionDe(meta: Meta, mediciones: Medicion[], hoy: Fecha): Proyeccion {
  const conValor = mediciones.filter((medicion) => valorPrincipal(meta, medicion) !== null)
  const nocturnas = nocturnasAjustadas(meta, mediciones)
  const sinProyeccion = {
    mediciones: conValor.length,
    faltan: Math.max(0, MEDICIONES_MINIMAS - conValor.length),
    nocturnas,
    fechaLlegada: null,
    diferenciaEnDias: null,
    llegas: false,
  }

  if (conValor.length < MEDICIONES_MINIMAS) return sinProyeccion

  const recta = tendenciaDe(meta, conValor)
  if (recta === null) return sinProyeccion

  // Que la recta vaya para el lado correcto: bajando si hay que bajar.
  const vaBien = meta.direccion === 'bajar' ? recta.pendientePorDia < 0 : recta.pendientePorDia > 0
  if (!vaBien) return { ...sinProyeccion, faltan: 0 }

  const diaDeLlegada = Math.round((meta.valorObjetivo - recta.ordenada) / recta.pendientePorDia)
  const diaDeHoy = diasEntre(meta.fechaInicio, hoy)
  // Si la recta ya cruzó el objetivo pero el último número todavía no, lo más
  // honesto es decir «hoy», no una fecha que ya pasó.
  const fechaLlegada = sumarDias(meta.fechaInicio, Math.max(diaDeLlegada, diaDeHoy))
  const diferenciaEnDias = diasEntre(fechaLlegada, meta.fechaObjetivo)

  // Una pendiente casi plana da fechas de dentro de treinta años. Eso no es
  // llegar tarde, es no llegar.
  if (diferenciaEnDias < -365 * ANIOS_DE_PACIENCIA) return { ...sinProyeccion, faltan: 0 }

  return { mediciones: conValor.length, faltan: 0, nocturnas, fechaLlegada, diferenciaEnDias, llegas: true }
}
