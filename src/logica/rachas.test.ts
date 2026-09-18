/**
 * Pruebas de las rachas de hábitos positivos, diarios y semanales.
 *
 * La racha se mide en días o en semanas según la cadencia (sección 6). En las
 * dos, el día de hoy nunca cuenta: el juicio llega a medianoche.
 */

import { describe, expect, it } from 'vitest'

import { sumarDias } from './fechas'
import { rachaDe, rachaDiaria, rachaSemanal } from './rachas'
import { cumplidos, habitoDiario, habitoNegativo, habitoSemanal, recaida, semanaDe } from './pruebas/fabricas'

const HOY = '2026-09-17'

/** Los días anteriores a hoy, del más viejo al más nuevo. */
function diasAntesDeHoy(cuantos: number): string[] {
  return Array.from({ length: cuantos }, (_, indice) => sumarDias(HOY, indice - cuantos))
}

/** Lunes consecutivos, del más viejo al más nuevo. */
function lunesSeguidos(cuantos: number): string[] {
  return Array.from({ length: cuantos }, (_, indice) => sumarDias('2026-07-06', indice * 7))
}

describe('racha semanal', () => {
  const habito = habitoSemanal('2026-01-01', 5, 3)

  it('sube una semana por cada semana verde', () => {
    const semanas = lunesSeguidos(3).map((lunes) => semanaDe(habito.id, lunes, 'verde'))

    expect(rachaSemanal(habito, semanas).actual).toBe(3)
  })

  it('una semana ámbar también suma: salva la racha aunque quede marcada', () => {
    const [uno, dos] = lunesSeguidos(2)
    const semanas = [semanaDe(habito.id, uno ?? '', 'verde'), semanaDe(habito.id, dos ?? '', 'ambar')]

    expect(rachaSemanal(habito, semanas).actual).toBe(2)
    expect(semanas[1]?.color).toBe('ambar')
  })

  it('una semana roja deja la racha en cero', () => {
    const [uno, dos, tres] = lunesSeguidos(3)
    const semanas = [
      semanaDe(habito.id, uno ?? '', 'verde'),
      semanaDe(habito.id, dos ?? '', 'verde'),
      semanaDe(habito.id, tres ?? '', 'rojo'),
    ]

    expect(rachaSemanal(habito, semanas).actual).toBe(0)
  })

  it('dos semanas ámbar seguidas rompen la racha', () => {
    const [uno, dos, tres] = lunesSeguidos(3)
    const semanas = [
      semanaDe(habito.id, uno ?? '', 'verde'),
      semanaDe(habito.id, dos ?? '', 'ambar'),
      semanaDe(habito.id, tres ?? '', 'ambar'),
    ]

    expect(rachaSemanal(habito, semanas).actual).toBe(0)
  })

  it('ámbar, verde y ámbar NO rompe: las ámbar no son consecutivas', () => {
    const [uno, dos, tres] = lunesSeguidos(3)
    const semanas = [
      semanaDe(habito.id, uno ?? '', 'ambar'),
      semanaDe(habito.id, dos ?? '', 'verde'),
      semanaDe(habito.id, tres ?? '', 'ambar'),
    ]

    expect(rachaSemanal(habito, semanas).actual).toBe(3)
  })

  it('conserva la mejor racha histórica después de una semana roja', () => {
    const lunes = lunesSeguidos(5)
    const colores = ['verde', 'verde', 'verde', 'rojo', 'verde'] as const
    const semanas = lunes.map((dia, indice) => semanaDe(habito.id, dia ?? '', colores[indice] ?? 'verde'))

    expect(rachaSemanal(habito, semanas)).toEqual({ actual: 1, mejor: 3 })
  })

  it('no toma en cuenta la semana en curso, que todavía no cierra', () => {
    const [uno, dos] = lunesSeguidos(2)
    const semanas = [
      semanaDe(habito.id, uno ?? '', 'verde'),
      semanaDe(habito.id, dos ?? '', 'rojo', { cerrada: false }),
    ]

    expect(rachaSemanal(habito, semanas).actual).toBe(1)
  })

  it('ignora las semanas de otros hábitos', () => {
    const [uno, dos] = lunesSeguidos(2)
    const semanas = [semanaDe(habito.id, uno ?? '', 'verde'), semanaDe('otro-habito', dos ?? '', 'rojo')]

    expect(rachaSemanal(habito, semanas).actual).toBe(1)
  })
})

