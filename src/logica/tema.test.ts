/**
 * Pruebas del tema (claro, oscuro o como el sistema).
 *
 * Son cuatro líneas de lógica, pero equivocarse aquí deja la app en blanco
 * sobre blanco o en negro sobre negro, que es la única falla que impide usarla.
 */

import { describe, expect, it } from 'vitest'

import { esOscuro, OPCIONES_DE_TEMA } from './tema'

describe('qué tema se ve', () => {
  it('claro es claro, aunque el teléfono esté en oscuro', () => {
    expect(esOscuro('claro', true)).toBe(false)
  })

  it('oscuro es oscuro, aunque el teléfono esté en claro', () => {
    expect(esOscuro('oscuro', false)).toBe(true)
  })

  it('«sistema» hace caso al teléfono', () => {
    expect(esOscuro('sistema', true)).toBe(true)
    expect(esOscuro('sistema', false)).toBe(false)
  })
})

describe('el selector de Ajustes', () => {
  it('ofrece las tres opciones', () => {
    expect(OPCIONES_DE_TEMA.map((opcion) => opcion.valor)).toEqual(['claro', 'oscuro', 'sistema'])
  })
})
