/**
 * Pruebas de la racha de un hábito negativo (secciones 5 y 10).
 *
 * Un negativo cuenta a favor solo: el usuario no marca nada en un día normal y
 * la medianoche cierra el día como cumplido. Lo único que registra es la
 * recaída, y una recaída nunca se perdona con un comodín.
 */

import { describe, expect, it } from 'vitest'

import { rachaNegativa } from './rachas'
import { habitoNegativo, recaida } from './pruebas/fabricas'

const HOY = '2026-09-17'

describe('racha de un hábito negativo', () => {
  it('sin ningún registro, va sumando días desde que se creó el hábito', () => {
    const habito = habitoNegativo('2026-09-01')

    expect(rachaNegativa(habito, [], HOY).actual).toBe(16)
  })

  it('no cuenta días anteriores a su creación', () => {
    const viejo = habitoNegativo('2026-01-01')
    const nuevo = habitoNegativo('2026-09-10')

    expect(rachaNegativa(viejo, [], HOY).actual).toBe(259)
    expect(rachaNegativa(nuevo, [], HOY).actual).toBe(7)
  })

  it('una recaída reinicia el contador desde el día siguiente', () => {
    const habito = habitoNegativo('2026-01-01')
    const registros = [recaida(habito.id, '2026-09-13')]

    // Limpio el 14, 15 y 16. Hoy, 17, todavía no cuenta.
    expect(rachaNegativa(habito, registros, HOY).actual).toBe(3)
  })

  it('una recaída de ayer deja el contador en cero', () => {
    const habito = habitoNegativo('2026-01-01')

    expect(rachaNegativa(habito, [recaida(habito.id, '2026-09-16')], HOY).actual).toBe(0)
  })

  it('una recaída de hoy deja el contador en cero', () => {
    const habito = habitoNegativo('2026-01-01')

    expect(rachaNegativa(habito, [recaida(habito.id, HOY)], HOY).actual).toBe(0)
  })

  it('conserva la mejor racha histórica después de una recaída', () => {
    const habito = habitoNegativo('2026-09-01')
    const registros = [recaida(habito.id, '2026-09-12')]

    // Del 1 al 11 estuvo limpio: once días. La recaída no borra ese récord.
    expect(rachaNegativa(habito, registros, HOY)).toEqual({ actual: 4, mejor: 11 })
  })

  it('la mejor racha puede estar entre dos recaídas y no al principio', () => {
    const habito = habitoNegativo('2026-09-01')
    const registros = [
      recaida(habito.id, '2026-09-03'),
      recaida(habito.id, '2026-09-14'),
      recaida(habito.id, '2026-09-16'),
    ]

    // Tramos: 2 días (del 1 al 2), 10 días (del 4 al 13), 1 día (el 15), 0 hoy.
    expect(rachaNegativa(habito, registros, HOY)).toEqual({ actual: 0, mejor: 10 })
  })

  it('ignora las recaídas de otros hábitos', () => {
    const habito = habitoNegativo('2026-09-01')
    const registros = [recaida('otro-habito', '2026-09-16')]

    expect(rachaNegativa(habito, registros, HOY).actual).toBe(16)
  })
})
