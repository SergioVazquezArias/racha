/**
 * Pruebas de dónde se escribe cada rótulo de la gráfica.
 *
 * El caso que las trajo: en un iPhone, la última fecha del eje —«14 abr»— se
 * veía cortada como «14 abı» porque el rótulo iba centrado sobre una marca que
 * está pegada al borde. Aquí queda fijo que las dos orillas se agarran hacia
 * adentro y las de en medio no.
 */

import { describe, expect, it } from 'vitest'

import { anclaDeLaFecha, ladoDelHito } from './rotulos'
import type { EjeDeTiempo } from './serieMeta'

/** El eje de la meta de peso: del día 0 al 211. */
const TIEMPO: EjeDeTiempo = { minimo: 0, maximo: 211, marcas: [0, 70, 141, 211] }

describe('de dónde se agarra una fecha del eje de abajo', () => {
  it('la última termina en su marca, para no salirse por la derecha', () => {
    expect(anclaDeLaFecha(211, TIEMPO)).toBe('end')
  })

  it('la primera empieza en su marca, para no salirse por la izquierda', () => {
    expect(anclaDeLaFecha(0, TIEMPO)).toBe('start')
  })

  it('las de en medio van centradas, que es lo que se lee mejor', () => {
    expect(anclaDeLaFecha(70, TIEMPO)).toBe('middle')
    expect(anclaDeLaFecha(141, TIEMPO)).toBe('middle')
  })

  it('una fecha fuera del eje se trata como la orilla que le toca', () => {
    expect(anclaDeLaFecha(300, TIEMPO)).toBe('end')
    expect(anclaDeLaFecha(-20, TIEMPO)).toBe('start')
  })
})

describe('de qué lado se escribe el nombre de un hito', () => {
  it('pegado a la derecha, el nombre se escribe hacia la izquierda', () => {
    // El hito de peso cae en el día 190 de 211: al 90 % del camino.
    expect(ladoDelHito(190, TIEMPO)).toBe('left')
  })

  it('pegado a la izquierda, hacia la derecha', () => {
    expect(ladoDelHito(10, TIEMPO)).toBe('right')
  })

  it('en medio, encima del marcador', () => {
    expect(ladoDelHito(105, TIEMPO)).toBe('top')
  })

  it('un eje sin ancho no truena', () => {
    expect(ladoDelHito(0, { minimo: 0, maximo: 0, marcas: [0] })).toBe('top')
  })
})
