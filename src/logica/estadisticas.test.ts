/**
 * Pruebas de la pantalla de Estadísticas.
 *
 * Son las cuentas que comparan hábitos entre sí, así que lo que se cuida aquí
 * es el orden —quién va primero— y que nadie salga premiado o castigado por
 * llevar más o menos tiempo en la app.
 */

import { describe, expect, it } from 'vitest'

import { mejorRachaGlobal, patronPorDiaDeSemana, rankingA30Dias } from './estadisticas'
import { archivado } from './altas'
import { cumplidos, habitoDiario, habitoNegativo, recaida } from './pruebas/fabricas'
import { sumarDias } from './fechas'
import type { DatosDeRacha } from './rachas'

const HOY = '2026-09-17'

/** Los días de ayer hacia atrás. */
function ultimosDias(cuantos: number): string[] {
  return Array.from({ length: cuantos }, (_, cuantas) => sumarDias(HOY, -(cuantas + 1)))
}

describe('el ranking de cumplimiento a 30 días', () => {
  const constante = habitoDiario('2026-01-01', { id: 'constante' })
  const flojo = habitoDiario('2026-01-01', { id: 'flojo' })
  const registros = [...cumplidos('constante', ultimosDias(30)), ...cumplidos('flojo', ultimosDias(10))]

  it('pone arriba al que más cumplió', () => {
    const ranking = rankingA30Dias([flojo, constante], registros, HOY)

    expect(ranking.map((fila) => fila.habito.id)).toEqual(['constante', 'flojo'])
    expect(ranking[0]?.cumplimiento.porcentaje).toBe(100)
    expect(ranking[1]?.cumplimiento.porcentaje).toBe(33)
  })

  it('manda al final a los hábitos demasiado nuevos para tener porcentaje', () => {
    const recienNacido = habitoDiario(HOY, { id: 'nuevo' })
    const ranking = rankingA30Dias([recienNacido, flojo], registros, HOY)

    expect(ranking.at(-1)?.habito.id).toBe('nuevo')
    expect(ranking.at(-1)?.cumplimiento.porcentaje).toBe(null)
  })

  it('los hábitos negativos compiten con sus días limpios', () => {
    const limpio = habitoNegativo('2026-01-01', { id: 'sin-pantallas' })
    const ranking = rankingA30Dias([flojo, limpio], [...registros, recaida('sin-pantallas', ultimosDias(3)[0] ?? HOY)], HOY)

    expect(ranking[0]?.habito.id).toBe('sin-pantallas')
    expect(ranking[0]?.cumplimiento.porcentaje).toBe(97)
  })
})

describe('la mejor racha global', () => {
  const datos: DatosDeRacha = {
    registros: [...cumplidos('corto', ultimosDias(3)), ...cumplidos('largo', ultimosDias(20))],
    semanas: [],
    comodines: [],
  }

  it('encuentra el récord y de quién es', () => {
    const corto = habitoDiario('2026-09-13', { id: 'corto' })
    const largo = habitoDiario('2026-08-01', { id: 'largo' })

    expect(mejorRachaGlobal([corto, largo], datos, HOY)).toEqual({ habito: largo, mejor: 20 })
  })

  it('cuenta también el récord congelado de un hábito archivado', () => {
    const archivadoConRecord = archivado(habitoDiario('2026-01-01', { id: 'viejo' }), 120, '2026-06-01')
    const largo = habitoDiario('2026-08-01', { id: 'largo' })

    expect(mejorRachaGlobal([largo, archivadoConRecord], datos, HOY)?.mejor).toBe(120)
  })

  it('no dice nada cuando todavía no hay ninguna racha', () => {
    expect(mejorRachaGlobal([habitoDiario(HOY)], { registros: [], semanas: [], comodines: [] }, HOY)).toBe(null)
  })
})

describe('el patrón por día de la semana', () => {
  it('trae los siete días en orden, empezando en lunes', () => {
    const patron = patronPorDiaDeSemana([habitoDiario('2026-01-01')], [], HOY)

    expect(patron.map((dia) => dia.nombre)).toEqual([
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ])
  })

  it('encuentra el día que se cumple siempre y el que nunca', () => {
    const habito = habitoDiario('2026-08-20')
    // Todos los lunes que ha vivido, y ningún domingo.
    const lunes = ['2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14']
    const patron = patronPorDiaDeSemana([habito], cumplidos(habito.id, lunes), HOY)

    expect(patron[0]?.porcentaje).toBe(100)
    expect(patron[6]?.porcentaje).toBe(0)
  })

  it('no mira los hábitos negativos: esos los cuentan los patrones de recaída', () => {
    const negativo = habitoNegativo('2026-01-01')
    const patron = patronPorDiaDeSemana([negativo], [recaida(negativo.id, '2026-09-11')], HOY)

    expect(patron.every((dia) => dia.posibles === 0)).toBe(true)
    expect(patron.every((dia) => dia.porcentaje === null)).toBe(true)
  })

  it('no cuenta los días anteriores al alta del hábito', () => {
    // Nació el martes 15: el lunes 14 no tuvo oportunidad de cumplirse.
    const habito = habitoDiario('2026-09-15')
    const patron = patronPorDiaDeSemana([habito], [], HOY)

    expect(patron[0]?.posibles).toBe(0)
    expect(patron[1]?.posibles).toBe(1)
  })
})
