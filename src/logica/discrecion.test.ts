/**
 * Pruebas del interruptor de "Mostrar nombres reales" (sección 8).
 *
 * La promesa que se cuida aquí es una sola: **el interruptor no se guarda**.
 * Por más que se haya dejado prendido, la app vuelve a abrir con los nombres
 * privados escondidos.
 */

import { describe, expect, it } from 'vitest'

import { alArrancar, alternar } from './discrecion'

describe('el interruptor de mostrar nombres reales', () => {
  it('cada arranque de la app empieza apagado', () => {
    expect(alArrancar().mostrarNombresReales).toBe(false)
  })

  it('prenderlo no cambia cómo arranca la próxima vez', () => {
    // Se prende, como si el usuario lo hubiera dejado así al cerrar la app...
    const prendido = alternar(alArrancar())
    expect(prendido.mostrarNombresReales).toBe(true)

    // ...y al volver a abrirla, sigue apagado. No se guardó en ningún lado.
    expect(alArrancar().mostrarNombresReales).toBe(false)
  })

  it('sigue apagado por más veces que se haya prendido y apagado', () => {
    let estado = alArrancar()
    for (let vez = 0; vez < 7; vez += 1) estado = alternar(estado)
    expect(estado.mostrarNombresReales).toBe(true)

    expect(alArrancar().mostrarNombresReales).toBe(false)
  })

  it('el arranque es un estado nuevo cada vez, que nadie de fuera puede dejar prendido', () => {
    const primero = alArrancar()
    primero.mostrarNombresReales = true

    expect(alArrancar().mostrarNombresReales).toBe(false)
  })

  it('apagarlo lo deja apagado', () => {
    expect(alternar(alternar(alArrancar())).mostrarNombresReales).toBe(false)
  })
})
