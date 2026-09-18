/**
 * Pruebas del respaldo (sección 14).
 *
 * Dos cosas se comprueban aquí: que el archivo salga con la fecha local del
 * día —no la de UTC, regla 2— y que el aviso de los 30 días aparezca cuando
 * tiene que aparecer y no antes.
 */

import { describe, expect, it } from 'vitest'

import {
  armarRespaldo,
  aTexto,
  avisoDeRespaldo,
  diasSinRespaldo,
  nombreDeArchivo,
  resumenDelDocumento,
  textoUltimoRespaldo,
  tocaAvisar,
} from './respaldo'
import { documentoDePrueba } from './pruebas/documentos'

const HOY = '2026-09-18'

describe('el archivo del respaldo', () => {
  it('se llama con la fecha del día', () => {
    expect(nombreDeArchivo(HOY)).toBe('racha-respaldo-2026-09-18.json')
  })

  it('guarda el documento completo dentro de un sobre con app, versión y fecha', () => {
    const documento = documentoDePrueba()
    const respaldo = armarRespaldo(documento, HOY)

    expect(respaldo.app).toBe('racha')
    expect(respaldo.version).toBe(1)
    expect(respaldo.creadoEn).toBe(HOY)
    expect(respaldo.documento).toEqual(documento)
  })

  it('se puede volver a leer tal cual se escribió', () => {
    const documento = documentoDePrueba()
    const texto = aTexto(armarRespaldo(documento, HOY))

    expect(JSON.parse(texto).documento).toEqual(documento)
  })

  it('sale con saltos de línea, para poder abrirlo y leerlo con cualquier cosa', () => {
    expect(aTexto(armarRespaldo(documentoDePrueba(), HOY))).toContain('\n')
  })
})

describe('el resumen de lo que trae un respaldo', () => {
  it('cuenta hábitos, metas y días registrados', () => {
    expect(resumenDelDocumento(documentoDePrueba())).toBe('1 hábito, 1 meta, 1 día registrado')
  })

  it('usa el plural cuando toca', () => {
    const vacio = documentoDePrueba({ habitos: [], metas: [], registros: [] })

    expect(resumenDelDocumento(vacio)).toBe('0 hábitos, 0 metas, 0 días registrados')
  })
})

describe('los días desde el último respaldo', () => {
  it('son los que hay entre las dos fechas', () => {
    expect(diasSinRespaldo('2026-09-01', HOY)).toBe(17)
  })

  it('son cero el mismo día', () => {
    expect(diasSinRespaldo(HOY, HOY)).toBe(0)
  })

  it('no existen si nunca se respaldó', () => {
    expect(diasSinRespaldo(null, HOY)).toBeNull()
  })

  it('no son negativos si el respaldo trae una fecha futura', () => {
    expect(diasSinRespaldo('2026-12-01', HOY)).toBe(0)
  })
})

describe('el aviso de Ajustes', () => {
  it('no aparece con un respaldo reciente', () => {
    expect(tocaAvisar('2026-09-10', HOY)).toBe(false)
    expect(avisoDeRespaldo('2026-09-10', HOY)).toBeNull()
  })

  it('no aparece justo a los 30 días: el aviso es por pasarse, no por llegar', () => {
    expect(tocaAvisar('2026-08-19', HOY)).toBe(false)
  })

  it('aparece al día 31', () => {
    expect(tocaAvisar('2026-08-18', HOY)).toBe(true)
    expect(avisoDeRespaldo('2026-08-18', HOY)).toContain('31 días')
  })

  it('dice la fecha del último respaldo, para reconocer el archivo', () => {
    expect(avisoDeRespaldo('2026-08-18', HOY)).toContain('18 de agosto de 2026')
  })

  it('aparece siempre si nunca se ha respaldado', () => {
    expect(tocaAvisar(null, HOY)).toBe(true)
    expect(avisoDeRespaldo(null, HOY)).toContain('ningún respaldo')
  })
})

describe('la línea de cuándo fue el último respaldo', () => {
  it('lo dice en palabras', () => {
    expect(textoUltimoRespaldo('2026-09-10')).toBe('Último respaldo: 10 de septiembre de 2026.')
  })

  it('avisa cuando no hay ninguno', () => {
    expect(textoUltimoRespaldo(null)).toBe('Nunca has hecho un respaldo.')
  })
})
