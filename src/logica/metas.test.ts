/**
 * Pruebas del estado de una meta.
 *
 * Lo que se cuida aquí es que la recta del plan diga la verdad en cualquier
 * día del camino, y que «vas adelantado» signifique lo mismo en una meta que
 * baja —el peso— y en una que sube —el puntaje de inglés—. Es el error fácil:
 * en la de peso ir bien es tener un número más chico que el del plan, y en la
 * de inglés es tenerlo más grande.
 */

import { describe, expect, it } from 'vitest'

import {
  alcanzado,
  campoPrincipal,
  fechaPlaneadaPara,
  progresoDe,
  ultimaConValor,
  valorPlaneado,
  valorPrincipal,
} from './metas'
import { medicion, metaDeIngles, metaDePeso } from './pruebas/fabricas'

describe('el campo principal de una meta', () => {
  it('es el primero de su lista', () => {
    expect(campoPrincipal(metaDePeso())).toBe('peso')
    expect(campoPrincipal(metaDeIngles())).toBe('puntaje')
  })

  it('una medición sin el campo principal no tiene valor, y no se le inventa', () => {
    const soloCintura = medicion('peso', '2026-09-20', { cintura: 93 })

    expect(valorPrincipal(metaDePeso(), soloCintura)).toBe(null)
  })

  it('la última con valor se salta las mediciones que no lo traen', () => {
    const meta = metaDePeso()
    const mediciones = [
      medicion('peso', '2026-09-15', { peso: 82 }),
      medicion('peso', '2026-09-22', { cintura: 93 }),
    ]

    expect(ultimaConValor(meta, mediciones)?.fecha).toBe('2026-09-15')
  })

  it('devuelve null cuando no hay ninguna medición', () => {
    expect(ultimaConValor(metaDePeso(), [])).toBe(null)
  })
})

describe('la recta del plan', () => {
  const meta = metaDePeso()

  it('el primer día vale el valor inicial y el último el objetivo', () => {
    expect(valorPlaneado(meta, '2026-09-15')).toBe(82)
    expect(valorPlaneado(meta, '2027-04-14')).toBe(75)
  })

  it('a la mitad del camino va a la mitad de los kilos', () => {
    // Del 15 de septiembre al 14 de abril hay 211 días; el 105 es la mitad.
    const mitad = valorPlaneado(meta, '2026-12-29')

    expect(mitad).toBeCloseTo(78.5, 1)
  })

  it('no se prolonga: antes de empezar vale el inicial y después vale el objetivo', () => {
    expect(valorPlaneado(meta, '2026-01-01')).toBe(82)
    expect(valorPlaneado(meta, '2030-01-01')).toBe(75)
  })

  it('fecha el hito donde la recta cruza su valor', () => {
    // 75.7 kg son 6.3 de los 7 kg del camino: el 24 de marzo de 2027.
    expect(fechaPlaneadaPara(meta, 75.7)).toBe('2027-03-24')
  })
})

describe('alcanzar el objetivo', () => {
  it('en una meta que baja, se alcanza con un número menor o igual', () => {
    const meta = metaDePeso()

    expect(alcanzado(meta, 75)).toBe(true)
    expect(alcanzado(meta, 74.2)).toBe(true)
    expect(alcanzado(meta, 75.4)).toBe(false)
  })

  it('en una meta que sube, se alcanza con un número mayor o igual', () => {
    const meta = metaDeIngles()

    expect(alcanzado(meta, 70)).toBe(true)
    expect(alcanzado(meta, 72)).toBe(true)
    expect(alcanzado(meta, 69)).toBe(false)
  })
})

describe('el progreso contra el plan', () => {
  it('sin mediciones no inventa un valor actual', () => {
    const progreso = progresoDe(metaDePeso(), [], '2026-10-15')

    expect(progreso.valorActual).toBe(null)
    expect(progreso.ventaja).toBe(null)
    expect(progreso.avance).toBe(null)
  })

  it('en la meta de peso, pesar menos que el plan es ir adelantado', () => {
    const meta = metaDePeso()
    // El 30 de diciembre el plan pide unos 78.5 kg.
    const progreso = progresoDe(meta, [medicion('peso', '2026-12-30', { peso: 77 })], '2026-12-30')

    expect(progreso.ventaja).toBeGreaterThan(0)
    expect(progreso.restante).toBe(2)
  })

  it('en la meta de peso, pesar más que el plan es ir atrasado', () => {
    const meta = metaDePeso()
    const progreso = progresoDe(meta, [medicion('peso', '2026-12-30', { peso: 80 })], '2026-12-30')

    expect(progreso.ventaja).toBeLessThan(0)
  })

  it('en la meta de inglés es al revés: más puntos que el plan es ir adelantado', () => {
    const meta = metaDeIngles()
    const alta = progresoDe(meta, [medicion('ingles', '2027-01-01', { puntaje: 65 })], '2027-01-01')
    const baja = progresoDe(meta, [medicion('ingles', '2027-01-01', { puntaje: 52 })], '2027-01-01')

    expect(alta.ventaja).toBeGreaterThan(0)
    expect(baja.ventaja).toBeLessThan(0)
  })

  it('el avance va de cero a cien y no se pasa aunque te pases del objetivo', () => {
    const meta = metaDePeso()
    const arranque = progresoDe(meta, [medicion('peso', '2026-09-15', { peso: 82 })], '2026-09-15')
    const media = progresoDe(meta, [medicion('peso', '2026-12-01', { peso: 78.5 })], '2026-12-01')
    const pasado = progresoDe(meta, [medicion('peso', '2027-04-01', { peso: 73 })], '2027-04-01')

    expect(arranque.avance).toBe(0)
    expect(media.avance).toBe(50)
    expect(pasado.avance).toBe(100)
    expect(pasado.restante).toBe(0)
    expect(pasado.logrado).toBe(true)
  })
})
