/**
 * Las reglas 1 y 2 de altas y bajas de la sección 9: el alta y la edición.
 *
 * Las otras dos —archivar y eliminar— viven en `bajas.test.ts`. Cada prueba
 * dice en su título qué promete la app, para que se pueda leer y auditar sin
 * saber programar (regla 10).
 */

import { describe, expect, it } from 'vitest'

import { conCambios, nuevoHabito } from './altas'
import { semanasPorCerrar } from './cierre'
import { rachaDe, rachaDiaria } from './rachas'
import { cumplidos, habitoDiario, habitoSemanal, semanaDe } from './pruebas/fabricas'
import type { CamposDeHabito } from './altas'

const HOY = '2026-09-17'

/** Los campos que entrega el formulario. Cada prueba cambia lo que le importa. */
function campos(cambios: Partial<CamposDeHabito> = {}): CamposDeHabito {
  return {
    nombre: 'Correr',
    icono: '🏃',
    privado: false,
    alias: null,
    tipo: 'positivo',
    cadencia: 'diaria',
    objetivo: null,
    minimo: null,
    permiteComodin: true,
    contextos: [],
    ...cambios,
  }
}

// ---------------------------------------------------------------------------

describe('regla 1 · un hábito nuevo cuenta desde su creadoEn', () => {
  it('nace con la fecha de hoy y sin archivar', () => {
    const habito = nuevoHabito(campos(), [], HOY, 'nuevo')

    expect(habito.creadoEn).toBe(HOY)
    expect(habito.archivadoEn).toBe(null)
    expect(habito.revividoEn).toBe(null)
  })

  it('un hábito creado hoy todavía no tiene racha', () => {
    const habito = nuevoHabito(campos(), [], HOY, 'nuevo')

    expect(rachaDe(habito, { registros: [], semanas: [], comodines: [] }, HOY).actual).toBe(0)
  })

  it('no inventa fallas de los días en que no existía', () => {
    // Nació anteayer y lleva sus dos días marcados: racha de dos.
    const nuevo = habitoDiario('2026-09-15')
    const registros = cumplidos(nuevo.id, ['2026-09-15', '2026-09-16'])

    expect(rachaDiaria(nuevo, registros, HOY).actual).toBe(2)

    // El mismo hábito con un solo día marcado, el de ayer: la racha es de uno,
    // no de menos. Los días anteriores a su alta ni se miran.
    const ayerNomas = habitoDiario('2026-09-16')
    expect(rachaDiaria(ayerNomas, cumplidos(ayerNomas.id, ['2026-09-16']), HOY).actual).toBe(1)
  })

  it('no le cierra semanas anteriores a su alta', () => {
    const habito = habitoSemanal('2026-09-07', 5, 4)
    const semanas = semanasPorCerrar([habito], [], [], HOY)

    // Solo se juzga la semana del 7 al 13, la primera que vivió completa.
    expect(semanas).toHaveLength(1)
    expect(semanas[0]?.id).toBe(`${habito.id}:2026-W37`)
  })
})

// ---------------------------------------------------------------------------

describe('regla 2 · cambiar objetivo o mínimo no reescribe semanas cerradas', () => {
  const habito = habitoSemanal('2026-08-31', 5, 4)
  const cerrada = semanaDe(habito.id, '2026-09-07', 'verde', { hechos: 5, objetivo: 5, minimo: 4 })

  it('el veredicto guardado conserva el objetivo con el que se cerró', () => {
    const exigente = conCambios(habito, campos({ cadencia: 'semanal', objetivo: 7, minimo: 6 }))

    // El hábito ya pide siete, pero la semana pasada se cerró pidiendo cinco y
    // sigue verde: hizo las cinco que se le pedían entonces.
    expect(exigente.objetivo).toBe(7)
    expect(cerrada.objetivo).toBe(5)
    expect(cerrada.color).toBe('verde')
  })

  it('no vuelve a juzgar una semana que ya tiene veredicto', () => {
    const exigente = conCambios(habito, campos({ cadencia: 'semanal', objetivo: 7, minimo: 6 }))
    const pendientes = semanasPorCerrar([exigente], [], [cerrada], '2026-09-14')

    expect(pendientes.map((semana) => semana.id)).not.toContain(cerrada.id)
  })

  it('editar no mueve la fecha de alta, ni el tipo, ni la cadencia', () => {
    const editado = conCambios(habito, campos({ nombre: 'Gym', tipo: 'negativo', cadencia: 'diaria' }))

    expect(editado.creadoEn).toBe(habito.creadoEn)
    expect(editado.tipo).toBe('positivo')
    expect(editado.cadencia).toBe('semanal')
    expect(editado.nombre).toBe('Gym')
  })
})

