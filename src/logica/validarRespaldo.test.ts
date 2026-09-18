/**
 * Pruebas de la revisión de un respaldo antes de importarlo (sección 14).
 *
 * Es el único lugar por donde entran datos de fuera, así que estas pruebas son
 * casi todas de cosas que **no** deben pasar. La regla de oro es la misma en
 * todas: si algo no cuadra, no se escribe nada.
 */

import { describe, expect, it } from 'vitest'

import { armarRespaldo, aTexto } from './respaldo'
import { revisarRespaldo } from './validarRespaldo'
import { documentoDePrueba } from './pruebas/documentos'

const HOY = '2026-09-18'

/** Un respaldo bueno, escrito tal como lo escribe la app. */
function respaldoBueno(): string {
  return aTexto(armarRespaldo(documentoDePrueba(), HOY))
}

describe('lo que no se deja importar', () => {
  it('un texto vacío', () => {
    const revision = revisarRespaldo('   ')

    expect(revision.ok).toBe(false)
    if (!revision.ok) expect(revision.problema).toContain('No hay nada que importar')
  })

  it('un archivo que no es JSON', () => {
    const revision = revisarRespaldo('esto no es un respaldo')

    expect(revision.ok).toBe(false)
    if (!revision.ok) expect(revision.problema).toContain('no se pudo leer')
  })

  it('un respaldo cortado a la mitad', () => {
    const revision = revisarRespaldo(respaldoBueno().slice(0, 80))

    expect(revision.ok).toBe(false)
  })

  it('el respaldo de otra app', () => {
    const revision = revisarRespaldo(JSON.stringify({ app: 'otra', version: 1, documento: documentoDePrueba() }))

    expect(revision.ok).toBe(false)
    if (!revision.ok) expect(revision.problema).toContain('otra app')
  })

  it('un respaldo de una versión más nueva', () => {
    const sobre = { ...armarRespaldo(documentoDePrueba(), HOY), version: 2 }
    const revision = revisarRespaldo(JSON.stringify(sobre))

    expect(revision.ok).toBe(false)
    if (!revision.ok) expect(revision.problema).toContain('más nueva')
  })

  it('un respaldo sin versión: no se puede saber de dónde viene', () => {
    const documento = documentoDePrueba()
    const sinVersion = { app: 'racha', creadoEn: HOY, documento: { ...documento, ajustes: { tema: 'claro' } } }
    const revision = revisarRespaldo(JSON.stringify(sinVersion))

    expect(revision.ok).toBe(false)
    if (!revision.ok) expect(revision.problema).toContain('versión')
  })

  it('un respaldo al que le falta una lista', () => {
    const sobre = armarRespaldo(documentoDePrueba(), HOY)
    const sinMetas = { ...sobre, documento: { ...sobre.documento, metas: undefined } }
    const revision = revisarRespaldo(JSON.stringify(sinMetas))

    expect(revision.ok).toBe(false)
    if (!revision.ok) expect(revision.problema).toContain('las metas')
  })

  it('un respaldo sin ajustes', () => {
    const sobre = armarRespaldo(documentoDePrueba(), HOY)
    const sinAjustes = { ...sobre, version: 1, documento: { ...sobre.documento, ajustes: undefined } }
    const revision = revisarRespaldo(JSON.stringify(sinAjustes))

    expect(revision.ok).toBe(false)
  })

  it('una lista que no es una lista', () => {
    const sobre = armarRespaldo(documentoDePrueba(), HOY)
    const torcido = { ...sobre, documento: { ...sobre.documento, habitos: 'muchos' } }

    expect(revisarRespaldo(JSON.stringify(torcido)).ok).toBe(false)
  })
})

describe('lo que sí se deja importar', () => {
  it('un respaldo escrito por esta misma app', () => {
    const documento = documentoDePrueba()
    const revision = revisarRespaldo(aTexto(armarRespaldo(documento, HOY)))

    expect(revision.ok).toBe(true)
    if (revision.ok) {
      expect(revision.documento).toEqual(documento)
      expect(revision.creadoEn).toBe(HOY)
    }
  })

  it('un documento pelón, sin sobre: la versión se busca en sus ajustes', () => {
    const documento = documentoDePrueba()
    const revision = revisarRespaldo(JSON.stringify(documento))

    expect(revision.ok).toBe(true)
    if (revision.ok) {
      expect(revision.documento.habitos).toHaveLength(1)
      expect(revision.creadoEn).toBeNull()
    }
  })

  it('un respaldo viejo sin la lista de comodines, que se rellena vacía', () => {
    const sobre = armarRespaldo(documentoDePrueba(), HOY)
    const viejo = { ...sobre, documento: { ...sobre.documento, comodines: undefined } }
    const revision = revisarRespaldo(JSON.stringify(viejo))

    expect(revision.ok).toBe(true)
    if (revision.ok) expect(revision.documento.comodines).toEqual([])
  })
})
