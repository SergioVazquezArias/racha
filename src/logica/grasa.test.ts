/**
 * Pruebas de la grasa corporal estimada.
 *
 * Lo importante no es clavar el decimal —es una estimación— sino que el número
 * caiga donde tiene que caer para un hombre de 175 cm con 94 de cintura, y
 * sobre todo que **cuando falta una medida no se invente nada**: de vuelta
 * `null`, y la pantalla no enseña el dato.
 */

import { describe, expect, it } from 'vitest'

import { grasaDeMedicion, grasaEstimada, midePorcentajeDeGrasa } from './grasa'
import { medicion } from './pruebas/fabricas'

const ESTATURA = 175

describe('la grasa corporal estimada', () => {
  it('con 94 de cintura y 39.5 de cuello da alrededor del 24 por ciento', () => {
    const grasa = grasaEstimada(94, 39.5, ESTATURA)

    expect(grasa).toBeGreaterThan(22)
    expect(grasa).toBeLessThan(26)
  })

  it('bajar de cintura baja la estimación', () => {
    const antes = grasaEstimada(94, 39.5, ESTATURA) ?? 0
    const despues = grasaEstimada(90, 39.5, ESTATURA) ?? 0

    expect(despues).toBeLessThan(antes)
  })

  it('devuelve null si falta la cintura, el cuello o la estatura', () => {
    expect(grasaEstimada(null, 39.5, ESTATURA)).toBe(null)
    expect(grasaEstimada(94, null, ESTATURA)).toBe(null)
    expect(grasaEstimada(94, 39.5, null)).toBe(null)
  })

  it('devuelve null si la cintura no es mayor que el cuello', () => {
    expect(grasaEstimada(39, 39.5, ESTATURA)).toBe(null)
    expect(grasaEstimada(39.5, 39.5, ESTATURA)).toBe(null)
  })

  it('una medición sin cintura ni cuello no estima nada', () => {
    expect(grasaDeMedicion(medicion('peso', '2026-09-15', { peso: 80 }), ESTATURA)).toBe(null)
  })

  it('una medición completa sí estima', () => {
    const completa = medicion('peso', '2026-09-15', { peso: 80, cintura: 94, cuello: 39.5 })

    expect(grasaDeMedicion(completa, ESTATURA)).not.toBe(null)
  })

  it('solo se estima en metas que miden cintura y cuello', () => {
    expect(midePorcentajeDeGrasa(['peso', 'cintura', 'pecho', 'cuello'])).toBe(true)
    expect(midePorcentajeDeGrasa(['puntaje'])).toBe(false)
    expect(midePorcentajeDeGrasa(['peso', 'cintura'])).toBe(false)
  })
})