describe('racha diaria', () => {
  it('cuenta los días seguidos cumplidos hasta ayer', () => {
    const dias = diasAntesDeHoy(4)
    const habito = habitoDiario('2026-09-01')

    expect(rachaDiaria(habito, cumplidos(habito.id, dias), HOY).actual).toBe(4)
  })

  it('un día sin marcar en el pasado rompe la racha', () => {
    const dias = diasAntesDeHoy(5)
    const habito = habitoDiario('2026-09-01')
    const sinElTercero = dias.filter((_, indice) => indice !== 2)

    expect(rachaDiaria(habito, cumplidos(habito.id, sinElTercero), HOY).actual).toBe(2)
  })

  it('conserva la mejor racha histórica aunque la actual esté rota', () => {
    const dias = diasAntesDeHoy(6)
    const habito = habitoDiario(dias[0] ?? '')
    const sinElQuinto = dias.filter((_, indice) => indice !== 4)

    expect(rachaDiaria(habito, cumplidos(habito.id, sinElQuinto), HOY)).toEqual({ actual: 1, mejor: 4 })
  })

  it('no mira más atrás de la creación del hábito ni inventa fallas', () => {
    const dias = diasAntesDeHoy(3)
    const habito = habitoDiario(dias[0] ?? '')

    expect(rachaDiaria(habito, cumplidos(habito.id, dias), HOY).actual).toBe(3)
  })

  it('un hábito creado hoy arranca en cero, no en falla', () => {
    const habito = habitoDiario(HOY)

    expect(rachaDiaria(habito, [], HOY)).toEqual({ actual: 0, mejor: 0 })
  })
})

describe('el historial ya cerrado no se reescribe', () => {
  it('subir el objetivo no vuelve roja una semana que se cerró en verde', () => {
    // La semana se cerró cuando la meta eran 3 veces por semana y se hicieron 3.
    const cerrada = semanaDe('habito', '2026-07-06', 'verde', { hechos: 3, objetivo: 3, minimo: 2 })
    // Hoy la meta es 6, pero el pasado no se vuelve a juzgar (regla 8).
    const habitoExigente = habitoSemanal('2026-01-01', 6, 5)

    expect(rachaSemanal(habitoExigente, [cerrada]).actual).toBe(1)
    expect(cerrada.color).toBe('verde')
  })

  it('bajar el objetivo tampoco rescata una semana que se cerró en rojo', () => {
    const cerrada = semanaDe('habito', '2026-07-06', 'rojo', { hechos: 1, objetivo: 5, minimo: 3 })
    const habitoBlando = habitoSemanal('2026-01-01', 1, 1)

    expect(rachaSemanal(habitoBlando, [cerrada]).actual).toBe(0)
  })
})

describe('elegir la forma de contar según el hábito', () => {
  const dias = diasAntesDeHoy(3)

  it('un positivo diario se cuenta por días', () => {
    const habito = habitoDiario('2026-09-01')
    const datos = { registros: cumplidos(habito.id, dias), semanas: [], comodines: [] }

    expect(rachaDe(habito, datos, HOY).actual).toBe(3)
  })

  it('un positivo semanal se cuenta por semanas, aunque tenga registros diarios', () => {
    const habito = habitoSemanal('2026-01-01', 5, 3)
    const semanas = lunesSeguidos(2).map((lunes) => semanaDe(habito.id, lunes, 'verde'))
    const datos = { registros: cumplidos(habito.id, dias), semanas, comodines: [] }

    expect(rachaDe(habito, datos, HOY).actual).toBe(2)
  })

  it('un negativo se cuenta por días limpios, aunque tenga semanas guardadas', () => {
    const habito = habitoNegativo('2026-09-10')
    const semanas = lunesSeguidos(2).map((lunes) => semanaDe(habito.id, lunes, 'rojo'))
    const datos = { registros: [recaida(habito.id, '2026-09-14')], semanas, comodines: [] }

    expect(rachaDe(habito, datos, HOY).actual).toBe(2)
  })
})
