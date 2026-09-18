/**
 * Pruebas del porcentaje de cumplimiento.
 *
 * Lo que se comprueba aquí, sobre todo, es el **denominador**: que la app no
 * invente días que el hábito no vivió. Un porcentaje con el denominador mal
 * puesto se ve perfectamente normal en pantalla y miente todos los días.
 */

import { describe, expect, it } from 'vitest'

import { cumplimientoDe, cumplimientos } from './cumplimiento'
import { archivado, revivido } from './altas'
import { cumplidos, habitoDiario, habitoNegativo, habitoSemanal, recaida } from './pruebas/fabricas'
import { sumarDias } from './fechas'
import type { Fecha, Registro } from '../tipos'

const HOY = '2026-09-17'

/** Los días de ayer hacia atrás, para llenar ventanas sin escribir fechas a mano. */
function ultimosDias(cuantos: number): Fecha[] {
  return Array.from({ length: cuantos }, (_, cuantas) => sumarDias(HOY, -(cuantas + 1)))
}

describe('cumplimiento de un hábito diario', () => {
  const habito = habitoDiario('2026-01-01')

  it('es del 100 % si se cumplieron los siete días', () => {
    const registros = cumplidos(habito.id, ultimosDias(7))

    expect(cumplimientoDe(habito, registros, HOY, 7).porcentaje).toBe(100)
  })

  it('no cuenta el día de hoy, ni a favor ni en contra', () => {
    // Siete días marcados, pero uno es hoy: la ventana de siete llega a ayer.
    const registros = cumplidos(habito.id, [HOY, ...ultimosDias(6)])

    expect(cumplimientoDe(habito, registros, HOY, 7).porcentaje).toBe(86)
  })

  it('un día sí y un día no da cuatro de siete', () => {
    const registros = cumplidos(habito.id, ultimosDias(7).filter((_, posicion) => posicion % 2 === 0))

    expect(cumplimientoDe(habito, registros, HOY, 7).porcentaje).toBe(57)
  })
})

describe('el denominador de un hábito recién creado', () => {
  it('a 30 días solo cuenta los días que lleva vivo', () => {
    // Nació hace cuatro días y cumplió tres: tres de tres, porque hoy no cuenta.
    const habito = habitoDiario(sumarDias(HOY, -4))
    const registros = cumplidos(habito.id, ultimosDias(3))

    const treinta = cumplimientoDe(habito, registros, HOY, 30)
    expect(treinta.dias).toBe(4)
    expect(treinta.porcentaje).toBe(75)
  })

  it('un hábito creado hoy no tiene porcentaje todavía', () => {
    const habito = habitoDiario(HOY)
    const tres = cumplimientos(habito, [], HOY)

    expect(tres.sieteDias.porcentaje).toBe(null)
    expect(tres.treintaDias.porcentaje).toBe(null)
    expect(tres.total.porcentaje).toBe(null)
    expect(tres.total.dias).toBe(0)
  })
})

describe('cumplimiento de un hábito semanal', () => {
  const habito = habitoSemanal('2026-01-01', 5, 4)

  it('mide las marcas hechas contra las propuestas, no contra los días', () => {
    // Cinco marcas en siete días con objetivo de cinco: cumplido al 100 %.
    const registros = cumplidos(habito.id, ultimosDias(7).slice(0, 5))

    expect(cumplimientoDe(habito, registros, HOY, 7).porcentaje).toBe(100)
  })

  it('una semana ámbar baja el porcentaje aunque salve la racha', () => {
    // Cuatro de cinco: llega al mínimo, así que la semana es ámbar y la racha
    // sigue viva, pero el número honesto baja a 80 %.
    const registros = cumplidos(habito.id, ultimosDias(7).slice(0, 4))

    expect(cumplimientoDe(habito, registros, HOY, 7).porcentaje).toBe(80)
  })

  it('no pasa de 100 % aunque se haga de más', () => {
    const registros = cumplidos(habito.id, ultimosDias(7))

    expect(cumplimientoDe(habito, registros, HOY, 7).porcentaje).toBe(100)
  })
})

describe('cumplimiento de un hábito negativo', () => {
  const habito = habitoNegativo('2026-01-01')

  it('sin recaídas es del 100 %', () => {
    expect(cumplimientoDe(habito, [], HOY, 30).porcentaje).toBe(100)
  })

  it('cada recaída baja el porcentaje', () => {
    const registros: Registro[] = [recaida(habito.id, sumarDias(HOY, -2)), recaida(habito.id, sumarDias(HOY, -9))]

    // Dos recaídas en treinta días: 28 limpios de 30.
    expect(cumplimientoDe(habito, registros, HOY, 30).porcentaje).toBe(93)
    // En la ventana de siete solo cabe una de las dos: 6 de 7.
    expect(cumplimientoDe(habito, registros, HOY, 7).porcentaje).toBe(86)
  })
})

describe('cumplimiento de un hábito archivado o revivido', () => {
  const habito = habitoNegativo('2026-01-01')

  it('un hábito archivado no acumula días después de guardarse', () => {
    const guardado = archivado(habito, 100, '2026-09-10')

    // La ventana llega hasta la víspera del archivado, no hasta ayer.
    expect(cumplimientoDe(guardado, [], HOY, 7).dias).toBe(7)
    expect(cumplimientoDe(guardado, [recaida(habito.id, '2026-09-12')], HOY, 7).porcentaje).toBe(100)
  })

  it('un hábito revivido cuenta desde su vuelta, no desde su alta', () => {
    const revivio = revivido(archivado(habito, 100, '2026-06-01'), sumarDias(HOY, -3))

    expect(cumplimientoDe(revivio, [], HOY, 30).dias).toBe(3)
  })
})
