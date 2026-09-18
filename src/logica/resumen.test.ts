/**
 * Pruebas del resumen de la semana en curso (sección 13).
 *
 * La semana del jueves 17 de septiembre de 2026 empieza el lunes 14.
 */

import { describe, expect, it } from 'vitest'

import { marcasDeLaSemana } from './resumen'
import { cumplidos, habitoDiario, habitoNegativo, habitoSemanal, recaida } from './pruebas/fabricas'

const HOY = '2026-09-17'
const CREADO = '2026-01-01'

describe('las marcas de la semana en curso', () => {
  it('suma lo hecho y lo propuesto de todos los hábitos semanales', () => {
    const gym = habitoSemanal(CREADO, 5, 4, { id: 'gym' })
    const leer = habitoSemanal(CREADO, 6, 5, { id: 'leer' })
    const registros = [
      ...cumplidos('gym', ['2026-09-14', '2026-09-15', '2026-09-16']),
      ...cumplidos('leer', ['2026-09-14', '2026-09-15']),
    ]

    expect(marcasDeLaSemana([gym, leer], registros, HOY)).toEqual({ hechas: 5, objetivo: 11 })
  })

  it('no cuenta las marcas de semanas anteriores', () => {
    const gym = habitoSemanal(CREADO, 5, 4, { id: 'gym' })
    const registros = cumplidos('gym', ['2026-09-07', '2026-09-08', '2026-09-14'])

    expect(marcasDeLaSemana([gym], registros, HOY).hechas).toBe(1)
  })

  it('cuenta la marca de hoy en cuanto se palomea', () => {
    const gym = habitoSemanal(CREADO, 5, 4, { id: 'gym' })

    expect(marcasDeLaSemana([gym], cumplidos('gym', [HOY]), HOY).hechas).toBe(1)
  })

  it('deja fuera a los hábitos diarios y a los negativos', () => {
    const diario = habitoDiario(CREADO, { id: 'diario' })
    const negativo = habitoNegativo(CREADO, { id: 'sin-pantallas' })
    const registros = [...cumplidos('diario', ['2026-09-14']), recaida('sin-pantallas', '2026-09-15')]

    expect(marcasDeLaSemana([diario, negativo], registros, HOY)).toEqual({ hechas: 0, objetivo: 0 })
  })

  it('sin hábitos semanales devuelve ceros y no revienta', () => {
    expect(marcasDeLaSemana([], [], HOY)).toEqual({ hechas: 0, objetivo: 0 })
  })
})
