/**
 * Pruebas de los textos de las metas.
 *
 * Existen para que Sergio pueda leer aquí, sin abrir la app, exactamente qué
 * frase va a salir en pantalla en cada situación. La del documento —«a este
 * ritmo llegas a 75 kg el 2 de abril, 12 días antes»— está probada tal cual.
 */

import { describe, expect, it } from 'vitest'

import {
  textoDeCadencia,
  textoDeCierre,
  textoDeGrasa,
  textoDeProgreso,
  textoDeProyeccion,
  textoDeRestante,
  textoDelAjusteNocturno,
  valorConUnidad,
} from './textosMetas'
import { progresoDe } from './metas'
import { medicion, metaDeIngles, metaDePeso } from './pruebas/fabricas'
import type { Proyeccion } from './tendencia'

const META = metaDePeso()

/** Una proyección armada a mano, para probar cada frase por separado. */
function proyeccion(cambios: Partial<Proyeccion> = {}): Proyeccion {
  return {
    mediciones: 8,
    faltan: 0,
    nocturnas: 0,
    fechaLlegada: '2027-04-02',
    diferenciaEnDias: 12,
    llegas: true,
    ...cambios,
  }
}

describe('la proyección redactada', () => {
  it('dice la frase del documento cuando llegas antes', () => {
    expect(textoDeProyeccion(META, proyeccion())).toBe(
      'A este ritmo llegas a 75 kg el 2 de abril, 12 días antes.',
    )
  })

  it('dice «después» cuando llegas tarde', () => {
    const texto = textoDeProyeccion(META, proyeccion({ fechaLlegada: '2027-04-28', diferenciaEnDias: -14 }))

    expect(texto).toBe('A este ritmo llegas a 75 kg el 28 de abril, 14 días después.')
  })

  it('un solo día se dice en singular', () => {
    const texto = textoDeProyeccion(META, proyeccion({ fechaLlegada: '2027-04-13', diferenciaEnDias: 1 }))

    expect(texto).toContain('1 día antes')
  })

  it('caer justo en la fecha se dice así, sin número', () => {
    const texto = textoDeProyeccion(META, proyeccion({ fechaLlegada: '2027-04-14', diferenciaEnDias: 0 }))

    expect(texto).toBe('A este ritmo llegas a 75 kg el 14 de abril, justo en la fecha.')
  })

  it('si la tendencia va en contra lo dice, sin inventar fecha', () => {
    const texto = textoDeProyeccion(META, proyeccion({ llegas: false, fechaLlegada: null }))

    expect(texto).toBe('La tendencia va en contra: a este ritmo no llegas a 75 kg.')
  })

  it('con mediciones de menos dice cuántas faltan, en singular y en plural', () => {
    expect(textoDeProyeccion(META, proyeccion({ faltan: 2, llegas: false }))).toBe(
      'Faltan 2 mediciones para poder proyectar.',
    )
    expect(textoDeProyeccion(META, proyeccion({ faltan: 1, llegas: false }))).toBe(
      'Falta 1 medición para poder proyectar.',
    )
  })

  it('nunca suelta un porcentaje pelado', () => {
    expect(textoDeProyeccion(META, proyeccion())).not.toContain('%')
  })
})

describe('el aviso del ajuste nocturno', () => {
  it('no aparece si no se ajustó ninguna medición', () => {
    expect(textoDelAjusteNocturno(proyeccion({ nocturnas: 0 }))).toBe(null)
  })

  it('dice cuántas se ajustaron y cuánto se les restó', () => {
    const texto = textoDelAjusteNocturno(proyeccion({ nocturnas: 3 })) ?? ''

    expect(texto).toContain('3 mediciones')
    expect(texto).toContain('0.8 kg')
    expect(texto).toContain('solo para calcular la tendencia')
    expect(texto).toContain('punto hueco')
  })

  it('con una sola medición lo dice en singular', () => {
    const texto = textoDelAjusteNocturno(proyeccion({ nocturnas: 1 })) ?? ''

    expect(texto).toContain('1 medición fue de noche')
  })
})

