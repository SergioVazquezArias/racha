/**
 * La pantalla de Estadísticas (sección 13 del documento de arquitectura).
 *
 * Tres cuentas que miran todos los hábitos a la vez, en lugar de uno por uno:
 * quién va mejor a 30 días, cuál es el mejor récord de la app, y qué días de la
 * semana se cumple más. Los patrones de recaída viven aparte, en `patrones.ts`.
 *
 * Nada de esto vuelve a calcular una racha ni un porcentaje: los pide a
 * `rachas.ts` y a `cumplimiento.ts`, que son los que saben hacerlo.
 *
 * Aquí no se decide qué nombre se enseña. Eso lo hace la pantalla llamando a
 * `mostrarNombre(habito)` **sin el interruptor**, así que en Estadísticas los
 * hábitos privados salen siempre con su alias (sección 8).
 */

import { cumplimientoDe } from './cumplimiento'
import { DIAS_DE_LA_SEMANA, diaDeLaSemana, sumarDias } from './fechas'
import { rachaDe } from './rachas'
import { cuentaElDia, inicioDeConteo } from './vida'
import type { Cumplimiento } from './cumplimiento'
import type { DatosDeRacha } from './rachas'
import type { Fecha, Habito, Registro } from '../tipos'

/** Cuántos días mira el patrón por día de la semana: doce semanas. */
export const DIAS_DEL_PATRON = 84

export interface FilaDeRanking {
  habito: Habito
  cumplimiento: Cumplimiento
}

/**
 * El ranking de cumplimiento a 30 días, del mejor al peor.
 *
 * Los hábitos demasiado nuevos para tener porcentaje se van al final, sin
 * número: todavía no hay nada que rankear, y ponerles un cero sería injusto.
 */
export function rankingA30Dias(habitos: Habito[], registros: Registro[], hoy: Fecha): FilaDeRanking[] {
  return habitos
    .map((habito) => ({ habito, cumplimiento: cumplimientoDe(habito, registros, hoy, 30) }))
    .sort((una, otra) => (otra.cumplimiento.porcentaje ?? -1) - (una.cumplimiento.porcentaje ?? -1))
}

export interface RachaGlobal {
  habito: Habito
  mejor: number
}

/**
 * La mejor racha de toda la app, con el hábito que la tiene.
 *
 * Mira la **mejor histórica**, no la de ahora: es un récord, y un récord no se
 * pierde porque esta semana vaya mal (sección 6).
 */
export function mejorRachaGlobal(habitos: Habito[], datos: DatosDeRacha, hoy: Fecha): RachaGlobal | null {
  let campeon: RachaGlobal | null = null

  for (const habito of habitos) {
    const mejor = rachaDe(habito, datos, hoy).mejor
    if (campeon === null || mejor > campeon.mejor) campeon = { habito, mejor }
  }

  return campeon !== null && campeon.mejor > 0 ? campeon : null
}

export interface DiaDelPatron {
  nombre: string
  cumplidos: number
  posibles: number
  /** De 0 a 100. `null` si ese día de la semana todavía no ha contado nunca. */
  porcentaje: number | null
}

/**
 * En qué días de la semana se cumple más, mirando las últimas doce semanas.
 *
 * Solo entran los hábitos positivos: son los que se marcan. Un negativo no se
 * «cumple» un martes, se deja de recaer, y eso ya lo cuentan los patrones de
 * recaída.
 *
 * De cada lunes que contó se mira si hubo marca o no. Los días anteriores al
 * alta del hábito, y los que pasó archivado, no entran por ningún lado.
 */
export function patronPorDiaDeSemana(
  habitos: Habito[],
  registros: Registro[],
  hoy: Fecha,
): DiaDelPatron[] {
  const cumplidos = new Array<number>(7).fill(0)
  const posibles = new Array<number>(7).fill(0)
  const desde = sumarDias(hoy, -DIAS_DEL_PATRON)

  for (const habito of habitos.filter((candidato) => candidato.tipo === 'positivo')) {
    const marcados = new Set(
      registros
        .filter((registro) => registro.habitoId === habito.id && registro.estado === 'cumplido')
        .map((registro) => registro.fecha),
    )

    const arranque = inicioDeConteo(habito) > desde ? inicioDeConteo(habito) : desde

    for (let dia = arranque; dia < hoy; dia = sumarDias(dia, 1)) {
      if (!cuentaElDia(habito, dia, hoy)) continue

      const posicion = diaDeLaSemana(dia)
      posibles[posicion] = (posibles[posicion] ?? 0) + 1
      if (marcados.has(dia)) cumplidos[posicion] = (cumplidos[posicion] ?? 0) + 1
    }
  }

  return DIAS_DE_LA_SEMANA.map((nombre, posicion) => {
    const hechos = cumplidos[posicion] ?? 0
    const cuantos = posibles[posicion] ?? 0
    return {
      nombre,
      cumplidos: hechos,
      posibles: cuantos,
      porcentaje: cuantos === 0 ? null : Math.round((hechos / cuantos) * 100),
    }
  })
}
