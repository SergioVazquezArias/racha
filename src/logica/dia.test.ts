/**
 * Pruebas de lo que pasó hoy con un hábito (secciones 4 y 5).
 */

import { describe, expect, it } from 'vitest'

import { estaMarcado, idDeRegistro, recaidaDelDia } from './dia'
import { cumplido, recaida } from './pruebas/fabricas'

const HOY = '2026-09-17'
const AYER = '2026-09-16'

describe('el nombre del registro de un día', () => {
  it('junta el hábito y la fecha, para que un día no se pueda duplicar', () => {
    expect(idDeRegistro('gym', HOY)).toBe('gym:2026-09-17')
  })
})

describe('¿ya se marcó hoy?', () => {
  it('sí, cuando hay un registro cumplido de hoy', () => {
    expect(estaMarcado('gym', [cumplido('gym', HOY)], HOY)).toBe(true)
  })

  it('no, cuando el registro cumplido es de ayer', () => {
    expect(estaMarcado('gym', [cumplido('gym', AYER)], HOY)).toBe(false)
  })

  it('no confunde el registro de otro hábito', () => {
    expect(estaMarcado('gym', [cumplido('leer', HOY)], HOY)).toBe(false)
  })

  it('una recaída no cuenta como marcado', () => {
    expect(estaMarcado('sin-pantallas', [recaida('sin-pantallas', HOY)], HOY)).toBe(false)
  })
})

describe('la recaída del día', () => {
  it('devuelve el registro con su hora, para poder enseñarla', () => {
    const registros = [recaida('sin-pantallas', HOY, '21:40')]

    expect(recaidaDelDia('sin-pantallas', registros, HOY)?.hora).toBe('21:40')
  })

  it('no devuelve nada en un día limpio', () => {
    expect(recaidaDelDia('sin-pantallas', [], HOY)).toBeUndefined()
  })

  it('no devuelve la recaída de ayer', () => {
    expect(recaidaDelDia('sin-pantallas', [recaida('sin-pantallas', AYER)], HOY)).toBeUndefined()
  })
})
