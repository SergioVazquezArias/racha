/**
 * Pruebas de lo que revisa el formulario antes de guardar un hábito.
 *
 * Son pocas y aburridas a propósito: lo que se comprueba es que no deje pasar
 * un hábito que después no se podría calcular, y que no estorbe con lo demás.
 */

import { describe, expect, it } from 'vitest'

import { problemasDe } from './validacion'
import type { CamposDeHabito } from './altas'

function campos(cambios: Partial<CamposDeHabito> = {}): CamposDeHabito {
  return {
    nombre: 'Ir al gym',
    icono: '🏋️',
    privado: false,
    alias: null,
    tipo: 'positivo',
    cadencia: 'semanal',
    objetivo: 5,
    minimo: 4,
    permiteComodin: true,
    contextos: [],
    ...cambios,
  }
}

describe('lo que no deja guardar', () => {
  it('un hábito sin nombre', () => {
    expect(problemasDe(campos({ nombre: '   ' }))).toContain('Ponle un nombre.')
  })

  it('un hábito privado sin alias', () => {
    const problemas = problemasDe(campos({ privado: true, alias: null }))

    expect(problemas).toHaveLength(1)
    expect(problemas[0]).toContain('alias')
  })

  it('un mínimo mayor que el objetivo', () => {
    expect(problemasDe(campos({ objetivo: 3, minimo: 5 }))).toEqual([
      'El mínimo no puede ser mayor que el objetivo.',
    ])
  })

  it('un objetivo fuera de los siete días de la semana', () => {
    expect(problemasDe(campos({ objetivo: 0 }))).toHaveLength(1)
    expect(problemasDe(campos({ objetivo: 8 }))).toHaveLength(1)
  })
})

describe('lo que sí deja guardar', () => {
  it('un hábito semanal con sus dos números en orden', () => {
    expect(problemasDe(campos())).toEqual([])
  })

  it('un hábito diario, que no lleva objetivo ni mínimo', () => {
    expect(problemasDe(campos({ cadencia: 'diaria', objetivo: null, minimo: null }))).toEqual([])
  })

  it('un hábito negativo sin contextos: son opcionales', () => {
    expect(problemasDe(campos({ tipo: 'negativo', cadencia: 'diaria', objetivo: null, minimo: null }))).toEqual([])
  })

  it('un hábito privado con alias', () => {
    expect(problemasDe(campos({ privado: true, alias: 'Rutina' }))).toEqual([])
  })
})
