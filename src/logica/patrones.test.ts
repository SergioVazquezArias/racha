/**
 * Pruebas de los patrones de recaída (sección 10).
 *
 * El ejemplo del documento —«el 71 % de tus recaídas son viernes o sábado»— es
 * el que se comprueba aquí tal cual, con las fechas que lo producen.
 */

import { describe, expect, it } from 'vitest'

import {
  fraseDeLosDias,
  recaidasDe,
  recaidasPorContexto,
  recaidasPorDia,
  recaidasPorHora,
} from './patrones'
import { cumplidos, habitoDiario, habitoNegativo, recaida } from './pruebas/fabricas'
import type { Registro } from '../tipos'

/** Una recaída con su hora y su contexto. */
function conContexto(fecha: string, hora: string, contexto: string | null): Registro {
  return { ...recaida('postre', fecha, hora), contexto }
}

describe('qué cuenta como recaída', () => {
  it('solo los registros fallados de hábitos negativos', () => {
    const negativo = habitoNegativo('2026-01-01', { id: 'postre' })
    const positivo = habitoDiario('2026-01-01', { id: 'gym' })
    const registros = [recaida('postre', '2026-09-11'), ...cumplidos('gym', ['2026-09-11'])]

    expect(recaidasDe([negativo, positivo], registros)).toHaveLength(1)
  })
})

describe('recaídas por día de la semana', () => {
  // Siete recaídas: cinco en viernes o sábado, dos entre semana.
  const registros = [
    recaida('postre', '2026-09-04'), // viernes
    recaida('postre', '2026-09-05'), // sábado
    recaida('postre', '2026-09-11'), // viernes
    recaida('postre', '2026-09-12'), // sábado
    recaida('postre', '2026-09-08'), // martes
    recaida('postre', '2026-09-09'), // miércoles
    recaida('postre', '2026-09-18'), // viernes
  ]

  it('siempre trae los siete días, aunque alguno vaya en cero', () => {
    const porDia = recaidasPorDia(registros)

    expect(porDia).toHaveLength(7)
    expect(porDia[0]?.etiqueta).toBe('lunes')
    expect(porDia[0]?.cuenta).toBe(0)
  })

  it('cuenta cada día en su lugar', () => {
    const porDia = recaidasPorDia(registros)

    expect(porDia[4]?.etiqueta).toBe('viernes')
    expect(porDia[4]?.cuenta).toBe(3)
    expect(porDia[5]?.cuenta).toBe(2)
  })

  it('lo dice en una frase, como en el documento', () => {
    expect(fraseDeLosDias(recaidasPorDia(registros))).toBe(
      'El 71 % de tus recaídas son viernes o sábado.',
    )
  })

  it('nombra los dos días en el orden de la semana, no por cuál pesa más', () => {
    // Dos viernes, dos lunes y un miércoles: ningún día llega solo a la mitad,
    // pero los dos peores juntan el 80 %.
    const lunesYViernes = [
      recaida('postre', '2026-09-04'),
      recaida('postre', '2026-09-11'),
      recaida('postre', '2026-09-07'),
      recaida('postre', '2026-09-14'),
      recaida('postre', '2026-09-09'),
    ]

    expect(fraseDeLosDias(recaidasPorDia(lunesYViernes))).toContain('lunes o viernes')
  })

  it('no dice nada cuando hay muy pocas recaídas para hablar de un patrón', () => {
    const pocas = [recaida('postre', '2026-09-04'), recaida('postre', '2026-09-05')]

    expect(fraseDeLosDias(recaidasPorDia(pocas))).toBe(null)
    expect(fraseDeLosDias(recaidasPorDia([]))).toBe(null)
  })

  it('no dice nada cuando están repartidas por toda la semana', () => {
    const parejas = [
      recaida('postre', '2026-09-07'),
      recaida('postre', '2026-09-08'),
      recaida('postre', '2026-09-09'),
      recaida('postre', '2026-09-10'),
      recaida('postre', '2026-09-11'),
      recaida('postre', '2026-09-12'),
      recaida('postre', '2026-09-13'),
    ]

    expect(fraseDeLosDias(recaidasPorDia(parejas))).toBe(null)
  })
})

describe('recaídas por hora', () => {
  const registros = [
    conContexto('2026-09-04', '21:30', null),
    conContexto('2026-09-05', '23:00', null),
    conContexto('2026-09-06', '14:00', null),
    { ...recaida('postre', '2026-09-07'), hora: null },
  ]

  it('las reparte en las cuatro franjas del día', () => {
    const porHora = recaidasPorHora(registros)

    expect(porHora.map((franja) => franja.cuenta)).toEqual([0, 0, 1, 2])
  })

  it('no inventa hora a las que se guardaron sin ella', () => {
    const porHora = recaidasPorHora(registros)
    const total = porHora.reduce((suma, franja) => suma + franja.cuenta, 0)

    expect(total).toBe(3)
    // Los porcentajes se sacan sobre las tres que sí traen hora, no sobre cuatro.
    expect(porHora[3]?.porcentaje).toBe(67)
  })
})

describe('recaídas por contexto', () => {
  const registros = [
    conContexto('2026-09-04', '21:00', 'con amigos'),
    conContexto('2026-09-05', '21:00', 'con amigos'),
    conContexto('2026-09-06', '21:00', 'estrés'),
    conContexto('2026-09-07', '21:00', null),
  ]

  it('van del más común al menos común', () => {
    const porContexto = recaidasPorContexto(registros)

    expect(porContexto[0]?.etiqueta).toBe('con amigos')
    expect(porContexto[0]?.cuenta).toBe(2)
    expect(porContexto[0]?.porcentaje).toBe(50)
  })

  it('las que no tienen contexto se juntan en su propia fila', () => {
    const porContexto = recaidasPorContexto(registros)

    expect(porContexto.map((fila) => fila.etiqueta)).toContain('sin contexto')
  })
})
