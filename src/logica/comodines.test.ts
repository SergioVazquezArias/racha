/**
 * Pruebas de los comodines (sección 7).
 *
 * Un comodín congela: la racha no crece, pero tampoco se rompe. Hay uno al mes,
 * se recarga el día 1, no se acumulan, se puede aplicar hasta tres días hacia
 * atrás y nunca sirve para un hábito negativo.
 */

import { describe, expect, it } from 'vitest'

import { comodinesDisponibles, puedeAplicarComodin } from './comodines'
import { rachaDiaria, rachaSemanal } from './rachas'
import { comodin, cumplidos, habitoDiario, habitoNegativo, habitoSemanal, semanaDe } from './pruebas/fabricas'
import { sumarDias } from './fechas'

const HOY = '2026-09-17'

describe('el comodín congela la racha', () => {
  it('sobre una semana roja: la racha ni sube ni baja', () => {
    const habito = habitoSemanal('2026-01-01', 5, 3)
    const semanas = [
      semanaDe(habito.id, '2026-07-06', 'verde'),
      semanaDe(habito.id, '2026-07-13', 'verde'),
      semanaDe(habito.id, '2026-07-20', 'rojo'),
      semanaDe(habito.id, '2026-07-27', 'verde'),
    ]
    const comodines = [comodin(habito.id, '2026-07-20')]

    // Sin comodín la roja mataría la racha y solo quedaría la última semana.
    expect(rachaSemanal(habito, semanas).actual).toBe(1)
    // Con comodín, las dos verdes de antes se conservan y la última suma.
    expect(rachaSemanal(habito, semanas, comodines).actual).toBe(3)
  })

  it('la semana congelada sigue siendo roja: nunca se pinta de verde', () => {
    const habito = habitoSemanal('2026-01-01', 5, 3)
    const semanas = [semanaDe(habito.id, '2026-07-20', 'rojo')]

    rachaSemanal(habito, semanas, [comodin(habito.id, '2026-07-20')])

    expect(semanas[0]?.color).toBe('rojo')
  })

  it('sobre un día fallado en cadencia diaria: la racha ni sube ni baja', () => {
    const habito = habitoDiario('2026-09-10')
    const dias = ['2026-09-12', '2026-09-13', '2026-09-15', '2026-09-16']
    const registros = cumplidos(habito.id, dias)

    expect(rachaDiaria(habito, registros, HOY).actual).toBe(2)
    expect(rachaDiaria(habito, registros, HOY, [comodin(habito.id, '2026-09-14')]).actual).toBe(4)
  })
})

describe('cuántos comodines hay disponibles', () => {
  it('hay uno al empezar un mes sin gastar ninguno', () => {
    expect(comodinesDisponibles([], HOY)).toBe(1)
  })

  it('solo hay uno por mes: el segundo del mismo mes ya no se puede', () => {
    const gastado = [comodin('habito', '2026-09-05', '2026-09-05')]

    expect(comodinesDisponibles(gastado, HOY)).toBe(0)
    expect(puedeAplicarComodin(habitoDiario('2026-01-01'), '2026-09-16', gastado, HOY)).toBe(false)
  })

  it('no se acumulan: no gastar el de agosto no da dos en septiembre', () => {
    const deAgosto = [comodin('habito', '2026-08-04', '2026-08-04')]

    expect(comodinesDisponibles(deAgosto, HOY)).toBe(1)
  })

  it('el del mes pasado no estorba al de este mes', () => {
    const habito = habitoDiario('2026-01-01')
    const deAgosto = [comodin(habito.id, '2026-08-04', '2026-08-04')]

    expect(puedeAplicarComodin(habito, '2026-09-16', deAgosto, HOY)).toBe(true)
  })
})

describe('hasta dónde alcanza un comodín hacia atrás', () => {
  const habito = habitoDiario('2026-01-01')

  it('se puede aplicar al día de hoy y a los tres anteriores', () => {
    for (const diasAtras of [0, 1, 2, 3]) {
      expect(puedeAplicarComodin(habito, sumarDias(HOY, -diasAtras), [], HOY)).toBe(true)
    }
  })

  it('cuatro días hacia atrás ya no se puede', () => {
    expect(puedeAplicarComodin(habito, sumarDias(HOY, -4), [], HOY)).toBe(false)
  })

  it('tampoco se puede aplicar a un día que todavía no llega', () => {
    expect(puedeAplicarComodin(habito, sumarDias(HOY, 1), [], HOY)).toBe(false)
  })
})

describe('los hábitos negativos', () => {
  it('nunca admiten un comodín: una recaída es una recaída', () => {
    const habito = habitoNegativo('2026-01-01')

    expect(puedeAplicarComodin(habito, '2026-09-16', [], HOY)).toBe(false)
  })

  it('no lo admiten ni aunque alguien les prenda `permiteComodin` por error', () => {
    const habito = habitoNegativo('2026-01-01', { permiteComodin: true })

    expect(puedeAplicarComodin(habito, '2026-09-16', [], HOY)).toBe(false)
  })
})
