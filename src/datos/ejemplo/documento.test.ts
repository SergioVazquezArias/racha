/**
 * Pruebas de los dos documentos que la app puede armar sola: el vacío —que es
 * lo que deja el botón de «borrar todo» (sección 14)— y el de ejemplo, que se
 * siembra la primera vez que la app se abre en un teléfono nuevo.
 *
 * Lo que vigilan es que esos dos sigan siendo cosas distintas. Borrar tiene que
 * dejar la app en blanco: si volviera a sembrar los ocho hábitos de ejemplo
 * —que es lo que hacía antes— el botón parecería no hacer nada, porque los
 * nombres reaparecen idénticos.
 *
 * Y las últimas dos prueban lo de siempre: que al abrirse, la app no cierre
 * semanas que nadie vivió.
 *
 * El reloj se finge en un viernes concreto para que las pruebas den lo mismo el
 * día que se corran. Corriendo en lunes, por ejemplo, las cuentas cambian.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { documentoDeEjemplo, documentoVacio } from './documento'
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

describe('el documento vacío, que es lo que deja borrar todo', () => {
  it('no deja ni un hábito ni una meta', () => {
    const documento = documentoVacio()

    expect(documento.habitos).toEqual([])
    expect(documento.metas).toEqual([])
  })

  it('tampoco un día registrado, ni una semana, ni un comodín, ni una medición', () => {
    const documento = documentoVacio()

    expect(documento.registros).toEqual([])
    expect(documento.semanas).toEqual([])
    expect(documento.comodines).toEqual([])
    expect(documento.mediciones).toEqual([])
  })

  it('devuelve los ajustes de fábrica', () => {
    expect(documentoVacio().ajustes.tema).toBe('sistema')
    expect(documentoVacio().ajustes.ultimoRespaldo).toBeNull()
  })

  it('no le queda nada que cerrar al abrirse la app', () => {
    const documento = documentoVacio()

    expect(semanasPorCerrar(documento.habitos, documento.registros, documento.semanas, hoy())).toEqual([])
  })
})

describe('el documento de ejemplo, que es lo de una instalación nueva', () => {
  it('sí trae los ocho hábitos y las dos metas', () => {
    const documento = documentoDeEjemplo()

    expect(documento.habitos).toHaveLength(8)
    expect(documento.metas).toHaveLength(2)
  })

  it('las metas vienen vinculadas a sus hábitos', () => {
    const peso = documentoDeEjemplo().metas.find((meta) => meta.id === 'peso')

    expect(peso?.habitosVinculados).toContain('gym')
  })

  it('trae su historial ya cerrado: la app no inventa ninguna semana al abrirse', () => {
    const documento = documentoDeEjemplo()

    expect(semanasPorCerrar(documento.habitos, documento.registros, documento.semanas, hoy())).toEqual([])
  })
})
