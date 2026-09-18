/**
 * Pruebas de la tendencia y la proyección.
 *
 * Tres cosas se cuidan aquí. Que con menos de seis mediciones **no se proyecte
 * nada**, porque una tendencia sacada de tres pesadas engaña. Que el ajuste de
 * las mediciones nocturnas se aplique a los kilos y **solo** a los kilos. Y que
 * una tendencia que va en contra diga que no llegas, en vez de escupir una
 * fecha del año 2049.
 */

import { describe, expect, it } from 'vitest'

import {
  AJUSTE_NOCTURNO_KG,
  MEDICIONES_MINIMAS,
  ajustaLaNoche,
  nocturnasAjustadas,
  proyeccionDe,
  tendenciaDe,
  valorAjustado,
} from './tendencia'
import { medicion, metaDeIngles, metaDePeso, pesadas } from './pruebas/fabricas'

const INICIO = '2026-09-15'

describe('el ajuste de las mediciones nocturnas', () => {
  it('le toca a las metas medidas en kilos', () => {
    expect(ajustaLaNoche(metaDePeso())).toBe(true)
  })

  it('no le toca a la meta de inglés: la hora del día no cambia un examen', () => {
    const meta = metaDeIngles()
    const deNoche = medicion('ingles', '2026-11-01', { puntaje: 55 }, 'noche')

    expect(ajustaLaNoche(meta)).toBe(false)
    expect(valorAjustado(meta, deNoche)).toBe(55)
    expect(nocturnasAjustadas(meta, [deNoche])).toBe(0)
  })

  it('resta 0.8 kg a la pesada de la noche y no toca la de la mañana', () => {
    const meta = metaDePeso()
    const noche = medicion('peso', '2026-09-22', { peso: 82 }, 'noche')
    const manana = medicion('peso', '2026-09-23', { peso: 82 })

    expect(valorAjustado(meta, noche)).toBeCloseTo(82 - AJUSTE_NOCTURNO_KG, 5)
    expect(valorAjustado(meta, manana)).toBe(82)
  })

  it('cuenta cuántas se están ajustando, para poder avisarlo en pantalla', () => {
    const meta = metaDePeso()
    const mediciones = [
      medicion('peso', '2026-09-15', { peso: 82 }),
      medicion('peso', '2026-09-22', { peso: 81.6 }, 'noche'),
      medicion('peso', '2026-09-29', { peso: 81.2 }, 'noche'),
      // De noche pero sin peso: no se ajusta nada porque no hay nada que ajustar.
      medicion('peso', '2026-10-06', { cintura: 93 }, 'noche'),
    ]

    expect(nocturnasAjustadas(meta, mediciones)).toBe(2)
  })
})

describe('la recta de la tendencia', () => {
  it('con medio kilo menos por semana, la pendiente es de medio kilo entre siete', () => {
    const meta = metaDePeso()
    const recta = tendenciaDe(meta, pesadas(INICIO, [82, 81.5, 81, 80.5, 80, 79.5]))

    expect(recta?.pendientePorDia).toBeCloseTo(-0.5 / 7, 5)
    expect(recta?.puntos).toBe(6)
  })

  it('no hay recta con una sola medición', () => {
    expect(tendenciaDe(metaDePeso(), pesadas(INICIO, [82]))).toBe(null)
  })

  it('no hay recta si todas las mediciones son del mismo día', () => {
    const meta = metaDePeso()
    const mismoDia = [
      medicion('peso', INICIO, { peso: 82 }),
      { ...medicion('peso', INICIO, { peso: 81 }), id: 'otra' },
    ]

    expect(tendenciaDe(meta, mismoDia)).toBe(null)
  })
})

describe('la proyección', () => {
  it('con menos de seis mediciones dice cuántas faltan y no proyecta', () => {
    const meta = metaDePeso()
    const proyeccion = proyeccionDe(meta, pesadas(INICIO, [82, 81.7, 81.4, 81]), '2026-10-06')

    expect(proyeccion.mediciones).toBe(4)
    expect(proyeccion.faltan).toBe(MEDICIONES_MINIMAS - 4)
    expect(proyeccion.fechaLlegada).toBe(null)
    expect(proyeccion.llegas).toBe(false)
  })

  it('con seis mediciones ya proyecta una fecha', () => {
    const meta = metaDePeso()
    const proyeccion = proyeccionDe(meta, pesadas(INICIO, [82, 81.5, 81, 80.5, 80, 79.5]), '2026-10-20')

    expect(proyeccion.faltan).toBe(0)
    expect(proyeccion.llegas).toBe(true)
    // Medio kilo por semana son 7 kg en 98 días: mucho antes del 14 de abril.
    expect(proyeccion.fechaLlegada).toBe('2026-12-22')
    expect(proyeccion.diferenciaEnDias).toBeGreaterThan(0)
  })

  it('un ritmo más lento que el plan llega después, y lo dice con número negativo', () => {
    const meta = metaDePeso()
    const lento = pesadas(INICIO, [82, 81.9, 81.8, 81.7, 81.6, 81.5])
    const proyeccion = proyeccionDe(meta, lento, '2026-10-20')

    expect(proyeccion.llegas).toBe(true)
    expect(proyeccion.diferenciaEnDias).toBeLessThan(0)
  })

  it('si la tendencia va en contra, no llegas: no se inventa ninguna fecha', () => {
    const meta = metaDePeso()
    const subiendo = pesadas(INICIO, [82, 82.3, 82.5, 82.8, 83, 83.4])
    const proyeccion = proyeccionDe(meta, subiendo, '2026-10-20')

    expect(proyeccion.faltan).toBe(0)
    expect(proyeccion.llegas).toBe(false)
    expect(proyeccion.fechaLlegada).toBe(null)
  })

  it('un ritmo casi plano tampoco cuenta como llegar', () => {
    const meta = metaDePeso()
    const plano = pesadas(INICIO, [82, 81.99, 81.98, 81.99, 81.98, 81.97])

    expect(proyeccionDe(meta, plano, '2026-10-20').llegas).toBe(false)
  })

  it('la fecha de llegada nunca cae en el pasado', () => {
    const meta = metaDePeso()
    const desplome = pesadas(INICIO, [82, 80, 78, 76, 74, 72])
    const proyeccion = proyeccionDe(meta, desplome, '2026-12-01')

    expect(proyeccion.fechaLlegada).toBe('2026-12-01')
  })

  it('en la meta de inglés proyecta hacia arriba', () => {
    const meta = metaDeIngles()
    const fechas = ['2026-10-01', '2026-11-01', '2026-12-01', '2027-01-01', '2027-02-01', '2027-03-01']
    const mensuales = fechas.map((fecha, cuantos) =>
      medicion('ingles', fecha, { puntaje: 50 + cuantos * 3 }),
    )
    const proyeccion = proyeccionDe(meta, mensuales, '2027-03-01')

    expect(proyeccion.llegas).toBe(true)
    expect(proyeccion.diferenciaEnDias).toBeGreaterThan(0)
  })
})
