/**
 * Pruebas de los textos de pantalla (reglas 1 y 10).
 *
 * Se prueban dos cosas: que los plurales estén bien escritos en español y que
 * ningún texto de un hábito negativo lleve lenguaje de juicio (sección 10).
 */

import { describe, expect, it } from 'vitest'

import {
  pluralizar,
  textoDeComodines,
  textoDeNegativo,
  textoDeRacha,
  textoDeSemana,
  textoDiasLimpios,
  unidadDeRacha,
} from './textos'
import { habitoDiario, habitoSemanal, recaida } from './pruebas/fabricas'

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

describe('el renglón chico de un hábito negativo', () => {
  it('si hubo recaída hoy, dice la hora y el contexto', () => {
    const registro = { ...recaida('sin-pantallas', '2026-09-18', '21:40'), contexto: 'estrés' }

    expect(textoDeNegativo(0, 16, registro)).toBe('hoy 21:40 · estrés')
  })

  it('una recaída sin contexto solo dice la hora', () => {
    expect(textoDeNegativo(0, 16, recaida('sin-pantallas', '2026-09-18', '19:15'))).toBe('hoy 19:15')
  })

  it('en un día limpio enseña el récord, si hay uno mejor', () => {
    expect(textoDeNegativo(13, 16, undefined)).toBe('mejor: 16 días')
  })

  it('cuando el contador de ahora es el récord, lo dice', () => {
    expect(textoDeNegativo(20, 20, undefined)).toBe('tu mejor racha hasta ahora')
  })

  it('un hábito recién creado dice que hoy empieza a contar', () => {
    expect(textoDeNegativo(0, 0, undefined)).toBe('empieza a contar hoy')
  })

  it('ninguna de las frases lleva lenguaje de juicio', () => {
    const frases = [
      textoDeNegativo(0, 16, recaida('sin-pantallas', '2026-09-18')),
      textoDeNegativo(13, 16, undefined),
      textoDeNegativo(20, 20, undefined),
      textoDeNegativo(0, 0, undefined),
    ]
    const prohibidas = ['lástima', 'fallaste', 'perdiste', 'mal', 'recaíste', '😔', '😢']

    for (const frase of frases) {
      for (const palabra of prohibidas) expect(frase).not.toContain(palabra)
    }
  })
})

describe('la unidad de una racha', () => {
  it('cuenta días en un hábito diario y semanas en uno semanal', () => {
    const diario = habitoDiario('2026-01-01')
    const semanal = habitoSemanal('2026-01-01', 5, 4)

    expect(unidadDeRacha(diario, 3)).toBe('días')
    expect(unidadDeRacha(diario, 1)).toBe('día')
    expect(unidadDeRacha(semanal, 3)).toBe('semanas')
    expect(unidadDeRacha(semanal, 1)).toBe('semana')
  })
})