describe('el progreso contra el plan', () => {
  it('sin mediciones no presume nada', () => {
    expect(textoDeProgreso(META, progresoDe(META, [], '2026-10-01'))).toBe('Todavía no hay mediciones.')
  })

  it('dice cuánto le ganas al plan', () => {
    const progreso = progresoDe(META, [medicion('peso', '2026-12-30', { peso: 77 })], '2026-12-30')

    expect(textoDeProgreso(META, progreso)).toContain('adelante del plan')
  })

  it('dice cuánto le debes al plan, sin regañar', () => {
    const progreso = progresoDe(META, [medicion('peso', '2026-12-30', { peso: 80 })], '2026-12-30')
    const texto = textoDeProgreso(META, progreso)

    expect(texto).toContain('atrás del plan')
    expect(texto).not.toContain('!')
  })

  it('celebra el objetivo alcanzado', () => {
    const progreso = progresoDe(META, [medicion('peso', '2027-03-01', { peso: 74.8 })], '2027-03-01')

    expect(textoDeProgreso(META, progreso)).toContain('Objetivo alcanzado')
    expect(textoDeRestante(META, progreso)).toBe('Ya llegaste al objetivo')
  })

  it('cuenta lo que falta con su unidad', () => {
    const progreso = progresoDe(META, [medicion('peso', '2026-10-06', { peso: 81 })], '2026-10-06')

    expect(textoDeRestante(META, progreso)).toBe('Faltan 6 kg')
  })
})

describe('los textos sueltos', () => {
  it('los valores llevan su unidad y no arrastran ceros', () => {
    expect(valorConUnidad(75, 'kg')).toBe('75 kg')
    expect(valorConUnidad(81.4, 'kg')).toBe('81.4 kg')
    expect(valorConUnidad(70, 'puntos')).toBe('70 puntos')
  })

  it('la grasa siempre se presenta como estimación', () => {
    expect(textoDeGrasa(24.1)).toBe('24.1 % estimado')
  })

  it('una meta activa no tiene texto de cierre', () => {
    expect(textoDeCierre(META)).toBe(null)
  })

  it('una meta cerrada dice cómo y cuándo se cerró', () => {
    const cumplida = metaDePeso({ estado: 'cumplida', cerradaEn: '2027-04-14' })
    const abandonada = metaDePeso({ estado: 'abandonada', cerradaEn: '2026-11-30' })

    expect(textoDeCierre(cumplida)).toBe('Cumplida el 14 de abril de 2027')
    expect(textoDeCierre(abandonada)).toBe('Abandonada el 30 de noviembre de 2026')
  })
})

describe('cada cuánto se mide una meta', () => {
  it('dice el día de la semana, en plural donde toca', () => {
    expect(textoDeCadencia(metaDePeso({ diaDeMedicion: 6 }))).toBe('Semanal, los domingos')
    expect(textoDeCadencia(metaDePeso({ diaDeMedicion: 5 }))).toBe('Semanal, los sábados')
  })

  it('los días que no llevan ese en plural se quedan igual', () => {
    expect(textoDeCadencia(metaDePeso({ diaDeMedicion: 0 }))).toBe('Semanal, los lunes')
    expect(textoDeCadencia(metaDePeso({ diaDeMedicion: 1 }))).toBe('Semanal, los martes')
    expect(textoDeCadencia(metaDePeso({ diaDeMedicion: 2 }))).toBe('Semanal, los miércoles')
  })

  it('en una meta mensual dice el día del mes', () => {
    expect(textoDeCadencia(metaDeIngles({ diaDeMedicion: 1 }))).toBe('Mensual, el día 1')
  })

  it('sin día fijo dice solo cada cuánto', () => {
    expect(textoDeCadencia(metaDePeso({ diaDeMedicion: null }))).toBe('Semanal')
    expect(textoDeCadencia(metaDeIngles({ diaDeMedicion: null }))).toBe('Mensual')
  })

  it('la meta de peso real se mide los domingos', () => {
    expect(textoDeCadencia(metaDePeso())).toBe('Semanal, los domingos')
  })
})
