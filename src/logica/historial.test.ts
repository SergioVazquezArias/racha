/**
 * Pruebas del historial de catorce semanas.
 *
 * Lo que más se cuida aquí es que **ningún día se pinte de rojo sin merecerlo**:
 * ni los anteriores al alta del hábito, ni los que pasó archivado, ni los días
 * libres de un hábito semanal, ni el de hoy, que todavía no se juzga.
 */

import { describe, expect, it } from 'vitest'

import { historialDeSemanas } from './historial'
import { archivado } from './altas'
import { comodin, cumplidos, habitoDiario, habitoNegativo, habitoSemanal, recaida, semanaDe } from './pruebas/fabricas'
import type { DatosDeRacha } from './rachas'
import type { EstadoDia } from './historial'

const HOY = '2026-09-17'
const VACIO: DatosDeRacha = { registros: [], semanas: [], comodines: [] }

/** El estado de un día concreto dentro del historial. */
function estadoDe(semanas: ReturnType<typeof historialDeSemanas>, fecha: string): EstadoDia | undefined {
  return semanas.flatMap((semana) => semana.dias).find((dia) => dia.fecha === fecha)?.estado
}

describe('la forma del historial', () => {
  it('trae catorce semanas de siete días, y la última es la de hoy', () => {
    const semanas = historialDeSemanas(habitoDiario('2026-01-01'), VACIO, HOY)

    expect(semanas).toHaveLength(14)
    expect(semanas.every((semana) => semana.dias.length === 7)).toBe(true)
    expect(semanas.at(-1)?.clave).toBe('2026-W38')
    expect(semanas.at(-1)?.lunes).toBe('2026-09-14')
  })

  it('lee el color del veredicto guardado y no lo vuelve a calcular', () => {
    const habito = habitoSemanal('2026-01-01', 5, 4)
    const datos = { ...VACIO, semanas: [semanaDe(habito.id, '2026-09-07', 'ambar')] }
    const semanas = historialDeSemanas(habito, datos, HOY)

    expect(semanas.find((semana) => semana.clave === '2026-W37')?.color).toBe('ambar')
    // La semana en curso no tiene veredicto todavía: no lleva color.
    expect(semanas.at(-1)?.color).toBe(null)
  })
})

describe('los días que no se pintan de rojo', () => {
  it('los anteriores al alta del hábito quedan fuera', () => {
    const habito = habitoDiario('2026-09-10')
    const semanas = historialDeSemanas(habito, VACIO, HOY)

    expect(estadoDe(semanas, '2026-09-09')).toBe('fuera')
    expect(estadoDe(semanas, '2026-09-10')).toBe('fallado')
  })

  it('el día de hoy se ve distinto, ni cumplido ni fallado', () => {
    const semanas = historialDeSemanas(habitoDiario('2026-01-01'), VACIO, HOY)

    expect(estadoDe(semanas, HOY)).toBe('hoy')
  })

  it('en un hábito semanal, un día sin marcar es un día libre', () => {
    const habito = habitoSemanal('2026-01-01', 5, 4)
    const semanas = historialDeSemanas(habito, VACIO, HOY)

    expect(estadoDe(semanas, '2026-09-15')).toBe('libre')
  })

  it('los días que el hábito estuvo archivado quedan fuera', () => {
    const habito = archivado(habitoDiario('2026-01-01'), 10, '2026-09-10')
    const semanas = historialDeSemanas(habito, VACIO, HOY)

    expect(estadoDe(semanas, '2026-09-09')).toBe('fallado')
    expect(estadoDe(semanas, '2026-09-11')).toBe('fuera')
  })

  it('un día con comodín se salta: ni cumplido ni fallado', () => {
    const habito = habitoDiario('2026-01-01')
    const datos = { ...VACIO, comodines: [comodin(habito.id, '2026-09-15')] }

    expect(estadoDe(historialDeSemanas(habito, datos, HOY), '2026-09-15')).toBe('comodin')
  })
})

describe('un hábito negativo en el historial', () => {
  const habito = habitoNegativo('2026-01-01')

  it('los días sin registro están limpios y la recaída se ve sola', () => {
    const datos = { ...VACIO, registros: [recaida(habito.id, '2026-09-15')] }
    const semanas = historialDeSemanas(habito, datos, HOY)

    expect(estadoDe(semanas, '2026-09-14')).toBe('limpio')
    expect(estadoDe(semanas, '2026-09-15')).toBe('recaida')
  })

  it('la barra de la semana cuenta los días limpios', () => {
    const datos = { ...VACIO, registros: [recaida(habito.id, '2026-09-15')] }
    const semana = historialDeSemanas(habito, datos, HOY).at(-1)

    // Del lunes 14 al martes 16 contaron tres días, uno de ellos con recaída.
    expect(semana?.hechos).toBe(2)
    expect(semana?.total).toBe(3)
  })
})

describe('las barras de un hábito semanal', () => {
  const habito = habitoSemanal('2026-01-01', 5, 4)

  it('muestran las marcas guardadas contra el objetivo de esa semana', () => {
    const datos = { ...VACIO, semanas: [semanaDe(habito.id, '2026-09-07', 'ambar', { hechos: 4, objetivo: 5 })] }
    const semana = historialDeSemanas(habito, datos, HOY).find((una) => una.clave === '2026-W37')

    expect(semana?.hechos).toBe(4)
    expect(semana?.total).toBe(5)
  })

  it('en la semana en curso cuentan las marcas que ya se hicieron', () => {
    const datos = { ...VACIO, registros: cumplidos(habito.id, ['2026-09-14', '2026-09-16']) }
    const semana = historialDeSemanas(habito, datos, HOY).at(-1)

    expect(semana?.hechos).toBe(2)
    expect(semana?.total).toBe(5)
  })
})
