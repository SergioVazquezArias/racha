/**
 * Los ocho hábitos de la sección 12 del documento de arquitectura.
 *
 * Son datos de relleno para que la app no nazca vacía. El usuario los edita,
 * archiva o borra desde la propia app.
 *
 * Los dos hábitos privados llevan alias genéricos a propósito: el repositorio
 * es público y ningún dato personal puede vivir en el código. El nombre real y
 * los contextos de esos dos los escribe el usuario dentro de la app.
 */

import { hoy, sumarDias } from '../../logica/fechas'
import type { Habito } from '../../tipos'

/** Hace cuántas semanas arrancó el historial de ejemplo. */
export const SEMANAS_DE_EJEMPLO = 10

/** Contextos típicos de recaída que se ofrecen de un toque (sección 10). */
const CONTEXTOS_COMUNES = ['con amigos', 'estrés', 'después de comer', 'solo en casa', 'en la calle']

/** Contextos de relleno para los privados; el usuario los reemplaza en la app. */
const CONTEXTOS_DE_RELLENO = ['contexto 1', 'contexto 2', 'contexto 3']

/** Los ocho hábitos, en el orden en que se ven en la pantalla Hoy. */
export function habitosDeEjemplo(): Habito[] {
  // Todos nacen un poco antes del historial: un hábito nunca mira hacia atrás
  // de su `creadoEn` ni inventa fallas de días en que no existía (sección 9).
  const creadoEn = sumarDias(hoy(), -(SEMANAS_DE_EJEMPLO * 7 + 7))

  return [
    positivo('gym', 'Ir al gym', '🏋️', 5, 4, 1, creadoEn),
    positivo('leer', 'Leer 15 min', '📖', 6, 5, 2, creadoEn),
    positivo('ingles', 'Inglés con Claude · 30 min', '🗣️', 6, 5, 3, creadoEn),
    negativo('sin-pantallas', 'Sin pantallas', '📱', CONTEXTOS_COMUNES, false, 4, creadoEn),
    negativo('sin-refresco', 'Sin refresco', '🥤', CONTEXTOS_COMUNES, false, 5, creadoEn),
    negativo('sin-postre', 'Sin postre', '🍰', CONTEXTOS_COMUNES, false, 6, creadoEn),
    negativo('privado-1', 'Hábito privado 1', '●', CONTEXTOS_DE_RELLENO, true, 7, creadoEn),
    negativo('privado-2', 'Hábito privado 2', '●', CONTEXTOS_DE_RELLENO, true, 8, creadoEn),
  ]
}

/** Hábito positivo: se marca con palomita, admite comodín, cadencia semanal. */
function positivo(
  id: string,
  nombre: string,
  icono: string,
  objetivo: number,
  minimo: number,
  orden: number,
  creadoEn: string,
): Habito {
  return {
    id,
    nombre,
    alias: null,
    icono,
    privado: false,
    tipo: 'positivo',
    cadencia: 'semanal',
    objetivo,
    minimo,
    permiteComodin: true,
    contextos: [],
    orden,
    creadoEn,
    archivadoEn: null,
  }
}

/** Hábito negativo: solo se toca al recaer y nunca admite comodín (sección 7). */
function negativo(
  id: string,
  nombre: string,
  icono: string,
  contextos: string[],
  privado: boolean,
  orden: number,
  creadoEn: string,
): Habito {
  return {
    id,
    nombre,
    // En los privados el alias es lo único que se ve mientras el interruptor
    // de "mostrar nombres reales" esté apagado, que es como arranca siempre.
    alias: privado ? nombre : null,
    icono,
    privado,
    tipo: 'negativo',
    cadencia: 'diaria',
    objetivo: null,
    minimo: null,
    permiteComodin: false,
    contextos,
    orden,
    creadoEn,
    archivadoEn: null,
  }
}
