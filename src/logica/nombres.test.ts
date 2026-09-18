/**
 * Pruebas del nombre visible de un hábito (sección 8).
 *
 * Lo que se cuida aquí es que un nombre privado no se escape nunca por la
 * pantalla: ni por un dato mal escrito, ni por un descuido al llamar a la
 * función.
 */

import { describe, expect, it } from 'vitest'

import { mostrarIcono, mostrarNombre } from './nombres'
import { habitoDiario, habitoNegativo } from './pruebas/fabricas'

const CREADO = '2026-09-01'

describe('el nombre visible de un hábito', () => {
  it('un hábito normal muestra su nombre real', () => {
    const habito = habitoDiario(CREADO, { nombre: 'Ir al gym' })

    expect(mostrarNombre(habito)).toBe('Ir al gym')
  })

  it('un hábito privado muestra su alias y nunca su nombre real', () => {
    const habito = habitoNegativo(CREADO, {
      nombre: 'Nombre real',
      alias: 'Hábito privado 1',
      privado: true,
    })

    expect(mostrarNombre(habito)).toBe('Hábito privado 1')
    expect(mostrarNombre(habito)).not.toBe('Nombre real')
  })

  it('un hábito privado sin alias tampoco delata su nombre real', () => {
    const habito = habitoNegativo(CREADO, { nombre: 'Nombre real', alias: null, privado: true })

    expect(mostrarNombre(habito)).toBe('Hábito privado')
  })
})

describe('el interruptor de mostrar nombres reales', () => {
  const privado = habitoNegativo(CREADO, {
    nombre: 'Nombre real',
    alias: 'Hábito privado 1',
    privado: true,
  })

  it('prendido, un hábito privado enseña su nombre real', () => {
    expect(mostrarNombre(privado, true)).toBe('Nombre real')
  })

  it('apagado, vuelve a enseñar el alias', () => {
    expect(mostrarNombre(privado, false)).toBe('Hábito privado 1')
  })

  it('si no se pasa el interruptor, se da por apagado', () => {
    // Esta es la red de seguridad: un descuido muestra el alias, nunca el
    // nombre real. De aquí sale la garantía de Estadísticas.
    expect(mostrarNombre(privado)).toBe('Hábito privado 1')
  })

  it('en Estadísticas, que nunca pasa el interruptor, el privado sigue con alias', () => {
    // Estadísticas llama a `mostrarNombre(habito)` a secas (sección 8). Aunque
    // el interruptor esté prendido en otra pantalla, aquí no llega.
    expect(mostrarNombre(privado)).not.toBe('Nombre real')
  })

  it('a un hábito normal el interruptor no le cambia nada', () => {
    const normal = habitoDiario(CREADO, { nombre: 'Ir al gym' })

    expect(mostrarNombre(normal, true)).toBe('Ir al gym')
    expect(mostrarNombre(normal, false)).toBe('Ir al gym')
  })
})

describe('el ícono visible de un hábito', () => {
  it('un hábito normal muestra su emoji', () => {
    const habito = habitoDiario(CREADO, { icono: '🏋️' })

    expect(mostrarIcono(habito)).toBe('🏋️')
  })

  it('un hábito privado muestra su emoji igual que cualquier otro', () => {
    // Un punto gris entre emojis de colores delataría que hay algo escondido.
    const habito = habitoNegativo(CREADO, { icono: '🌙', privado: true })

    expect(mostrarIcono(habito)).toBe('🌙')
  })

  it('el emoji de un privado no cambia aunque el interruptor esté prendido', () => {
    // El ícono no depende del interruptor: si cambiara al prenderlo, el cambio
    // mismo sería la pista de cuáles hábitos son privados.
    const habito = habitoNegativo(CREADO, { icono: '🌱', privado: true })

    expect(mostrarIcono(habito)).toBe('🌱')
  })
})
