/**
 * Pruebas del nombre visible de un hábito (sección 8).
 *
 * Lo que se cuida aquí es que un nombre privado no se escape nunca por la
 * pantalla, ni siquiera por un dato mal escrito.
 */

import { describe, expect, it } from 'vitest'

import { PUNTO_DISCRETO, mostrarIcono, mostrarNombre } from './nombres'
import { habitoDiario, habitoNegativo } from './pruebas/fabricas'

const CREADO = '2026-09-01'

describe('el nombre visible de un hábito', () => {
  it('un hábito normal muestra su nombre real', () => {
    const habito = habitoDiario(CREADO, { nombre: 'Ir al gym' })

    expect(mostrarNombre(habito)).toBe('Ir al gym')
  })

  it('un hábito privado muestra su alias y nunca su nombre real', () => {
    const habito = habitoNegativo(CREADO, {
      nombre: 'Nombre real',
      alias: 'Hábito privado 1',
      privado: true,
    })

    expect(mostrarNombre(habito)).toBe('Hábito privado 1')
    expect(mostrarNombre(habito)).not.toBe('Nombre real')
  })

  it('un hábito privado sin alias tampoco delata su nombre real', () => {
    const habito = habitoNegativo(CREADO, { nombre: 'Nombre real', alias: null, privado: true })

    expect(mostrarNombre(habito)).toBe('Hábito privado')
  })
})

describe('el ícono visible de un hábito', () => {
  it('un hábito normal muestra su emoji', () => {
    const habito = habitoDiario(CREADO, { icono: '🏋️' })

    expect(mostrarIcono(habito)).toBe('🏋️')
  })

  it('un hábito privado muestra un punto, aunque tenga un emoji guardado', () => {
    const habito = habitoNegativo(CREADO, { icono: '📱', privado: true })

    expect(mostrarIcono(habito)).toBe(PUNTO_DISCRETO)
  })
})
