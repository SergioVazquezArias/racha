/**
 * Lo que revisa el formulario de una meta antes de guardar.
 *
 * Igual que el de los hábitos: devuelve frases en español listas para
 * enseñarse, no códigos de error, y solo impide lo que después no se podría
 * calcular ni dibujar. Una meta sin hitos o sin hábitos vinculados se guarda
 * sin problema; una meta cuyo objetivo es igual a su punto de partida, no:
 * la recta del plan sería una raya horizontal y el avance, una división entre
 * cero.
 */

import { diasEntre } from './fechas'
import type { CamposDeMeta } from './metasAltas'

/** Los problemas de una meta, en el orden del formulario. Lista vacía: se puede guardar. */
export function problemasDeMeta(campos: CamposDeMeta): string[] {
  const problemas: string[] = []

  if (campos.nombre.trim() === '') problemas.push('Ponle un nombre.')
  if (campos.unidad.trim() === '') problemas.push('Ponle una unidad: kg, puntos, páginas…')
  if (campos.campos.length === 0) problemas.push('Necesita al menos un campo que medir.')

  problemas.push(...problemasDeLosCampos(campos))
  problemas.push(...problemasDeLasFechas(campos))
  problemas.push(...problemasDeLosValores(campos))
  problemas.push(...problemasDeLosHitos(campos))

  return problemas
}

function problemasDeLosCampos(campos: CamposDeMeta): string[] {
  const claves = campos.campos.map((campo) => campo.clave.trim())

  if (claves.some((clave) => clave === '')) return ['Cada campo necesita un nombre.']
  if (new Set(claves).size !== claves.length) return ['Hay dos campos con el mismo nombre.']

  return []
}

function problemasDeLasFechas(campos: CamposDeMeta): string[] {
  if (diasEntre(campos.fechaInicio, campos.fechaObjetivo) <= 0) {
    return ['La fecha objetivo tiene que ser posterior a la de inicio.']
  }

  return []
}

/**
 * Los dos números de la meta.
 *
 * Que la dirección concuerde con ellos no es un capricho: si dice «bajar» pero
 * el objetivo es más alto que el punto de partida, la app diría que vas
 * adelantado justo cuando vas atrás.
 */
function problemasDeLosValores(campos: CamposDeMeta): string[] {
  const inicial = campos.valorInicial
  const objetivo = campos.valorObjetivo

  if (inicial === null || objetivo === null) return ['Faltan el valor de partida o el objetivo.']
  if (inicial === objetivo) return ['El objetivo no puede ser igual al punto de partida.']

  if (campos.direccion === 'bajar' && objetivo > inicial) {
    return ['La meta dice «bajar», pero el objetivo es más alto que el punto de partida.']
  }

  if (campos.direccion === 'subir' && objetivo < inicial) {
    return ['La meta dice «subir», pero el objetivo es más bajo que el punto de partida.']
  }

  return []
}

/** Un hito fuera del camino no se podría dibujar sobre la gráfica. */
function problemasDeLosHitos(campos: CamposDeMeta): string[] {
  const problemas: string[] = []

  for (const hito of campos.hitos) {
    if (hito.nombre.trim() === '') problemas.push('Cada hito necesita un nombre.')

    if (hito.fecha < campos.fechaInicio || hito.fecha > campos.fechaObjetivo) {
      problemas.push(`El hito «${hito.nombre}» cae fuera de las fechas de la meta.`)
    }
  }

  return problemas
}
