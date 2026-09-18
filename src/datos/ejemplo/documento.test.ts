/**
 * Pruebas del documento en limpio: el que deja el botón de «borrar todo»
 * (sección 14).
 *
 * La prueba que importa de verdad es la última. Vaciar las listas de historial
 * no basta: si los hábitos conservaran su fecha de nacimiento original —setenta
 * y siete días atrás, donde arranca el historial de ejemplo— la app, al
 * abrirse, cerraría once semanas pasadas y las once saldrían rojas, porque un
 * hábito sin un solo día marcado no cumple ningún objetivo. Serían las semanas
 * inventadas que este botón existe para no dejar.
 *
 * El reloj se finge en un viernes concreto para que las pruebas den lo mismo el
 * día que se corran. Corriendo en lunes, por ejemplo, las cuentas cambian.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { documentoEnLimpio } from './documento'
import { semanasPorCerrar } from '../../logica/cierre'
import { hoy } from '../../logica/fechas'

/** Viernes 18 de septiembre de 2026, a mediodía. */
const VIERNES = new Date(2026, 8, 18, 12, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(VIERNES)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('lo que deja puesto', () => {
  it('los ocho hábitos y las dos metas', () => {
    const documento = documentoEnLimpio()

    expect(documento.habitos).toHaveLength(8)
    expect(documento.metas).toHaveLength(2)
  })

  it('las metas siguen vinculadas a sus hábitos', () => {
    const peso = documentoEnLimpio().metas.find((meta) => meta.id === 'peso')

    expect(peso?.habitosVinculados).toContain('gym')
  })
})

describe('lo que no deja', () => {
  it('ni un día registrado, ni una semana, ni un comodín, ni una medición', () => {
    const documento = documentoEnLimpio()

    expect(documento.registros).toEqual([])
    expect(documento.semanas).toEqual([])
    expect(documento.comodines).toEqual([])
    expect(documento.mediciones).toEqual([])
  })
})

describe('las fechas de nacimiento', () => {
  it('todos los hábitos nacen hoy, no cuando nacían los de ejemplo', () => {
    const documento = documentoEnLimpio()

    expect(documento.habitos.every((habito) => habito.creadoEn === hoy())).toBe(true)
    expect(hoy()).toBe('2026-09-18')
  })

  it('ninguno viene archivado ni revivido', () => {
    const documento = documentoEnLimpio()

    expect(documento.habitos.every((habito) => habito.archivadoEn === null)).toBe(true)
    expect(documento.habitos.every((habito) => habito.mejorRachaPrevia === null)).toBe(true)
  })
})

describe('las semanas que la app cerraría al abrirse', () => {
  it('ninguna: no hereda ni una sola semana roja inventada', () => {
    const documento = documentoEnLimpio()

    expect(semanasPorCerrar(documento.habitos, documento.registros, documento.semanas, hoy())).toEqual([])
  })

  it('tampoco la semana a medias en que se borró todo, cuando termine', () => {
    // Lunes 21. La semana del 14 al 20 quedó a medias —los hábitos nacieron el
    // viernes 18— y una semana a medias no se juzga nunca (sección 9).
    const documento = documentoEnLimpio()

    expect(
      semanasPorCerrar(documento.habitos, documento.registros, documento.semanas, '2026-09-21'),
    ).toEqual([])
  })

  it('la primera que sí se juzga es la del lunes siguiente, ya vivida completa', () => {
    // Lunes 28: la semana del 21 al 27 fue la primera completa. Sale roja
    // porque en esta prueba nadie marcó nada, y eso está bien: es una semana
    // real que pasó, no una inventada.
    const documento = documentoEnLimpio()
    const cerradas = semanasPorCerrar(documento.habitos, documento.registros, documento.semanas, '2026-09-28')

    // Los tres hábitos positivos semanales; los negativos no llevan semáforo.
    expect(cerradas).toHaveLength(3)
    expect(cerradas.every((semana) => semana.color === 'rojo')).toBe(true)
  })
})
