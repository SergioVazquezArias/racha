/**
 * Pruebas de los días de antes: lo que la app escribe cuando dices que ya
 * llevabas el hábito desde una fecha anterior a hoy.
 *
 * Cada prueba dice en su título qué promete la app, para que se pueda leer y
 * auditar sin saber programar (regla 10).
 *
 * El día de hoy es siempre el jueves 17 de septiembre de 2026. Los lunes de esa
 * temporada son el 31 de agosto, el 7 y el 14 de septiembre.
 */

import { describe, expect, it } from 'vitest'

import { registrosRetroactivos } from './retroactivo'
import { semanasPorCerrar } from './cierre'
import { rachaDiaria, rachaNegativa } from './rachas'
import { cumplido, habitoDiario, habitoNegativo, habitoSemanal, recaida } from './pruebas/fabricas'
import type { Fecha, Habito, Registro } from '../tipos'

/** Jueves 17 de septiembre de 2026. */
const HOY = '2026-09-17'

/** Las fechas de los registros devueltos, para poder leerlas de un vistazo. */
function fechas(habito: Habito, registros: Registro[] = [], hoy: Fecha = HOY): Fecha[] {
  return registrosRetroactivos(habito, registros, hoy).map((registro) => registro.fecha)
}

// ---------------------------------------------------------------------------

describe('un hábito negativo', () => {
  it('no escribe ni un registro: está limpio porque no hay recaídas', () => {
    expect(fechas(habitoNegativo('2026-09-10'))).toEqual([])
  })

  it('y aun así arranca con sus días limpios contados', () => {
    // Del 10 al 16 son siete días. Hoy no cuenta todavía.
    const habito = habitoNegativo('2026-09-10')

    expect(rachaNegativa(habito, [], HOY).actual).toBe(7)
  })
})

// ---------------------------------------------------------------------------

describe('un hábito positivo de todos los días', () => {
  it('da por hechos los días desde la fecha hasta ayer', () => {
    expect(fechas(habitoDiario('2026-09-14'))).toEqual(['2026-09-14', '2026-09-15', '2026-09-16'])
  })

  it('los escribe como cumplidos, sin nota ni valor', () => {
    const registros = registrosRetroactivos(habitoDiario('2026-09-16'), [], HOY)

    expect(registros).toHaveLength(1)
    expect(registros[0]?.estado).toBe('cumplido')
    expect(registros[0]?.valor).toBeNull()
    expect(registros[0]?.nota).toBeNull()
  })

  it('nunca marca hoy: eso lo marcas tú en la pantalla Hoy', () => {
    expect(fechas(habitoDiario('2026-09-14'))).not.toContain(HOY)
  })

  it('un hábito que empieza hoy no escribe nada', () => {
    expect(fechas(habitoDiario(HOY))).toEqual([])
  })

  it('arranca con la racha ya contada', () => {
    const habito = habitoDiario('2026-09-07')
    const registros = registrosRetroactivos(habito, [], HOY)

    expect(rachaDiaria(habito, registros, HOY).actual).toBe(10)
  })
})

// ---------------------------------------------------------------------------

describe('un hábito positivo de veces por semana', () => {
  it('marca las veces que te propusiste, no los siete días', () => {
    // Cinco por semana: de la semana del 7 al 13 solo se marcan cinco días.
    const marcados = fechas(habitoSemanal('2026-09-07', 5, 4))

    expect(marcados.filter((fecha) => fecha <= '2026-09-13')).toEqual([
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11',
    ])
  })

  it('de la semana en curso solo marca lo ya vivido', () => {
    // La semana del 14 va por el jueves: quedan tres días detrás, no cinco.
    const marcados = fechas(habitoSemanal('2026-09-14', 5, 4))

    expect(marcados).toEqual(['2026-09-14', '2026-09-15', '2026-09-16'])
  })

  it('con dos por semana marca dos, no cinco', () => {
    const marcados = fechas(habitoSemanal('2026-09-07', 2, 1))

    expect(marcados).toEqual(['2026-09-07', '2026-09-08', '2026-09-14', '2026-09-15'])
  })

  it('las semanas que rellena cierran en verde, no en rojo', () => {
    const habito = habitoSemanal('2026-08-31', 5, 4)
    const registros = registrosRetroactivos(habito, [], HOY)
    const semanas = semanasPorCerrar([habito], registros, [], HOY)

    // Las dos semanas completas que vivió: la del 31 y la del 7.
    expect(semanas).toHaveLength(2)
    expect(semanas.every((semana) => semana.color === 'verde')).toBe(true)
    expect(semanas.every((semana) => semana.hechos === 5)).toBe(true)
  })

  it('si la semana ya está cumplida, no le añade ni un día más', () => {
    // Se le corrige la fecha a un hábito de dos por semana que ya tenía sus dos
    // días marcados: no se toca nada.
    const habito = habitoSemanal('2026-09-14', 2, 1)
    const yaHechos = [cumplido(habito.id, '2026-09-15'), cumplido(habito.id, '2026-09-16')]

    expect(registrosRetroactivos(habito, yaHechos, HOY)).toEqual([])
  })

  it('si le falta uno para cumplir la semana, solo pone ese', () => {
    const habito = habitoSemanal('2026-09-14', 2, 1)
    const yaHecho = [cumplido(habito.id, '2026-09-16')]

    expect(registrosRetroactivos(habito, yaHecho, HOY).map((r) => r.fecha)).toEqual(['2026-09-14'])
  })
})

// ---------------------------------------------------------------------------

describe('lo que nunca pisa', () => {
  it('un día que ya tenía palomita', () => {
    const habito = habitoDiario('2026-09-14')
    const yaHecho = [cumplido(habito.id, '2026-09-15')]

    expect(fechas(habito, yaHecho)).toEqual(['2026-09-14', '2026-09-16'])
  })

  it('un día que ya tenía una falla registrada', () => {
    // Si el día 15 se registró como fallado, así se queda: lo que ya estaba
    // escrito manda sobre lo que la fecha da por hecho.
    const habito = habitoDiario('2026-09-14')
    const falla = [recaida(habito.id, '2026-09-15')]

    expect(fechas(habito, falla)).toEqual(['2026-09-14', '2026-09-16'])
  })

  it('los días de otro hábito', () => {
    const habito = habitoDiario('2026-09-16')
    const deOtro = [cumplido('otro', '2026-09-16')]

    expect(fechas(habito, deOtro)).toEqual(['2026-09-16'])
  })
})

// ---------------------------------------------------------------------------

describe('la vida del hábito manda', () => {
  it('un hábito archivado no rellena los días de después del archivado', () => {
    const habito = habitoDiario('2026-09-01', { archivadoEn: '2026-09-05' })

    expect(fechas(habito)).toEqual(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'])
  })

  it('uno que volvió cuenta desde su vuelta, no desde su alta', () => {
    const habito = habitoDiario('2026-06-01', { revividoEn: '2026-09-15' })

    expect(fechas(habito)).toEqual(['2026-09-15', '2026-09-16'])
  })
})
