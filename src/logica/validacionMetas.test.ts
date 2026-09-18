/**
 * Pruebas de lo que el formulario de una meta revisa antes de guardar.
 *
 * El caso que más importa es el de la dirección: una meta que dice «bajar» pero
 * cuyo objetivo está más arriba del punto de partida haría que la app dijera
 * «vas adelantado» justo cuando vas atrás. Por eso no se deja guardar.
 */

import { describe, expect, it } from 'vitest'

import { problemasDeMeta } from './validacionMetas'
import type { CamposDeMeta } from './metasAltas'

function campos(cambios: Partial<CamposDeMeta> = {}): CamposDeMeta {
  return {
    nombre: 'Peso',
    fechaInicio: '2026-09-15',
    fechaObjetivo: '2027-04-14',
    valorInicial: 82,
    valorObjetivo: 75,
    unidad: 'kg',
    direccion: 'bajar',
    campos: [{ clave: 'peso', etiqueta: 'Peso', unidad: 'kg' }],
    hitos: [],
    habitosVinculados: [],
    frecuencia: 'semanal',
    ...cambios,
  }
}

describe('lo que se revisa antes de guardar una meta', () => {
  it('una meta bien puesta no tiene ningún problema', () => {
    expect(problemasDeMeta(campos())).toEqual([])
  })

  it('pide nombre y unidad', () => {
    expect(problemasDeMeta(campos({ nombre: '   ' }))).toContain('Ponle un nombre.')
    expect(problemasDeMeta(campos({ unidad: '' }))).toContain('Ponle una unidad: kg, puntos, páginas…')
  })

  it('pide al menos un campo que medir', () => {
    expect(problemasDeMeta(campos({ campos: [] }))).toContain('Necesita al menos un campo que medir.')
  })

  it('no deja dos campos con el mismo nombre', () => {
    const repetidos = campos({
      campos: [
        { clave: 'peso', etiqueta: 'Peso', unidad: 'kg' },
        { clave: 'peso', etiqueta: 'Peso otra vez', unidad: 'kg' },
      ],
    })

    expect(problemasDeMeta(repetidos)).toContain('Hay dos campos con el mismo nombre.')
  })

  it('no deja fechas al revés', () => {
    const alReves = campos({ fechaInicio: '2027-04-14', fechaObjetivo: '2026-09-15' })

    expect(problemasDeMeta(alReves)).toContain('La fecha objetivo tiene que ser posterior a la de inicio.')
  })

  it('no deja que el objetivo sea igual al punto de partida', () => {
    const plana = campos({ valorInicial: 82, valorObjetivo: 82 })

    expect(problemasDeMeta(plana)).toContain('El objetivo no puede ser igual al punto de partida.')
  })

  it('no deja una meta que dice bajar y sube', () => {
    const contradictoria = campos({ direccion: 'bajar', valorInicial: 75, valorObjetivo: 82 })

    expect(problemasDeMeta(contradictoria)).toContain(
      'La meta dice «bajar», pero el objetivo es más alto que el punto de partida.',
    )
  })

  it('no deja una meta que dice subir y baja', () => {
    const contradictoria = campos({ direccion: 'subir', valorInicial: 70, valorObjetivo: 50 })

    expect(problemasDeMeta(contradictoria)).toContain(
      'La meta dice «subir», pero el objetivo es más bajo que el punto de partida.',
    )
  })

  it('no deja un hito fuera de las fechas de la meta', () => {
    const fuera = campos({ hitos: [{ nombre: 'Mitad del camino', fecha: '2028-01-01', valor: 75.7 }] })

    expect(problemasDeMeta(fuera)).toContain('El hito «Mitad del camino» cae fuera de las fechas de la meta.')
  })

  it('un hito dentro de las fechas pasa sin ruido', () => {
    const dentro = campos({ hitos: [{ nombre: 'Mitad del camino', fecha: '2027-03-24', valor: 75.7 }] })

    expect(problemasDeMeta(dentro)).toEqual([])
  })

  it('una meta sin hitos y sin hábitos vinculados se guarda sin problema', () => {
    expect(problemasDeMeta(campos({ hitos: [], habitosVinculados: [] }))).toEqual([])
  })
})
