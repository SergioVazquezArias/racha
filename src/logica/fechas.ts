/**
 * Manejo de fechas del proyecto.
 *
 * Regla 2: un día se identifica siempre con la cadena `"YYYY-MM-DD"` en hora
 * local. Aquí no se usa UTC ni timestamps en ningún momento, para que cambiar
 * de huso horario no mueva ninguna racha.
 *
 * La semana empieza en lunes, como dice Ajustes.
 */

import { addDays, format, getISOWeek, getISOWeekYear, startOfISOWeek } from 'date-fns'

import type { ClaveSemana, Fecha } from '../tipos'

/** Convierte una fecha de JavaScript a `"YYYY-MM-DD"`, en hora local. */
export function aFecha(fecha: Date): Fecha {
  return format(fecha, 'yyyy-MM-dd')
}

/**
 * Convierte `"YYYY-MM-DD"` a una fecha de JavaScript situada al mediodía local.
 *
 * El mediodía, y no la medianoche, para que los cambios de horario de verano
 * —que mueven el reloj una hora— nunca empujen el día al anterior.
 */
export function deFecha(fecha: Fecha): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(anio ?? 0, (mes ?? 1) - 1, dia ?? 1, 12, 0, 0, 0)
}

/** El día de hoy según el reloj del teléfono. */
export function hoy(): Fecha {
  return aFecha(new Date())
}

/** Suma (o resta, con número negativo) días a una fecha. */
export function sumarDias(fecha: Fecha, dias: number): Fecha {
  return aFecha(addDays(deFecha(fecha), dias))
}

/** El lunes de la semana a la que pertenece la fecha. */
export function lunesDeLaSemana(fecha: Fecha): Fecha {
  return aFecha(startOfISOWeek(deFecha(fecha)))
}

/** La clave de semana ISO de una fecha: `"2026-W38"`. */
export function claveSemana(fecha: Fecha): ClaveSemana {
  const dia = deFecha(fecha)
  const semana = String(getISOWeek(dia)).padStart(2, '0')
  return `${getISOWeekYear(dia)}-W${semana}`
}

/** Los siete días de la semana a la que pertenece la fecha, de lunes a domingo. */
export function diasDeLaSemana(fecha: Fecha): Fecha[] {
  const lunes = lunesDeLaSemana(fecha)
  return [0, 1, 2, 3, 4, 5, 6].map((desplazamiento) => sumarDias(lunes, desplazamiento))
}

/** Cuántos días hay entre dos fechas. Positivo si la segunda es posterior. */
export function diasEntre(desde: Fecha, hasta: Fecha): number {
  const milisegundosPorDia = 24 * 60 * 60 * 1000
  const diferencia = deFecha(hasta).getTime() - deFecha(desde).getTime()
  return Math.round(diferencia / milisegundosPorDia)
}
