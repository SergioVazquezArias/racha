/**
 * Las rachas (secciones 5, 6 y 7 del documento de arquitectura).
 *
 * Tres formas de contar, una por cada clase de hábito:
 *
 * - **Diaria** — días seguidos cumplidos.
 * - **Semanal** — semanas seguidas cumplidas, según el semáforo.
 * - **Negativa** — días limpios desde la última recaída.
 *
 * Tres cosas valen para las tres:
 *
 * 1. **Hoy nunca cuenta**, ni a favor ni en contra. El juicio llega a
 *    medianoche. Por eso `hoy` se recibe como parámetro y nunca se lee el reloj
 *    aquí dentro: así las pruebas pueden fingir cualquier día.
 * 2. **Nada mira más atrás de `creadoEn`.** Un hábito nuevo no inventa fallas
 *    de días en que no existía (sección 9).
 * 3. La **mejor racha histórica** se devuelve siempre junto a la actual, y una
 *    caída nunca la borra.
 */

import { comodinCubreDia, comodinCubreSemana } from './comodines'
import { claveDeSemana } from './semaforo'
import { diasEntre, sumarDias } from './fechas'
import type { Comodin, Fecha, Habito, Registro, Semana } from '../tipos'

/** Lo que siempre se muestra junto: la racha de ahora y el récord (sección 6). */
export interface ResumenRacha {
  actual: number
  mejor: number
}

/** Todo lo que hace falta para calcular la racha de cualquier hábito. */
export interface DatosDeRacha {
  registros: Registro[]
  semanas: Semana[]
  comodines: Comodin[]
}

/**
 * La racha de un hábito, sea cual sea su clase.
 *
 * Es el único punto que necesitan las pantallas: ellas no deciden qué forma de
 * contar aplica.
 */
export function rachaDe(habito: Habito, datos: DatosDeRacha, hoy: Fecha): ResumenRacha {
  if (habito.tipo === 'negativo') return rachaNegativa(habito, datos.registros, hoy)
  if (habito.cadencia === 'semanal') return rachaSemanal(habito, datos.semanas, datos.comodines)
  return rachaDiaria(habito, datos.registros, hoy, datos.comodines)
}

// ---------------------------------------------------------------------------
// Cadencia diaria
// ---------------------------------------------------------------------------

/**
 * Días seguidos cumplidos, desde que se creó el hábito hasta ayer.
 *
 * Un día del pasado sin palomita es una falla: a medianoche se cerró sin
 * cumplir (sección 5). Salvo que lleve comodín, y entonces el día se salta sin
 * sumar ni restar.
 */
export function rachaDiaria(
  habito: Habito,
  registros: Registro[],
  hoy: Fecha,
  comodines: Comodin[] = [],
): ResumenRacha {
  const cumplidos = new Set(
    registros
      .filter((registro) => registro.habitoId === habito.id && registro.estado === 'cumplido')
      .map((registro) => registro.fecha),
  )

  const ayer = sumarDias(hoy, -1)
  let actual = 0
  let mejor = 0

  for (let dia = habito.creadoEn; dia <= ayer; dia = sumarDias(dia, 1)) {
    if (cumplidos.has(dia)) actual += 1
    else if (!comodinCubreDia(comodines, habito.id, dia)) actual = 0
    mejor = Math.max(mejor, actual)
  }

  return { actual, mejor }
}

// ---------------------------------------------------------------------------
// Cadencia semanal
// ---------------------------------------------------------------------------

/**
 * Semanas seguidas cumplidas.
 *
 * Camina los veredictos ya cerrados, de la semana más vieja a la más nueva, y
 * aplica el semáforo: verde suma, ámbar suma pero deja marca, rojo pone la
 * racha en cero. **Dos ámbar consecutivas también la rompen**: un mal día
 * cuesta una marca, dos malas semanas cuestan la racha.
 *
 * Lee el color guardado y no lo recalcula. Cambiar el objetivo hoy no reescribe
 * una semana cerrada el mes pasado (regla 8).
 */
export function rachaSemanal(habito: Habito, semanas: Semana[], comodines: Comodin[] = []): ResumenRacha {
  const propias = semanas
    .filter((semana) => semana.habitoId === habito.id && semana.cerrada)
    .sort((una, otra) => claveDeSemana(una).localeCompare(claveDeSemana(otra)))

  let actual = 0
  let mejor = 0
  let ambarPrevia = false

  for (const semana of propias) {
    // Un comodín sobre una semana roja la congela: ni sube ni baja, y la semana
    // sigue pintada de rojo con su escudo. Nunca se vuelve verde.
    if (semana.color === 'rojo' && comodinCubreSemana(comodines, habito.id, claveDeSemana(semana))) continue

    if (semana.color === 'verde') {
      actual += 1
      ambarPrevia = false
    } else if (semana.color === 'ambar') {
      actual = ambarPrevia ? 0 : actual + 1
      ambarPrevia = true
    } else {
      actual = 0
      ambarPrevia = false
    }

    mejor = Math.max(mejor, actual)
  }

  return { actual, mejor }
}

// ---------------------------------------------------------------------------
// Hábitos negativos
// ---------------------------------------------------------------------------

/**
 * Días limpios de un hábito negativo.
 *
 * No recorre días: un negativo está limpio mientras no haya registro, así que
 * la cuenta es una resta de fechas entre recaídas (sección 5). La mejor racha
 * es el tramo limpio más largo que haya existido, y una recaída de hoy no borra
 * el récord de hace seis meses.
 *
 * Los comodines no aparecen por ninguna parte, a propósito: una recaída es una
 * recaída (sección 7).
 */
export function rachaNegativa(habito: Habito, registros: Registro[], hoy: Fecha): ResumenRacha {
  const recaidas = registros
    .filter((registro) => registro.habitoId === habito.id && registro.estado === 'fallado')
    .map((registro) => registro.fecha)
    .sort()

  const tramos: number[] = []
  let inicio = habito.creadoEn

  for (const recaida of recaidas) {
    tramos.push(Math.max(0, diasEntre(inicio, recaida)))
    inicio = sumarDias(recaida, 1)
  }

  // El tramo en curso: de `inicio` hasta ayer. Hoy todavía no cuenta.
  const actual = Math.max(0, diasEntre(inicio, hoy))

  return { actual, mejor: Math.max(actual, ...tramos, 0) }
}
