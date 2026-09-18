/**
 * Pruebas de las bandas de inglés.
 *
 * Son una escala fija del documento, así que lo único que hay que cuidar es
 * que los bordes caigan donde dice —54 todavía es A2 y 55 ya es B1— y que no
 * se dibujen franjas que la gráfica no está enseñando.
 */

import { describe, expect, it } from 'vitest'

import { bandaDe, bandasVisibles, usaBandasDeIngles } from './ingles'
import { metaDeIngles, metaDePeso } from './pruebas/fabricas'

describe('las bandas de inglés', () => {
  it('solo le tocan a la meta medida en puntos', () => {
    expect(usaBandasDeIngles(metaDeIngles())).toBe(true)
    expect(usaBandasDeIngles(metaDePeso())).toBe(false)
  })

  it('respeta los bordes de la escala', () => {
    expect(bandaDe(54)?.nombre).toBe('A2')
    expect(bandaDe(55)?.nombre).toBe('B1')
    expect(bandaDe(69)?.nombre).toBe('B1')
    expect(bandaDe(70)?.nombre).toBe('B2')
    expect(bandaDe(85)?.nombre).toBe('C1')
  })

  it('por debajo de 40 no hay banda, y no se inventa una', () => {
    expect(bandaDe(39)).toBe(null)
  })

  it('el objetivo de la meta, 70 puntos, es justo el umbral de B2', () => {
    expect(bandaDe(metaDeIngles().valorObjetivo)?.nombre).toBe('B2')
  })

  it('solo se dibujan las franjas que se cruzan con lo que se ve', () => {
    const visibles = bandasVisibles(50, 72).map((banda) => banda.nombre)

    expect(visibles).toEqual(['A2', 'B1', 'B2'])
  })
})
