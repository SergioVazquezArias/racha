/**
 * Pruebas del semáforo semanal (sección 6 del documento de arquitectura).
 *
 * Un hábito semanal tiene dos números: `objetivo` y `minimo`. El color de la
 * semana sale de comparar lo hecho contra esos dos.
 */

import { describe, expect, it } from 'vitest'

import { claveSemana, diasDeLaSemana } from './fechas'
import { colorDeSemana, evaluarSemana, hechosDeSemana } from './semaforo'
import { cumplidos, habitoSemanal } from './pruebas/fabricas'

/** Una semana cualquiera de 2026, de lunes a domingo. */
const DIAS = diasDeLaSemana('2026-09-16')
const CLAVE = claveSemana('2026-09-16')

describe('el color de una semana', () => {
  it('es verde cuando se cumple el objetivo: 5 de 5', () => {
    expect(colorDeSemana(5, 5, 3)).toBe('verde')
  })

  it('también es verde si se hace de más: 6 de 5', () => {
    expect(colorDeSemana(6, 5, 3)).toBe('verde')
  })

  it('es ámbar cuando se queda corto pero llega al mínimo: 4 de 5', () => {
    expect(colorDeSemana(4, 5, 3)).toBe('ambar')
  })

  it('es ámbar justo en el mínimo: 3 de 5 con mínimo 3', () => {
    expect(colorDeSemana(3, 5, 3)).toBe('ambar')
  })

  it('es rojo cuando no llega al mínimo: 2 de 5 con mínimo 3', () => {
    expect(colorDeSemana(2, 5, 3)).toBe('rojo')
  })

  it('es rojo si no se hizo nada', () => {
    expect(colorDeSemana(0, 5, 3)).toBe('rojo')
  })
})

describe('al cerrar una semana', () => {
  const habito = habitoSemanal('2026-01-01', 5, 3)

  it('cuenta los días cumplidos de esa semana y le pone color', () => {
    const registros = cumplidos(habito.id, DIAS.slice(0, 5))
    const semana = evaluarSemana(habito, CLAVE, registros)

    expect(semana.hechos).toBe(5)
    expect(semana.color).toBe('verde')
    expect(semana.cerrada).toBe(true)
  })

  it('congela el objetivo y el mínimo que estaban vigentes ese día', () => {
    const semana = evaluarSemana(habito, CLAVE, cumplidos(habito.id, DIAS.slice(0, 4)))

    expect(semana.objetivo).toBe(5)
    expect(semana.minimo).toBe(3)
    expect(semana.color).toBe('ambar')
  })

  it('ignora los días cumplidos de otras semanas', () => {
    const otraSemana = diasDeLaSemana('2026-09-09')
    const registros = [...cumplidos(habito.id, DIAS.slice(0, 2)), ...cumplidos(habito.id, otraSemana)]

    expect(evaluarSemana(habito, CLAVE, registros).hechos).toBe(2)
  })

  it('ignora los registros de otros hábitos', () => {
    const registros = [...cumplidos(habito.id, DIAS.slice(0, 2)), ...cumplidos('otro-habito', DIAS)]

    expect(evaluarSemana(habito, CLAVE, registros).hechos).toBe(2)
  })

  it('no cuenta días anteriores a la creación del hábito', () => {
    const reciente = habitoSemanal(DIAS[3] ?? '', 5, 3)
    const semana = evaluarSemana(reciente, CLAVE, cumplidos(reciente.id, DIAS))

    expect(semana.hechos).toBe(4)
  })
})

describe('lo hecho en la semana en curso', () => {
  const habito = habitoSemanal('2026-01-01', 5, 3)

  it('cuenta las marcas que lleva la semana, sin juzgarla todavía', () => {
    const registros = cumplidos(habito.id, DIAS.slice(0, 3))

    expect(hechosDeSemana(habito, CLAVE, registros)).toBe(3)
  })

  it('una semana sin marcas lleva cero, y eso no la pinta de rojo', () => {
    expect(hechosDeSemana(habito, CLAVE, [])).toBe(0)
  })

  it('es el mismo número que usa el veredicto al cerrar la semana', () => {
    const registros = cumplidos(habito.id, DIAS.slice(0, 4))

    expect(hechosDeSemana(habito, CLAVE, registros)).toBe(evaluarSemana(habito, CLAVE, registros).hechos)
  })
})
