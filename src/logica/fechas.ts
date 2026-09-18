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
import { es } from 'date-fns/locale'

import type { ClaveSemana, Fecha, Hora } from '../tipos'

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

/** Los siete días de la semana, en orden y en español. La semana empieza en lunes. */
export const DIAS_DE_LA_SEMANA = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]

/**
 * Qué día de la semana cae una fecha: 0 el lunes, 6 el domingo.
 *
 * El `getDay()` de JavaScript pone el domingo en 0; este lo corre para que la
 * semana empiece en lunes, como dice Ajustes y como se ven todas las semanas
 * de la app.
 */
export function diaDeLaSemana(fecha: Fecha): number {
  return (deFecha(fecha).getDay() + 6) % 7
}

/** Una fecha corta para los ejes de las gráficas: `"15 sept"`. */
export function diaYMesCorto(fecha: Fecha): string {
  return format(deFecha(fecha), 'd MMM', { locale: es })
}

/** Cuántos días hay entre dos fechas. Positivo si la segunda es posterior. */
export function diasEntre(desde: Fecha, hasta: Fecha): number {
  const milisegundosPorDia = 24 * 60 * 60 * 1000
  const diferencia = deFecha(hasta).getTime() - deFecha(desde).getTime()
  return Math.round(diferencia / milisegundosPorDia)
}

/**
 * La hora del reloj del teléfono, `"HH:MM"`.
 *
 * La usa el registro de recaídas, que pone la hora solo (sección 10). Es lo
 * único de este archivo que mira el reloj además de `hoy()`.
 */
export function horaActual(): Hora {
  return format(new Date(), 'HH:mm')
}

/** Una fecha escrita en palabras: `"miércoles 17 de septiembre"`. */
export function fechaEnPalabras(fecha: Fecha): string {
  return conMayuscula(format(deFecha(fecha), "EEEE d 'de' MMMM", { locale: es }))
}

/**
 * El rango de la semana en palabras, para el encabezado del resumen.
 *
 * Si la semana no cambia de mes dice `"15 al 21 de septiembre"`; si lo cruza,
 * nombra los dos meses: `"29 de septiembre al 5 de octubre"`.
 */
export function semanaEnPalabras(fecha: Fecha): string {
  const dias = diasDeLaSemana(fecha)
  const lunes = deFecha(dias[0] ?? fecha)
  const domingo = deFecha(dias[6] ?? fecha)
  const mismoMes = format(lunes, 'yyyy-MM') === format(domingo, 'yyyy-MM')
  const inicio = mismoMes ? format(lunes, 'd') : format(lunes, "d 'de' MMMM", { locale: es })
  return `${inicio} al ${format(domingo, "d 'de' MMMM", { locale: es })}`
}

/** Pone en mayúscula la primera letra. `date-fns` devuelve los días en minúscula. */
function conMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
