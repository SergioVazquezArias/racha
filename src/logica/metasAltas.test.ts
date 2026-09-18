/**
 * Pruebas de crear, editar y cerrar una meta, y de capturar una medición.
 *
 * Lo que se cuida: que cerrar una meta guarde cómo y cuándo, que editar una
 * meta cerrada no la reviva por accidente, que para eliminar haya que escribir
 * el nombre de verdad, y que una medición a medias guarde solo lo que se
 * llenó, porque un campo vacío no es un cero.
 */

import { describe, expect, it } from 'vitest'

import {
  cerrada,
  conCambios,
  confirmacionCorrecta,
  medicionDelDia,
  nuevaMedicion,
  nuevaMeta,
  reabierta,
} from './metasAltas'
import { medicion, metaDePeso } from './pruebas/fabricas'
import type { CamposDeMeta } from './metasAltas'

/** Los campos tal como salen del formulario. */
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
    diaDeMedicion: 6,
    ...cambios,
  }
}

describe('crear una meta', () => {
  it('nace activa y sin fecha de cierre', () => {
    const meta = nuevaMeta(campos(), 'id-1')

    expect(meta.estado).toBe('activa')
    expect(meta.cerradaEn).toBe(null)
    expect(meta.valorInicial).toBe(82)
  })

  it('le quita los espacios de sobra al nombre y a la unidad', () => {
    const meta = nuevaMeta(campos({ nombre: '  Peso  ', unidad: ' kg ' }), 'id-2')

    expect(meta.nombre).toBe('Peso')
    expect(meta.unidad).toBe('kg')
  })

  it('guarda los hitos ordenados por fecha, lleguen como lleguen', () => {
    const meta = nuevaMeta(
      campos({
        hitos: [
          { nombre: 'Segundo', fecha: '2027-03-24', valor: 75.7 },
          { nombre: 'Primero', fecha: '2026-12-01', valor: 79 },
        ],
      }),
      'id-3',
    )

    expect(meta.hitos.map((hito) => hito.nombre)).toEqual(['Primero', 'Segundo'])
  })
})

describe('cerrar una meta', () => {
  it('cumplida guarda el día en que se cerró', () => {
    const meta = cerrada(metaDePeso(), 'cumplida', '2027-04-10')

    expect(meta.estado).toBe('cumplida')
    expect(meta.cerradaEn).toBe('2027-04-10')
  })

  it('abandonada también deja fecha: es una decisión, no un borrón', () => {
    const meta = cerrada(metaDePeso(), 'abandonada', '2026-11-30')

    expect(meta.estado).toBe('abandonada')
    expect(meta.cerradaEn).toBe('2026-11-30')
  })

  it('editar una meta cerrada no la revive', () => {
    const meta = cerrada(metaDePeso(), 'cumplida', '2027-04-10')
    const editada = conCambios(meta, campos({ nombre: 'Peso corporal' }))

    expect(editada.nombre).toBe('Peso corporal')
    expect(editada.estado).toBe('cumplida')
    expect(editada.cerradaEn).toBe('2027-04-10')
  })

  it('reabrir sí la revive y le borra la fecha de cierre', () => {
    const meta = reabierta(cerrada(metaDePeso(), 'abandonada', '2026-11-30'))

    expect(meta.estado).toBe('activa')
    expect(meta.cerradaEn).toBe(null)
  })

  it('editar conserva el id', () => {
    const meta = metaDePeso()

    expect(conCambios(meta, campos()).id).toBe(meta.id)
  })
})

describe('la confirmación para eliminar', () => {
  const meta = metaDePeso()

  it('acepta el nombre exacto', () => {
    expect(confirmacionCorrecta(meta, 'Peso')).toBe(true)
  })

  it('perdona mayúsculas y espacios de sobra, que el teclado los cuela solos', () => {
    expect(confirmacionCorrecta(meta, '  peso ')).toBe(true)
    expect(confirmacionCorrecta(meta, 'PESO')).toBe(true)
  })

  it('no acepta cualquier otra cosa', () => {
    expect(confirmacionCorrecta(meta, 'pes')).toBe(false)
    expect(confirmacionCorrecta(meta, '')).toBe(false)
  })
})

describe('capturar una medición', () => {
  it('guarda solo los campos que se llenaron', () => {
    const una = nuevaMedicion('peso', '2026-09-15', 'manana', {
      peso: 82,
      cintura: null,
      pecho: null,
      cuello: null,
    })

    expect(una.valores).toEqual({ peso: 82 })
    expect(una.momento).toBe('manana')
  })

  it('un campo vacío no se guarda como cero', () => {
    const una = nuevaMedicion('peso', '2026-09-15', 'manana', { peso: 82, cintura: null })

    expect(una.valores.cintura).toBe(undefined)
  })

  it('guarda la noche cuando así se capturó', () => {
    const una = nuevaMedicion('peso', '2026-09-15', 'noche', { peso: 82.4 })

    expect(una.momento).toBe('noche')
  })

  it('encuentra la medición del día para poder reemplazarla', () => {
    const mediciones = [
      medicion('peso', '2026-09-15', { peso: 82 }),
      medicion('peso', '2026-09-22', { peso: 81.6 }),
    ]

    expect(medicionDelDia(mediciones, 'peso', '2026-09-22')?.valores.peso).toBe(81.6)
    expect(medicionDelDia(mediciones, 'peso', '2026-10-01')).toBe(null)
  })
})
