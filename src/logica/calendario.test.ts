/**
 * Pruebas de cadencia y de fechas.
 *
 * Aquí se comprueba lo que la regla 2 promete: los días se identifican con la
 * cadena `"YYYY-MM-DD"` en hora local, nunca en UTC, y las rachas sobreviven a
 * un cambio de mes, de año y a un 29 de febrero.
 */

import { describe, expect, it } from 'vitest'

import { aFecha, claveSemana, deFecha, diasDeLaSemana, sumarDias } from './fechas'
import { evaluarSemana } from './semaforo'
import { rachaDiaria, rachaNegativa, rachaSemanal } from './rachas'
import { cumplidos, habitoDiario, habitoNegativo, habitoSemanal } from './pruebas/fabricas'

/** Tres lunes seguidos de julio de 2026. */
const LUNES = ['2026-07-06', '2026-07-13', '2026-07-20']

describe('cadencia semanal', () => {
  const habito = habitoSemanal('2026-06-01', 5, 3)

  /** Cinco días cumplidos por semana, salteados: quedan dos días en blanco. */
  function tresSemanasDeCinco() {
    const registros = LUNES.flatMap((lunes) => {
      const dias = diasDeLaSemana(lunes)
      return cumplidos(habito.id, [0, 2, 3, 5, 6].map((indice) => dias[indice] ?? ''))
    })
    return LUNES.map((lunes) => evaluarSemana(habito, claveSemana(lunes), registros))
  }

  it('mide la racha en semanas, no en días', () => {
    // Quince días cumplidos, pero la racha vale 3 porque son tres semanas.
    expect(rachaSemanal(habito, tresSemanasDeCinco()).actual).toBe(3)
  })

  it('un día sin marcar no cuenta como falla: es un día libre', () => {
    const semanas = tresSemanasDeCinco()

    expect(semanas.map((semana) => semana.color)).toEqual(['verde', 'verde', 'verde'])
    expect(semanas.some((semana) => semana.color === 'rojo')).toBe(false)
  })
})

describe('el día de hoy', () => {
  it('no cuenta a favor de un hábito positivo aunque ya esté palomeado', () => {
    const habito = habitoDiario('2026-09-10')
    const registros = cumplidos(habito.id, ['2026-09-16', '2026-09-17'])

    expect(rachaDiaria(habito, registros, '2026-09-17').actual).toBe(1)
  })

  it('no cuenta en contra de un hábito positivo si todavía no se palomea', () => {
    const habito = habitoDiario('2026-09-10')
    const registros = cumplidos(habito.id, ['2026-09-15', '2026-09-16'])

    expect(rachaDiaria(habito, registros, '2026-09-17').actual).toBe(2)
  })

  it('no cuenta a favor de un hábito negativo creado hoy', () => {
    expect(rachaNegativa(habitoNegativo('2026-09-17'), [], '2026-09-17').actual).toBe(0)
  })
})

describe('los cambios de mes y de año', () => {
  it('una racha diaria cruza el fin de mes y el fin de año', () => {
    const habito = habitoDiario('2025-12-20')
    const dias = Array.from({ length: 22 }, (_, indice) => sumarDias('2025-12-20', indice))

    expect(dias.at(-1)).toBe('2026-01-10')
    expect(rachaDiaria(habito, cumplidos(habito.id, dias), '2026-01-11').actual).toBe(22)
  })

  it('la semana del 1 de enero de 2026 pertenece al año ISO 2026', () => {
    expect(claveSemana('2025-12-29')).toBe('2026-W01')
    expect(claveSemana('2026-01-01')).toBe('2026-W01')
  })

  it('un hábito negativo suma bien a través de un cambio de año', () => {
    expect(rachaNegativa(habitoNegativo('2025-12-25'), [], '2026-01-05').actual).toBe(11)
  })
})

describe('el año bisiesto', () => {
  it('2028 tiene 29 de febrero y la racha lo atraviesa', () => {
    expect(sumarDias('2028-02-28', 1)).toBe('2028-02-29')
    expect(sumarDias('2028-02-29', 1)).toBe('2028-03-01')

    const habito = habitoDiario('2028-02-26')
    const dias = ['2028-02-26', '2028-02-27', '2028-02-28', '2028-02-29', '2028-03-01']

    expect(rachaDiaria(habito, cumplidos(habito.id, dias), '2028-03-02').actual).toBe(5)
  })

  it('olvidar el 29 de febrero rompe la racha como cualquier otro día', () => {
    const habito = habitoDiario('2028-02-26')
    const dias = ['2028-02-26', '2028-02-27', '2028-02-28', '2028-03-01']

    expect(rachaDiaria(habito, cumplidos(habito.id, dias), '2028-03-02').actual).toBe(1)
  })
})

describe('las fechas en hora local', () => {
  it('las pruebas corren fuera de UTC, si no esta sección no probaría nada', () => {
    expect(new Date('2026-01-01T12:00:00').getTimezoneOffset()).not.toBe(0)
  })

  it('una fecha vuelve a ser la misma cadena después de ida y vuelta', () => {
    for (const fecha of ['2026-01-01', '2026-02-28', '2026-12-31', '2028-02-29']) {
      expect(aFecha(deFecha(fecha))).toBe(fecha)
    }
  })

  it('el primer día del año cuenta como ese día, no como el 31 de diciembre', () => {
    // Leído en UTC, `2026-01-01` se convertiría en el 31 de diciembre local y
    // la racha valdría cero. Este es el error que la regla 2 impide.
    const habito = habitoDiario('2026-01-01')

    expect(rachaDiaria(habito, cumplidos(habito.id, ['2026-01-01']), '2026-01-02').actual).toBe(1)
  })
})
