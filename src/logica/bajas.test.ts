/**
 * Las reglas 3 y 4 de altas y bajas de la sección 9: archivar y eliminar.
 *
 * Las otras dos —el alta y la edición— viven en `altas.test.ts`. Se parten en
 * dos archivos porque ninguno pasa de doscientos renglones (regla 4), y porque
 * de todos modos son dos cosas distintas: dar de alta y dar de baja.
 */

import { describe, expect, it } from 'vitest'

import { archivado, confirmacionCorrecta, revivido, sinElHabito } from './altas'
import { rachaDe } from './rachas'
import { comodin, cumplidos, habitoDiario, habitoNegativo, recaida, semanaDe } from './pruebas/fabricas'

const HOY = '2026-09-17'


describe('regla 3 · archivar conserva todo y se puede revivir', () => {
  const habito = habitoNegativo('2026-01-01')
  const datos = {
    registros: [recaida(habito.id, '2026-06-10')],
    semanas: [semanaDe(habito.id, '2026-06-01', 'verde')],
    comodines: [comodin(habito.id, '2026-06-15')],
  }

  it('archivar no borra registros, semanas ni comodines', () => {
    const guardado = archivado(habito, 99, '2026-07-01')

    expect(guardado.archivadoEn).toBe('2026-07-01')
    expect(datos.registros).toHaveLength(1)
    expect(datos.semanas).toHaveLength(1)
    expect(datos.comodines).toHaveLength(1)
  })

  it('archivar congela la mejor racha del momento', () => {
    // Del 11 al 30 de junio van veinte días limpios.
    const antes = rachaDe(habito, datos, '2026-07-01')
    const guardado = archivado(habito, antes.mejor, '2026-07-01')

    expect(antes.mejor).toBe(160)
    expect(guardado.mejorRachaPrevia).toBe(160)
  })

  it('un hábito archivado deja de acumular días', () => {
    const guardado = archivado(habito, 160, '2026-07-01')

    // Pasaron dos meses y medio desde que se archivó y el contador no se movió.
    expect(rachaDe(guardado, datos, HOY).actual).toBe(20)
  })

  it('revivir arranca la racha en cero y conserva la mejor', () => {
    const guardado = archivado(habito, 160, '2026-07-01')
    const revivio = revivido(guardado, HOY)
    const despues = rachaDe(revivio, datos, HOY)

    expect(revivio.archivadoEn).toBe(null)
    expect(revivio.revividoEn).toBe(HOY)
    expect(despues.actual).toBe(0)
    expect(despues.mejor).toBe(160)
  })

  it('al revivir no cuenta como limpios los meses que estuvo guardado', () => {
    const revivio = revivido(archivado(habito, 160, '2026-07-01'), '2026-09-10')

    // Del 10 al 16 de septiembre: siete días. Los dos meses archivado no entran.
    expect(rachaDe(revivio, datos, HOY).actual).toBe(7)
  })
})

// ---------------------------------------------------------------------------

describe('regla 4 · eliminar borra todo y pide escribir el nombre', () => {
  const habito = habitoDiario('2026-01-01')
  const otro = habitoDiario('2026-01-01', { id: 'otro' })

  it('borra el hábito y todo su historial, y no toca el de los demás', () => {
    const rastro = {
      habitos: [habito, otro],
      registros: [...cumplidos(habito.id, ['2026-09-01']), ...cumplidos(otro.id, ['2026-09-01'])],
      semanas: [semanaDe(habito.id, '2026-09-01', 'verde'), semanaDe(otro.id, '2026-09-01', 'verde')],
      comodines: [comodin(habito.id, '2026-09-02'), comodin(otro.id, '2026-09-02')],
    }

    const despues = sinElHabito(rastro, habito.id)

    expect(despues.habitos.map((uno) => uno.id)).toEqual(['otro'])
    expect(despues.registros.every((registro) => registro.habitoId === 'otro')).toBe(true)
    expect(despues.semanas.every((semana) => semana.habitoId === 'otro')).toBe(true)
    expect(despues.comodines.every((uno) => uno.habitoId === 'otro')).toBe(true)
  })

  it('no se elimina si lo escrito no es el nombre', () => {
    const correr = habitoDiario('2026-01-01', { nombre: 'Correr' })

    expect(confirmacionCorrecta(correr, '')).toBe(false)
    expect(confirmacionCorrecta(correr, 'corre')).toBe(false)
    expect(confirmacionCorrecta(correr, 'Correr')).toBe(true)
  })

  it('perdona mayúsculas y espacios de sobra', () => {
    const gym = habitoDiario('2026-01-01', { nombre: 'Ir al gym' })

    expect(confirmacionCorrecta(gym, '  ir al   GYM ')).toBe(true)
  })

  it('en un hábito privado pide el alias, no el nombre real', () => {
    const privado = habitoDiario('2026-01-01', { nombre: 'Nombre real', privado: true, alias: 'Rutina' })

    expect(confirmacionCorrecta(privado, 'Rutina')).toBe(true)
    expect(confirmacionCorrecta(privado, 'Nombre real')).toBe(false)
    // Con el interruptor de nombres reales prendido, lo que se ve es el real.
    expect(confirmacionCorrecta(privado, 'Nombre real', true)).toBe(true)
  })
})
