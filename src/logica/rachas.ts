/**
 * Las rachas (secciones 5, 6 y 7 del documento de arquitectura).
 *
 * Tres formas de contar, una por cada clase de hábito:
 *
 * - **Diaria** — días seguidos cumplidos.
 * - **Semanal** — semanas seguidas cumplidas, según el semáforo.
 * - **Negativa** — días limpios desde la última recaída.
 *
 * Cuatro cosas valen para las tres:
 *
 * 1. **Hoy nunca cuenta**, ni a favor ni en contra. El juicio llega a
 *    medianoche. Por eso `hoy` se recibe como parámetro y nunca se lee el reloj
 *    aquí dentro: así las pruebas pueden fingir cualquier día.
 * 2. **Nada mira fuera de la vida del hábito.** Ni antes de que existiera, ni
 *    mientras estuvo archivado. De dónde a dónde cuenta lo decide `vida.ts`.
 * 3. La **mejor racha histórica** se devuelve siempre junto a la actual, y no
 *    la borra ni una caída ni un archivado.
 * 4. Un hábito revivido **arranca de cero** pero conserva su récord (sección 9).
 */

import { comodinCubreDia, comodinCubreSemana } from './comodines'
import { claveDeSemana } from './semaforo'
import { claveSemana, diasEntre, sumarDias } from './fechas'
import { finDeConteo, inicioDeConteo } from './vida'
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

/**
 * La mejor racha, que nunca se pierde.
 *
 * Compara la mejor del tramo que se acaba de recorrer contra la que quedó
 * congelada al archivar. Un hábito que vuelve después de seis meses arranca de
 * cero, pero su récord sigue ahí (secciones 6 y 9).
 */
function conRecord(habito: Habito, actual: number, mejorDeAhora: number): ResumenRacha {
  return { actual, mejor: Math.max(mejorDeAhora, habito.mejorRachaPrevia ?? 0) }
}

// ---------------------------------------------------------------------------
// Cadencia diaria
// ---------------------------------------------------------------------------

/**
 * Días seguidos cumplidos, desde que empezó a contar el hábito hasta ayer.
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

  const fin = finDeConteo(habito, hoy)
  let actual = 0
  let mejor = 0

  for (let dia = inicioDeConteo(habito); dia <= fin; dia = sumarDias(dia, 1)) {
    if (cumplidos.has(dia)) actual += 1
    else if (!comodinCubreDia(comodines, habito.id, dia)) actual = 0
    mejor = Math.max(mejor, actual)
  }

  return conRecord(habito, actual, mejor)
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
  // Las semanas anteriores a la vuelta de un hábito revivido siguen guardadas y
  // se ven en su historial, pero no alimentan la racha de ahora (sección 9).
  const desde = claveSemana(inicioDeConteo(habito))
  const propias = semanas
    .filter((semana) => semana.habitoId === habito.id && semana.cerrada && claveDeSemana(semana) >= desde)
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

  return conRecord(habito, actual, mejor)
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
  const inicio = inicioDeConteo(habito)
  const fin = finDeConteo(habito, hoy)

  // La recaída de hoy sí entra, aunque hoy no cuente a favor: el contador no
  // puede decir «12 días limpios» cuando hoy no lo fue. No suma un día, lo
  // rompe. En un hábito archivado no hay recaídas que mirar después del cierre.
  const hasta = habito.archivadoEn === null ? hoy : fin

  const recaidas = registros
    .filter(
      (registro) =>
        registro.habitoId === habito.id &&
        registro.estado === 'fallado' &&
        registro.fecha >= inicio &&
        registro.fecha <= hasta,
    )
    .map((registro) => registro.fecha)
    .sort()

  const tramos: number[] = []
  let arranque = inicio

  for (const recaida of recaidas) {
    tramos.push(Math.max(0, diasEntre(arranque, recaida)))
    arranque = sumarDias(recaida, 1)
  }

  // El tramo en curso: de `arranque` al último día que cuenta. Hoy no entra.
  const actual = arranque > fin ? 0 : diasEntre(arranque, fin) + 1

  return conRecord(habito, actual, Math.max(actual, ...tramos, 0))
}
