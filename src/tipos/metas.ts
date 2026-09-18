/**
 * Los moldes de las metas de mediano plazo y de sus mediciones.
 *
 * Son los de la sección 4 de `docs/arquitectura.md`, copiados tal cual.
 */

import type { Fecha } from './basicos'

export interface Meta {
  id: string
  nombre: string
  fechaInicio: Fecha
  fechaObjetivo: Fecha
  valorInicial: number
  valorObjetivo: number
  unidad: string
  direccion: DireccionMeta
  campos: CampoMeta[]
  hitos: HitoMeta[]
  habitosVinculados: string[]
  frecuencia: FrecuenciaMeta
  /**
   * Qué día toca medirse, o `null` si no hay día fijo.
   *
   * En una meta **semanal** es el día de la semana, de 0 el lunes a 6 el
   * domingo, igual que en el resto de la app. En una meta **mensual** es el día
   * del mes, del 1 al 28: no se pasa de 28 para que ningún mes se quede sin ese
   * día, que es lo que le pasa al 30 en febrero.
   */
  diaDeMedicion: number | null
  estado: EstadoMeta
  cerradaEn: Fecha | null
}

/** Cada valor que se captura en una medición. */
export interface CampoMeta {
  clave: string
  etiqueta: string
  unidad: string
}

export interface HitoMeta {
  nombre: string
  fecha: Fecha
  valor: number
}

export type DireccionMeta = 'bajar' | 'subir'
export type FrecuenciaMeta = 'semanal' | 'mensual'
export type EstadoMeta = 'activa' | 'cumplida' | 'abandonada'

export interface Medicion {
  id: string
  metaId: string
  fecha: Fecha
  momento: MomentoMedicion
  /** Las llaves son las `clave` de los `campos` de la meta. */
  valores: Record<string, number>
  nota: string | null
}

/** El peso nocturno es más alto; por eso se distingue el momento (sección 11). */
export type MomentoMedicion = 'manana' | 'noche'
