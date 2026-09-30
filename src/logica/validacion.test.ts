/**
 * Pruebas de lo que revisa el formulario antes de guardar un hábito.
 *
 * Son pocas y aburridas a propósito: lo que se comprueba es que no deje pasar
 * un hábito que después no se podría calcular, y que no estorbe con lo demás.
 */

import { describe, expect, it } from 'vitest'

import { problemasDe } from './validacion'
import type { CamposDeHabito } from './altas'

/** Jueves 17 de septiembre de 2026. */
const HOY = '2026-09-17'

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
    creadoEn: HOY,
    ...cambios,
  }
}

describe('lo que no deja guardar', () => {
  it('un hábito sin nombre', () => {
    expect(problemasDe(campos({ nombre: '   ' }), HOY)).toContain('Ponle un nombre.')
  })

  it('un hábito privado sin alias', () => {
    const problemas = problemasDe(campos({ privado: true, alias: null }), HOY)

    expect(problemas).toHaveLength(1)
    expect(problemas[0]).toContain('alias')
  })

  it('un mínimo mayor que el objetivo', () => {
    expect(problemasDe(campos({ objetivo: 3, minimo: 5 }), HOY)).toEqual([
      'El mínimo no puede ser mayor que el objetivo.',
    ])
  })

  it('un objetivo fuera de los siete días de la semana', () => {
    expect(problemasDe(campos({ objetivo: 0 }), HOY)).toHaveLength(1)
    expect(problemasDe(campos({ objetivo: 8 }), HOY)).toHaveLength(1)
  })

  it('un hábito que empieza mañana', () => {
    expect(problemasDe(campos({ creadoEn: '2026-09-18' }), HOY)).toEqual([
      'La fecha desde la que lo llevas no puede ser en el futuro.',
    ])
  })

  it('un hábito que dice llevarse desde hace más de un año', () => {
    // El tope no es una regla de la app: es un cerrojo contra el dedo gordo en
    // la rueda de fechas del iPhone.
    expect(problemasDe(campos({ creadoEn: '2025-09-16' }), HOY)).toEqual([
      'La fecha desde la que lo llevas no puede ser de hace más de un año.',
    ])
  })

  it('un hábito al que se le borró la fecha', () => {
    expect(problemasDe(campos({ creadoEn: '' }), HOY)).toEqual([
      'Ponle la fecha desde la que lo llevas.',
    ])
  })
})

describe('lo que sí deja guardar', () => {
  it('un hábito semanal con sus dos números en orden', () => {
    expect(problemasDe(campos(), HOY)).toEqual([])
  })

  it('un hábito diario, que no lleva objetivo ni mínimo', () => {
    expect(problemasDe(campos({ cadencia: 'diaria', objetivo: null, minimo: null }), HOY)).toEqual([])
  })

  it('un hábito negativo sin contextos: son opcionales', () => {
    expect(problemasDe(campos({ tipo: 'negativo', cadencia: 'diaria', objetivo: null, minimo: null }), HOY)).toEqual([])
  })

  it('un hábito privado con alias', () => {
    expect(problemasDe(campos({ privado: true, alias: 'Rutina' }), HOY)).toEqual([])
  })

  it('un hábito que se lleva desde hace meses', () => {
    expect(problemasDe(campos({ creadoEn: '2026-06-01' }), HOY)).toEqual([])
  })

  it('un hábito que se lleva desde hace justo un año: el tope entra', () => {
    expect(problemasDe(campos({ creadoEn: '2025-09-17' }), HOY)).toEqual([])
  })
})
