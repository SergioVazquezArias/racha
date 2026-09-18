/**
 * El cierre de las semanas que ya terminaron.
 *
 * Los veredictos semanales se calculan una vez y se guardan (regla 8), pero
 * alguien tiene que emitirlos: sin esto, la racha de un hábito semanal se
 * quedaría congelada en cuanto pasara el lunes. Este módulo revisa, al arrancar
 * la app, qué semanas terminadas no tienen veredicto todavía y los devuelve
 * para que el repositorio los guarde.
 *
 * Tres cosas que **no** hace, y son las importantes:
 *
 * 1. **No reescribe nada.** Si una semana ya tiene veredicto guardado, se la
 *    salta. Cambiar hoy el objetivo de un hábito no vuelve a juzgar el mes
 *    pasado (regla 8).
 * 2. **No juzga la semana en curso.** El veredicto llega el lunes siguiente.
 * 3. **No inventa fallas de días en que el hábito no existía** (sección 9). Si
 *    un hábito nació un miércoles, su primera semana quedó a medias y no se
 *    juzga; se empieza a contar desde el lunes siguiente. Lo mismo por el otro
 *    lado: un hábito archivado no sigue acumulando semanas rojas.
 *
 * Es lógica pura: no lee el reloj ni toca `localStorage`. El día de hoy llega
 * como parámetro para que las pruebas puedan fingir cualquier fecha.
 */

import { evaluarSemana } from './semaforo'
import { claveSemana, lunesDeLaSemana, sumarDias } from './fechas'
import type { Fecha, Habito, Registro, Semana } from '../tipos'

/**
 * Los veredictos que faltan por guardar.
 *
 * Solo mira hábitos positivos de cadencia semanal: son los únicos que tienen
 * semáforo. Un hábito diario cuenta días y un hábito negativo cuenta días
 * limpios; ninguno de los dos necesita veredicto de semana.
 */
export function semanasPorCerrar(
  habitos: Habito[],
  registros: Registro[],
  semanas: Semana[],
  hoy: Fecha,
): Semana[] {
  const guardadas = new Set(semanas.map((semana) => semana.id))
  const nuevas: Semana[] = []

  for (const habito of habitos) {
    if (habito.tipo !== 'positivo' || habito.cadencia !== 'semanal') continue

    for (const lunes of lunesesPorJuzgar(habito, hoy)) {
      const veredicto = evaluarSemana(habito, claveSemana(lunes), registros)
      if (!guardadas.has(veredicto.id)) nuevas.push(veredicto)
    }
  }

  return nuevas
}

/**
 * Los lunes de las semanas de este hábito que ya terminaron y le corresponden
 * por completo, de la más vieja a la más nueva.
 */
function lunesesPorJuzgar(habito: Habito, hoy: Fecha): Fecha[] {
  const primero = primerLunesCompleto(habito.creadoEn)
  const ultimo = ultimoLunesJuzgable(habito, hoy)

  const luneses: Fecha[] = []
  for (let lunes = primero; lunes <= ultimo; lunes = sumarDias(lunes, 7)) luneses.push(lunes)
  return luneses
}

/**
 * El lunes de la primera semana que el hábito vivió completa.
 *
 * Si nació en lunes, ese mismo. Si nació a media semana, el lunes siguiente:
 * esa primera semana a medias no se juzga nunca.
 */
function primerLunesCompleto(creadoEn: Fecha): Fecha {
  const lunes = lunesDeLaSemana(creadoEn)
  return lunes === creadoEn ? lunes : sumarDias(lunes, 7)
}

/**
 * El lunes de la última semana juzgable: la anterior a la de hoy, o la anterior
 * a la del archivado si el hábito ya se archivó.
 */
function ultimoLunesJuzgable(habito: Habito, hoy: Fecha): Fecha {
  const anteriorAHoy = sumarDias(lunesDeLaSemana(hoy), -7)
  if (habito.archivadoEn === null) return anteriorAHoy

  const anteriorAlArchivado = sumarDias(lunesDeLaSemana(habito.archivadoEn), -7)
  return anteriorAlArchivado < anteriorAHoy ? anteriorAlArchivado : anteriorAHoy
}
