/**
 * El semáforo semanal (sección 6 del documento de arquitectura).
 *
 * Un hábito de cadencia semanal tiene dos números: `objetivo` —lo que se
 * propuso— y `minimo` —el piso que mantiene viva la racha—. Comparar lo hecho
 * contra esos dos da el color de la semana.
 *
 * El veredicto se calcula una sola vez, al cerrar la semana, y se guarda con
 * el objetivo y el mínimo congelados (regla 8). Cambiar la meta más adelante no
 * reescribe el pasado.
 */

import { claveSemana } from './fechas'
import type { ClaveSemana, ColorSemana, Habito, Registro, Semana } from '../tipos'

/**
 * El color de una semana.
 *
 * Verde si se alcanzó el objetivo, ámbar si se quedó corto pero llegó al
 * mínimo, rojo si ni siquiera eso.
 */
export function colorDeSemana(hechos: number, objetivo: number, minimo: number): ColorSemana {
  if (hechos >= objetivo) return 'verde'
  if (hechos >= minimo) return 'ambar'
  return 'rojo'
}

/**
 * La clave de semana guardada dentro del `id` de una `Semana`.
 *
 * El `id` es `${habitoId}:${clave}`, así que se recorta por el largo del id del
 * hábito y no por el primer dos puntos: un id de hábito podría llevar uno.
 */
export function claveDeSemana(semana: Semana): ClaveSemana {
  return semana.id.slice(semana.habitoId.length + 1)
}

/**
 * Cierra una semana y emite su veredicto.
 *
 * Cuenta los días cumplidos de ese hábito dentro de esa semana. No mira días
 * anteriores a `creadoEn`: un hábito nuevo nunca inventa fallas de días en que
 * no existía (sección 9).
 *
 * `comodinUsado` nace en `false`. Lo prende quien aplica el comodín, no el
 * cierre de la semana.
 */
export function evaluarSemana(habito: Habito, clave: ClaveSemana, registros: Registro[]): Semana {
  const objetivo = habito.objetivo ?? 1
  const minimo = habito.minimo ?? 1

  const hechos = registros.filter(
    (registro) =>
      registro.habitoId === habito.id &&
      registro.estado === 'cumplido' &&
      registro.fecha >= habito.creadoEn &&
      claveSemana(registro.fecha) === clave,
  ).length

  return {
    id: `${habito.id}:${clave}`,
    habitoId: habito.id,
    hechos,
    objetivo,
    minimo,
    color: colorDeSemana(hechos, objetivo, minimo),
    comodinUsado: false,
    cerrada: true,
  }
}
