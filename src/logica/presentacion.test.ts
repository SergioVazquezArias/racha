/**
 * Pruebas de los textos de fecha que se leen en pantalla.
 *
 * Son cosméticos, pero se prueban igual porque el idioma importa: la app está
 * en español y una fecha en inglés se notaría de inmediato (regla 1).
 */

import { describe, expect, it } from 'vitest'

import { fechaEnPalabras, horaActual, semanaEnPalabras } from './fechas'

describe('una fecha escrita en palabras', () => {
  it('nombra el día de la semana y el mes en español', () => {
    expect(fechaEnPalabras('2026-09-17')).toBe('Jueves 17 de septiembre')
  })

  it('empieza con mayúscula', () => {
    expect(fechaEnPalabras('2026-09-14').startsWith('Lunes')).toBe(true)
  })
})

describe('el rango de una semana', () => {
  it('nombra el mes una sola vez cuando la semana no lo cruza', () => {
    expect(semanaEnPalabras('2026-09-17')).toBe('14 al 20 de septiembre')
  })

  it('nombra los dos meses cuando la semana cruza de mes', () => {
    expect(semanaEnPalabras('2026-10-01')).toBe('28 de septiembre al 4 de octubre')
  })

  it('da el mismo rango para cualquier día de la misma semana', () => {
    expect(semanaEnPalabras('2026-09-14')).toBe(semanaEnPalabras('2026-09-20'))
  })
})

describe('la hora automática de una recaída', () => {
  it('se escribe como "HH:MM", con dos dígitos cada uno', () => {
    expect(horaActual()).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/)
  })
})
