/**
 * Los tipos más pequeños: cómo se escriben un día, una semana y una hora.
 *
 * Toda fecha es una cadena `"YYYY-MM-DD"` en hora local (regla 2). Nunca UTC,
 * nunca un timestamp: un viaje a otro huso horario no debe alterar una racha.
 */

/** Fecha de un día, `"YYYY-MM-DD"` en hora local. */
export type Fecha = string

/** Identificador de semana ISO, `"2026-W38"`. */
export type ClaveSemana = string

/** Hora del día, `"HH:MM"` en hora local. */
export type Hora = string
