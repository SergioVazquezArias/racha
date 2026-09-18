/**
 * Pruebas de la vida de un hábito: desde cuándo cuenta y hasta cuándo.
 *
 * Es el cimiento de todas las demás cuentas —rachas, porcentajes, mapa de
 * calor— así que se prueba solo, aparte: si estas cuatro fechas están mal,
 * todo lo de arriba está mal y no se nota.
 */

import { describe, expect, it } from 'vitest'

import { cuentaElDia, diasQueCuentan, finDeConteo, inicioDeConteo } from './vida'
import { archivado, revivido } from './altas'
import { habitoDiario } from './pruebas/fabricas'

const HOY = '2026-09-17'

describe('desde cuándo cuenta un hábito', () => {
  it('desde su alta, si nunca se archivó', () => {
    expect(inicioDeConteo(habitoDiario('2026-09-01'))).toBe('2026-09-01')
  })

  it('desde su vuelta, si se archivó y revivió', () => {
    const revivio = revivido(archivado(habitoDiario('2026-01-01'), 10, '2026-06-01'), '2026-09-10')

    expect(inicioDeConteo(revivio)).toBe('2026-09-10')
  })
})

describe('hasta cuándo cuenta un hábito', () => {
  it('hasta ayer: el día de hoy no se juzga hasta la medianoche', () => {
    expect(finDeConteo(habitoDiario('2026-01-01'), HOY)).toBe('2026-09-16')
  })

  it('hasta la víspera del archivado, si está guardado', () => {
    const guardado = archivado(habitoDiario('2026-01-01'), 10, '2026-09-10')

    expect(finDeConteo(guardado, HOY)).toBe('2026-09-09')
  })
})

describe('qué días cuentan', () => {
  const habito = habitoDiario('2026-09-10')

  it('ni antes del alta, ni hoy, ni mañana', () => {
    expect(cuentaElDia(habito, '2026-09-09', HOY)).toBe(false)
    expect(cuentaElDia(habito, '2026-09-10', HOY)).toBe(true)
    expect(cuentaElDia(habito, '2026-09-16', HOY)).toBe(true)
    expect(cuentaElDia(habito, HOY, HOY)).toBe(false)
    expect(cuentaElDia(habito, '2026-09-18', HOY)).toBe(false)
  })

  it('cuenta los días que lleva vivo, sin contar hoy', () => {
    expect(diasQueCuentan(habito, HOY)).toBe(7)
  })

  it('un hábito creado hoy todavía no lleva ningún día', () => {
    expect(diasQueCuentan(habitoDiario(HOY), HOY)).toBe(0)
  })
})
