/**
 * Los moldes de los hábitos y de todo lo que se registra sobre ellos.
 *
 * Son los de la sección 4 de `docs/arquitectura.md`, copiados tal cual. Si algo
 * cambia aquí, cambia primero en el documento.
 */

import type { Fecha, Hora } from './basicos'

/** Un hábito nunca se borra por accidente: se archiva (sección 9). */
export interface Habito {
  id: string
  /** El nombre real. Solo lo ve el usuario; nunca se escribe en el repositorio. */
  nombre: string
  /** Lo que se muestra si `privado === true`. */
  alias: string | null
  /** Emoji. Los privados también llevan el suyo: una marca los delataría. */
  icono: string
  privado: boolean
  tipo: TipoHabito
  cadencia: Cadencia
  /** Veces por semana. `null` si la cadencia es diaria. */
  objetivo: number | null
  /** Piso que mantiene viva la racha. `null` si la cadencia es diaria. */
  minimo: number | null
  /** Siempre `false` en los negativos: una recaída es una recaída (sección 7). */
  permiteComodin: boolean
  /** Opciones de detonante que se ofrecen al registrar una recaída. */
  contextos: string[]
  orden: number
  creadoEn: Fecha
  archivadoEn: Fecha | null
}

/** Positivo se marca al cumplirlo; negativo solo se toca al recaer (sección 5). */
export type TipoHabito = 'positivo' | 'negativo'

/** Diaria cuenta días consecutivos; semanal cuenta semanas cumplidas (sección 6). */
export type Cadencia = 'diaria' | 'semanal'

/** Uno por hábito por día. El `id` compuesto hace imposible duplicar un día. */
export interface Registro {
  /** `${habitoId}:${fecha}` */
  id: string
  habitoId: string
  fecha: Fecha
  estado: EstadoRegistro
  /** Minutos, repeticiones, etc. */
  valor: number | null
  /** Solo en recaídas. */
  hora: Hora | null
  /** Solo en recaídas. */
  contexto: string | null
  nota: string | null
}

export type EstadoRegistro = 'cumplido' | 'fallado'

/**
 * El veredicto de una semana, calculado una sola vez al cerrarla y guardado
 * (regla 8). Cambiar el objetivo de un hábito no reescribe el pasado.
 */
export interface Semana {
  /** `${habitoId}:2026-W38` */
  id: string
  habitoId: string
  hechos: number
  /** El objetivo vigente cuando se cerró la semana. */
  objetivo: number
  minimo: number
  color: ColorSemana
  comodinUsado: boolean
  cerrada: boolean
}

/** Verde suma racha; ámbar suma pero marca; rojo la pone en cero (sección 6). */
export type ColorSemana = 'verde' | 'ambar' | 'rojo'

/**
 * Un comodín gastado. Congela un día fallado o una semana roja: la racha no
 * crece, pero tampoco se rompe (sección 7).
 *
 * Se guarda como entidad propia y no como una bandera dentro de `Semana`
 * porque hacen falta las dos fechas: sin ellas no se puede comprobar ni el
 * límite de tres días hacia atrás ni la regla de uno al mes.
 */
export interface Comodin {
  /** `${habitoId}:${fecha}` */
  id: string
  habitoId: string
  /** El día que queda congelado. En cadencia semanal congela toda su semana. */
  fecha: Fecha
  /** El día en que se gastó. Decide de qué mes sale: uno al mes, sin acumular. */
  aplicadoEn: Fecha
}
