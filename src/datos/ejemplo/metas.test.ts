/**
 * Pruebas de las dos metas de ejemplo.
 *
 * No prueban lógica: prueban **los datos**. Existen porque una instalación
 * nueva siembra estas metas y un número mal tecleado aquí no lo atraparía
 * ninguna otra prueba; se vería meses después, en una gráfica que va a una
 * fecha que nadie eligió.
 *
 * Son los números de la sección 11 del documento, escritos a mano en las dos
 * puntas: si alguien cambia el archivo de datos, esta prueba se queja.
 */

import { describe, expect, it } from 'vitest'

import { medicionesIniciales, metasIniciales } from './metas'
import { habitosDeEjemplo } from './habitos'

const HABITOS = habitosDeEjemplo()
const METAS = metasIniciales(HABITOS)
const PESO = METAS.find((meta) => meta.id === 'peso')
const INGLES = METAS.find((meta) => meta.id === 'ingles')

describe('la meta de peso', () => {
  it('va de 80 kg el 15 de septiembre a 72 kg el 14 de abril', () => {
    expect(PESO?.fechaInicio).toBe('2026-09-15')
    expect(PESO?.fechaObjetivo).toBe('2027-04-14')
    expect(PESO?.valorInicial).toBe(80)
    expect(PESO?.valorObjetivo).toBe(72)
    expect(PESO?.unidad).toBe('kg')
    expect(PESO?.direccion).toBe('bajar')
  })

  it('mide peso, cintura, pecho y cuello, en ese orden', () => {
    expect(PESO?.campos.map((campo) => campo.clave)).toEqual(['peso', 'cintura', 'pecho', 'cuello'])
  })

  it('se mide los domingos', () => {
    expect(PESO?.frecuencia).toBe('semanal')
    expect(PESO?.diaDeMedicion).toBe(6)
  })

  it('tiene el hito de la mitad del camino en 76 kg el 29 de diciembre', () => {
    expect(PESO?.hitos).toEqual([{ nombre: 'Mitad del camino', fecha: '2026-12-29', valor: 76 }])
  })

  it('está vinculada al gym, al refresco y al postre', () => {
    expect(PESO?.habitosVinculados).toEqual(['gym', 'sin-refresco', 'sin-postre'])
  })
})

describe('la meta de inglés', () => {
  it('va de 50 puntos provisionales el 1 de octubre a 70 el 15 de septiembre', () => {
    expect(INGLES?.fechaInicio).toBe('2026-10-01')
    expect(INGLES?.fechaObjetivo).toBe('2027-09-15')
    expect(INGLES?.valorInicial).toBe(50)
    expect(INGLES?.valorObjetivo).toBe(70)
    expect(INGLES?.unidad).toBe('puntos')
    expect(INGLES?.direccion).toBe('subir')
  })

  it('mide un solo campo y es mensual, sin día fijo', () => {
    expect(INGLES?.campos.map((campo) => campo.clave)).toEqual(['puntaje'])
    expect(INGLES?.frecuencia).toBe('mensual')
    expect(INGLES?.diaDeMedicion).toBe(null)
  })

  it('tiene el hito de B1 confirmado en 58 puntos el 15 de marzo', () => {
    expect(INGLES?.hitos).toEqual([{ nombre: 'B1 confirmado', fecha: '2027-03-15', valor: 58 }])
  })

  it('está vinculada al hábito de inglés', () => {
    expect(INGLES?.habitosVinculados).toEqual(['ingles'])
  })
})

describe('las mediciones de una instalación nueva', () => {
  it('son una sola: la pesada de ejemplo del 15 de septiembre', () => {
    const mediciones = medicionesIniciales(METAS)

    expect(mediciones).toHaveLength(1)
    expect(mediciones[0]?.fecha).toBe('2026-09-15')
    expect(mediciones[0]?.momento).toBe('manana')
    expect(mediciones[0]?.valores).toEqual({ peso: 80 })
  })

  it('no trae ninguna medición inventada de inglés', () => {
    expect(medicionesIniciales(METAS).some((medicion) => medicion.metaId === 'ingles')).toBe(false)
  })

  it('las dos metas nacen activas', () => {
    expect(METAS.map((meta) => meta.estado)).toEqual(['activa', 'activa'])
    expect(METAS).toHaveLength(2)
  })
})
