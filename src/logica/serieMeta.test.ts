/**
 * Pruebas de los puntos de la gráfica y de sus ejes.
 *
 * Aquí se cuida lo que en una gráfica se ve feo y nadie sabe explicar por qué:
 * que las marcas del eje sean números redondos, que **todas caigan dentro de lo
 * que la gráfica dibuja** —ninguna etiqueta señalando un valor que no existe— y
 * que la curva enseñe los números que capturaste, sin el ajuste de la noche,
 * que es solo para la tendencia.
 */

import { describe, expect, it } from 'vitest'

import { ejeDeLaMeta, ejeDeTiempo, ejeDeValores, serieDe } from './serieMeta'
import { medicion, metaDeIngles, metaDePeso, pesadas } from './pruebas/fabricas'

const INICIO = '2026-09-15'

describe('los puntos de la gráfica', () => {
  it('dibuja los dos extremos del plan aunque no haya medición ahí', () => {
    const meta = metaDePeso({ hitos: [] })
    const serie = serieDe(meta, [])

    expect(serie).toHaveLength(2)
    expect(serie[0]?.fecha).toBe('2026-09-15')
    expect(serie[0]?.plan).toBe(82)
    expect(serie[0]?.real).toBe(null)
    expect(serie.at(-1)?.fecha).toBe('2027-04-14')
    expect(serie.at(-1)?.plan).toBe(75)
  })

  it('cada punto sabe a cuántos días del arranque cae', () => {
    const meta = metaDePeso({ hitos: [] })
    const serie = serieDe(meta, [
      medicion('peso', '2026-09-15', { peso: 82 }),
      medicion('peso', '2026-10-13', { peso: 81 }),
    ])

    expect(serie.find((punto) => punto.fecha === '2026-09-15')?.dia).toBe(0)
    expect(serie.find((punto) => punto.fecha === '2026-10-13')?.dia).toBe(28)
    expect(serie.at(-1)?.dia).toBe(211)
  })

  it('cada medición trae su valor real y el del plan de ese día', () => {
    const meta = metaDePeso()
    const serie = serieDe(meta, [medicion('peso', '2026-12-29', { peso: 77 })])
    const punto = serie.find((uno) => uno.fecha === '2026-12-29')

    expect(punto?.real).toBe(77)
    expect(punto?.plan).toBeCloseTo(78.5, 1)
  })

  it('la curva enseña el peso capturado, sin el ajuste de la noche', () => {
    const meta = metaDePeso()
    const serie = serieDe(meta, [medicion('peso', '2026-10-06', { peso: 82 }, 'noche')])
    const punto = serie.find((uno) => uno.fecha === '2026-10-06')

    expect(punto?.real).toBe(82)
    expect(punto?.noche).toBe(true)
  })

  it('cada hito tiene su punto, para poder dibujarse sobre la gráfica', () => {
    const meta = metaDePeso()
    const serie = serieDe(meta, [])
    const delHito = serie.find((punto) => punto.fecha === '2027-03-24')

    expect(delHito).not.toBe(undefined)
    expect(delHito?.real).toBe(null)
    expect(delHito?.plan).toBeCloseTo(75.7, 1)
  })

  it('las mediciones salen en orden aunque lleguen desordenadas', () => {
    const meta = metaDePeso({ hitos: [] })
    const serie = serieDe(meta, [
      medicion('peso', '2026-11-01', { peso: 80 }),
      medicion('peso', '2026-10-01', { peso: 81 }),
    ])

    expect(serie.map((punto) => punto.fecha)).toEqual([
      '2026-09-15',
      '2026-10-01',
      '2026-11-01',
      '2027-04-14',
    ])
  })

  it('una medición sin el campo principal no dibuja punto', () => {
    const meta = metaDePeso()
    const serie = serieDe(meta, [medicion('peso', '2026-10-06', { cintura: 93 })])

    expect(serie.some((punto) => punto.fecha === '2026-10-06')).toBe(false)
  })
})

