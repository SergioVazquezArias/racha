/**
 * Pruebas de las palabras que hay que escribir para lo que no se deshace.
 *
 * Perdonar mayúsculas y espacios no es un descuido: el corrector del iPhone
 * pone una mayúscula al empezar sin que se la pidan, y sería absurdo que por
 * eso no se pudiera borrar la app.
 */

import { describe, expect, it } from 'vitest'

import { PALABRA_PARA_BORRAR, PALABRA_PARA_IMPORTAR, palabraCorrecta } from './confirmaciones'

describe('la palabra escrita', () => {
  it('vale escrita igual', () => {
    expect(palabraCorrecta('BORRAR', PALABRA_PARA_BORRAR)).toBe(true)
  })

  it('vale en minúsculas', () => {
    expect(palabraCorrecta('borrar', PALABRA_PARA_BORRAR)).toBe(true)
  })

  it('vale con espacios de sobra alrededor', () => {
    expect(palabraCorrecta('  Borrar ', PALABRA_PARA_BORRAR)).toBe(true)
  })

  it('no vale a medias', () => {
    expect(palabraCorrecta('borra', PALABRA_PARA_BORRAR)).toBe(false)
  })

  it('no vale vacía', () => {
    expect(palabraCorrecta('', PALABRA_PARA_BORRAR)).toBe(false)
  })

  it('no vale la palabra de la otra confirmación', () => {
    expect(palabraCorrecta(PALABRA_PARA_IMPORTAR, PALABRA_PARA_BORRAR)).toBe(false)
  })
})
