/**
 * Pruebas del cierre de semanas (reglas 8 y sección 9).
 *
 * Al abrir la app hay que emitir el veredicto de las semanas que terminaron
 * mientras no se abría. Lo que se cuida aquí es que ese cierre no juzgue de más:
 * ni la semana en curso, ni una semana ya juzgada, ni días en que el hábito
 * todavía no existía o ya estaba archivado.
 *
 * Todas las fechas de este archivo caen en semanas que empiezan en lunes:
 * el 31 de agosto, el 7 y el 14 de septiembre de 2026 son lunes. Hoy es jueves
 * 17 de septiembre, así que la semana en curso es la del 14.
 */

import { describe, expect, it } from 'vitest'

import { semanasPorCerrar } from './cierre'
import { claveSemana, hoy } from './fechas'
import { cumplidos, habitoDiario, habitoNegativo, habitoSemanal, semanaDe } from './pruebas/fabricas'
import { habitosDeEjemplo } from '../datos/ejemplo/habitos'
import { historialDeEjemplo } from '../datos/ejemplo/historial'

const HOY = '2026-09-17'
const LUNES_PASADO = '2026-09-07'
const LUNES_ANTEPASADO = '2026-08-31'

describe('cierre de semanas al abrir la app', () => {
  it('emite el veredicto de una semana que ya terminó y no lo tenía', () => {
    const habito = habitoSemanal(LUNES_PASADO, 5, 4)
    const registros = cumplidos(habito.id, ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'])

    const nuevas = semanasPorCerrar([habito], registros, [], HOY)

    expect(nuevas).toHaveLength(1)
    expect(nuevas[0]?.id).toBe(`${habito.id}:${claveSemana(LUNES_PASADO)}`)
    expect(nuevas[0]?.hechos).toBe(5)
    expect(nuevas[0]?.color).toBe('verde')
    expect(nuevas[0]?.cerrada).toBe(true)
  })

  it('una semana sin ninguna marca se cierra en rojo', () => {
    const habito = habitoSemanal(LUNES_PASADO, 5, 4)

    const nuevas = semanasPorCerrar([habito], [], [], HOY)

    expect(nuevas[0]?.color).toBe('rojo')
    expect(nuevas[0]?.hechos).toBe(0)
  })

  it('no vuelve a juzgar una semana que ya tenía veredicto guardado', () => {
    const habito = habitoSemanal(LUNES_PASADO, 5, 4)
    const yaGuardada = semanaDe(habito.id, LUNES_PASADO, 'ambar')

    expect(semanasPorCerrar([habito], [], [yaGuardada], HOY)).toEqual([])
  })

  it('no juzga la semana en curso: su veredicto llega el lunes que viene', () => {
    const habito = habitoSemanal('2026-09-14', 5, 4)

    expect(semanasPorCerrar([habito], [], [], HOY)).toEqual([])
  })

  it('cierra de un jalón todas las semanas que pasaron sin abrir la app', () => {
    const habito = habitoSemanal(LUNES_ANTEPASADO, 5, 4)

    const nuevas = semanasPorCerrar([habito], [], [], HOY)

    expect(nuevas.map((semana) => semana.id)).toEqual([
      `${habito.id}:${claveSemana(LUNES_ANTEPASADO)}`,
      `${habito.id}:${claveSemana(LUNES_PASADO)}`,
    ])
  })

  it('cierra solo las semanas que faltaban y respeta la que ya estaba', () => {
    const habito = habitoSemanal(LUNES_ANTEPASADO, 5, 4)
    const yaGuardada = semanaDe(habito.id, LUNES_ANTEPASADO, 'verde')

    const nuevas = semanasPorCerrar([habito], [], [yaGuardada], HOY)

    expect(nuevas.map((semana) => semana.id)).toEqual([`${habito.id}:${claveSemana(LUNES_PASADO)}`])
  })
})

describe('el cierre no inventa semanas que el hábito no vivió', () => {
  it('un hábito nacido a media semana no arrastra una roja por esos días', () => {
    // Nació el miércoles 9 de septiembre: esa semana la vivió a medias y no se
    // juzga. La del 14 es la semana en curso. Así que no hay nada que cerrar.
    const habito = habitoSemanal('2026-09-09', 5, 4)

    expect(semanasPorCerrar([habito], [], [], HOY)).toEqual([])
  })

  it('un hábito nacido en lunes sí estrena veredicto esa misma semana', () => {
    const habito = habitoSemanal(LUNES_PASADO, 5, 4)

    expect(semanasPorCerrar([habito], [], [], HOY)).toHaveLength(1)
  })

  it('un hábito archivado deja de acumular semanas', () => {
    const habito = habitoSemanal(LUNES_ANTEPASADO, 5, 4, { archivadoEn: LUNES_PASADO })

    // Se archivó el lunes 7, así que la última semana que vivió completa es la
    // del 31 de agosto. La del 7 no se juzga.
    const nuevas = semanasPorCerrar([habito], [], [], HOY)

    expect(nuevas.map((semana) => semana.id)).toEqual([`${habito.id}:${claveSemana(LUNES_ANTEPASADO)}`])
  })
})

describe('el cierre solo aplica a los hábitos con semáforo', () => {
  it('un hábito de cadencia diaria no genera veredictos de semana', () => {
    const habito = habitoDiario(LUNES_ANTEPASADO)

    expect(semanasPorCerrar([habito], [], [], HOY)).toEqual([])
  })

  it('un hábito negativo nunca genera veredictos de semana', () => {
    const habito = habitoNegativo(LUNES_ANTEPASADO, { cadencia: 'semanal', objetivo: 5, minimo: 4 })

    expect(semanasPorCerrar([habito], [], [], HOY)).toEqual([])
  })
})

describe('el cierre sobre los datos de ejemplo', () => {
  it('no inventa ninguna semana: el historial de ejemplo ya viene completo', () => {
    // Esta prueba cuida un riesgo concreto. Los hábitos de ejemplo nacen una
    // semana antes de que arranque su historial, así que si el cierre juzgara
    // esa semana a medias metería una roja falsa y pondría todas las rachas en
    // cero la primera vez que se abriera la app.
    const habitos = habitosDeEjemplo()
    const { registros, semanas } = historialDeEjemplo(habitos)

    expect(semanasPorCerrar(habitos, registros, semanas, hoy())).toEqual([])
  })
})