describe('los números del eje vertical', () => {
  it('son redondos y no arrancan en cero', () => {
    const eje = ejeDeValores([79.6, 82, 80.1, 81.4])

    expect(eje.marcas).toEqual([79, 80, 81, 82])
    expect(eje.minimo).toBe(79)
    expect(eje.maximo).toBe(82)
  })

  it('ninguna marca queda fuera de lo que la gráfica dibuja', () => {
    const eje = ejeDeValores([75, 82, 78.5])

    expect(eje.marcas[0]).toBe(eje.minimo)
    expect(eje.marcas.at(-1)).toBe(eje.maximo)
    for (const marca of eje.marcas) {
      expect(marca).toBeGreaterThanOrEqual(eje.minimo)
      expect(marca).toBeLessThanOrEqual(eje.maximo)
    }
  })

  it('nunca rotula más marcas de las que caben', () => {
    expect(ejeDeValores([40, 100]).marcas.length).toBeLessThanOrEqual(5)
    expect(ejeDeValores([79.6, 82]).marcas.length).toBeLessThanOrEqual(5)
    expect(ejeDeValores([0, 1000]).marcas.length).toBeLessThanOrEqual(5)
  })

  it('con todos los valores iguales abre un margen en vez de quedarse sin eje', () => {
    const eje = ejeDeValores([82, 82, 82])

    expect(eje.maximo).toBeGreaterThan(eje.minimo)
    expect(eje.marcas.length).toBeGreaterThan(1)
  })

  it('sin ningún valor no truena', () => {
    expect(ejeDeValores([]).marcas).toEqual([0, 1])
  })

  it('el eje de la meta deja ver los hitos, aunque queden fuera de las mediciones', () => {
    const meta = metaDePeso()
    const serie = serieDe(meta, pesadas(INICIO, [82, 81.5]))
    const eje = ejeDeLaMeta(meta, serie)

    // El objetivo son 75 kg y el hito 75.7: los dos tienen que caber.
    expect(eje.minimo).toBeLessThanOrEqual(75)
    expect(eje.maximo).toBeGreaterThanOrEqual(82)
  })

  it('en la meta de inglés los puntajes también salen redondos', () => {
    const meta = metaDeIngles()
    const serie = serieDe(meta, [medicion('ingles', '2026-10-01', { puntaje: 52 })])
    const eje = ejeDeLaMeta(meta, serie)

    for (const marca of eje.marcas) {
      expect(Number.isInteger(marca)).toBe(true)
    }
  })
})

describe('el eje de abajo', () => {
  const meta = metaDePeso({ hitos: [] })

  it('reparte el tiempo, no las mediciones', () => {
    // Cuatro semanas seguidas y luego un hueco de cinco meses: el eje tiene que
    // dejar el hueco donde está y no repartir los puntos parejo.
    const serie = serieDe(meta, [
      ...pesadas(INICIO, [82, 81.7, 81.4, 81.2]),
      medicion('peso', '2027-03-01', { peso: 77 }),
    ])
    const tiempo = ejeDeTiempo(serie)

    expect(tiempo.minimo).toBe(0)
    expect(tiempo.maximo).toBe(211)

    const separaciones = serie.map((punto) => punto.dia)
    expect(separaciones).toEqual([0, 7, 14, 21, 167, 211])
  })

  it('rotula el primero y el último día, y reparte los de en medio', () => {
    const serie = serieDe(meta, pesadas(INICIO, [82, 81.7, 81.4]))
    const tiempo = ejeDeTiempo(serie)

    expect(tiempo.marcas[0]).toBe(tiempo.minimo)
    expect(tiempo.marcas.at(-1)).toBe(tiempo.maximo)
  })

  it('ninguna marca cae fuera de lo que la gráfica dibuja', () => {
    const tiempo = ejeDeTiempo(serieDe(meta, pesadas(INICIO, [82, 81.5, 81])))

    for (const marca of tiempo.marcas) {
      expect(marca).toBeGreaterThanOrEqual(tiempo.minimo)
      expect(marca).toBeLessThanOrEqual(tiempo.maximo)
    }
  })

  it('las marcas van repartidas parejo en el tiempo', () => {
    const tiempo = ejeDeTiempo(serieDe(meta, pesadas(INICIO, [82, 81.5])), 5)
    const huecos = tiempo.marcas.slice(1).map((marca, cual) => marca - (tiempo.marcas[cual] ?? 0))

    for (const hueco of huecos) {
      expect(Math.abs(hueco - (huecos[0] ?? 0))).toBeLessThanOrEqual(1)
    }
  })

  it('sin puntos no truena', () => {
    expect(ejeDeTiempo([]).marcas).toEqual([0, 1])
  })
})
