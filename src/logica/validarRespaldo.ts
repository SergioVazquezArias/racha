/**
 * La revisión de un respaldo antes de importarlo (sección 14).
 *
 * Es el **único lugar de la app por donde entran datos de fuera**. Todo lo
 * demás lo escribió la app misma; esto lo eligió un dedo en el selector de
 * archivos de iOS y puede ser cualquier cosa: un JSON de otro programa, un
 * respaldo cortado a la mitad, o un respaldo de una Racha más nueva.
 *
 * Por eso se revisa antes de tocar nada. Si algo no cuadra **no se escribe
 * nada**: se devuelve una frase en español que dice qué falló, y los datos de
 * hoy se quedan exactamente donde estaban.
 */

import { VERSION_DE_RESPALDO } from './respaldo'
import type { DocumentoRacha, Fecha } from '../tipos'

/** El resultado de la revisión: o pasa con su documento, o falla con su motivo. */
export type Revision =
  | { ok: true; documento: DocumentoRacha; creadoEn: Fecha | null }
  | { ok: false; problema: string }

/** Las listas que un respaldo completo tiene que traer, con su nombre legible. */
const LISTAS: { clave: keyof DocumentoRacha; nombre: string }[] = [
  { clave: 'habitos', nombre: 'los hábitos' },
  { clave: 'registros', nombre: 'los días registrados' },
  { clave: 'semanas', nombre: 'las semanas' },
  { clave: 'metas', nombre: 'las metas' },
  { clave: 'mediciones', nombre: 'las mediciones' },
]

/**
 * Revisa el texto de un respaldo.
 *
 * Acepta las dos formas: el archivo con sobre que escribe esta app, y un
 * documento pelón. La segunda no la produce Racha, pero un respaldo abierto y
 * recortado a mano sigue siendo un respaldo, y rechazarlo por el envoltorio
 * sería perder datos por formalismo.
 */
export function revisarRespaldo(texto: string): Revision {
  if (texto.trim() === '') {
    return { ok: false, problema: 'No hay nada que importar: elige un archivo o pega el texto del respaldo.' }
  }

  let analizado: unknown
  try {
    analizado = JSON.parse(texto)
  } catch {
    return {
      ok: false,
      problema: 'El archivo no se pudo leer. ¿Seguro que es un respaldo de Racha y está completo?',
    }
  }

  if (!esObjeto(analizado)) {
    return { ok: false, problema: 'El archivo no tiene la forma de un respaldo de Racha.' }
  }

  const sobre = analizado
  const documento = esObjeto(sobre.documento) ? sobre.documento : sobre

  if (typeof sobre.app === 'string' && sobre.app !== 'racha') {
    return { ok: false, problema: 'Este archivo es el respaldo de otra app, no de Racha.' }
  }

  const problemaDeVersion = revisarVersion(sobre, documento)
  if (problemaDeVersion !== null) return { ok: false, problema: problemaDeVersion }

  const problemaDeForma = revisarForma(documento)
  if (problemaDeForma !== null) return { ok: false, problema: problemaDeForma }

  return {
    ok: true,
    documento: comoDocumento(documento),
    creadoEn: typeof sobre.creadoEn === 'string' ? sobre.creadoEn : null,
  }
}

/**
 * La versión, que es lo primero que se mira (sección 14).
 *
 * Viene en el sobre; si el respaldo es un documento pelón, se busca en sus
 * ajustes. Sin versión no se importa: un archivo que no dice de dónde viene no
 * se puede escribir encima de seis meses de rachas.
 */
function revisarVersion(sobre: Objeto, documento: Objeto): string | null {
  const ajustes = esObjeto(documento.ajustes) ? documento.ajustes : {}
  const version = typeof sobre.version === 'number' ? sobre.version : ajustes.version

  if (typeof version !== 'number') {
    return 'El archivo no dice de qué versión de Racha viene, así que no se puede importar sin riesgo.'
  }

  if (version > VERSION_DE_RESPALDO) {
    return `Este respaldo viene de una versión más nueva de Racha (la ${version}). Actualiza la app antes de importarlo.`
  }

  if (version < VERSION_DE_RESPALDO) {
    return `Este respaldo viene de una versión anterior de Racha (la ${version}) y esta app no sabe convertirlo.`
  }

  return null
}

/** Que estén todas las piezas y que cada una sea lo que dice ser. */
function revisarForma(documento: Objeto): string | null {
  const faltante = LISTAS.find(({ clave }) => !Array.isArray(documento[clave]))
  if (faltante !== undefined) {
    return `Al respaldo le falta ${faltante.nombre}: está incompleto y no se va a importar.`
  }

  if (!esObjeto(documento.ajustes)) {
    return 'Al respaldo le faltan los ajustes: está incompleto y no se va a importar.'
  }

  return null
}

/**
 * El documento ya revisado.
 *
 * Aquí es donde los datos de fuera pasan a tratarse como propios, y es el
 * único lugar de la app donde eso ocurre. La lista de comodines se rellena si
 * no viene: los respaldos hechos antes de la fase 03 no la traen, igual que
 * hace el repositorio al leer.
 */
function comoDocumento(documento: Objeto): DocumentoRacha {
  const revisado = documento as unknown as DocumentoRacha
  return Array.isArray(revisado.comodines) ? revisado : { ...revisado, comodines: [] }
}

type Objeto = Record<string, unknown>

/** Un objeto de verdad: ni `null`, ni una lista, ni un número. */
function esObjeto(valor: unknown): valor is Objeto {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}
