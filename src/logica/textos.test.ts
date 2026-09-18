/**
 * Pruebas de los textos de pantalla (reglas 1 y 10).
 *
 * Se prueban dos cosas: que los plurales estén bien escritos en español y que
 * ningún texto de un hábito negativo lleve lenguaje de juicio (sección 10).
 */

import { describe, expect, it } from 'vitest'

import { pluralizar, textoDeComodines, textoDeRacha, textoDeSemana, textoDiasLimpios } from './textos'
import { habitoDiario, habitoSemanal } from './pruebas/fabricas'

describe('los plurales', () => {
  it('usa el singular con uno', () => {
    expect(pluralizar(1, 'semana', 'semanas')).toBe('1 semana')
  })

  it('usa el plural con cero y con varios', () => {
    expect(pluralizar(0, 'día', 'días')).toBe('0 días')
    expect(pluralizar(4, 'día', 'días')).toBe('4 días')
  })
})

describe('el texto de una racha', () => {
  it('un hábito semanal cuenta semanas', () => {
    expect(textoDeRacha(habitoSemanal('2026-01-01', 5, 4), 3)).toBe('racha de 3 semanas')
  })

  it('un hábito diario cuenta días', () => {
    expect(textoDeRacha(habitoDiario('2026-01-01'), 12)).toBe('racha de 12 días')
  })

  it('con una sola semana no dice "1 semanas"', () => {
    expect(textoDeRacha(habitoSemanal('2026-01-01', 5, 4), 1)).toBe('racha de 1 semana')
  })

  it('en cero no regaña: solo dice que todavía no hay racha', () => {
    expect(textoDeRacha(habitoDiario('2026-01-01'), 0)).toBe('sin racha todavía')
  })
})

describe('el progreso de la semana', () => {
  it('se lee como "3 de 5 esta semana"', () => {
    expect(textoDeSemana(3, 5)).toBe('3 de 5 esta semana')
  })
})

describe('el contador de un hábito negativo', () => {
  it('dice "día limpio" con uno y "días limpios" con varios', () => {
    expect(textoDiasLimpios(1)).toBe('día limpio')
    expect(textoDiasLimpios(21)).toBe('días limpios')
  })

  it('en cero sigue siendo neutral, sin lenguaje de juicio', () => {
    expect(textoDiasLimpios(0)).toBe('días limpios')
  })
})

describe('los comodines del mes', () => {
  it('nombra el que queda en singular', () => {
    expect(textoDeComodines(1)).toBe('1 comodín disponible')
  })

  it('lo dice sin drama cuando ya no quedan', () => {
    expect(textoDeComodines(0)).toBe('sin comodines este mes')
  })
})
