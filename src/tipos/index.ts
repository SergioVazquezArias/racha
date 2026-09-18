/**
 * Moldes de datos de Racha.
 *
 * Son los de la sección 4 de `docs/arquitectura.md`. El resto del código los
 * importa siempre desde aquí, escribiendo `from '../tipos'`, sin enterarse de
 * en qué archivo vive cada uno.
 *
 * Están repartidos en tres para no pasar de doscientos renglones (regla 4):
 * los tipos básicos, los de hábitos y los de metas.
 */

import type { Fecha } from './basicos'
import type { Comodin, Habito, Registro, Semana } from './habitos'
import type { Medicion, Meta } from './metas'

export type { ClaveSemana, Fecha, Hora } from './basicos'
export type {
  Cadencia,
  ColorSemana,
  Comodin,
  EstadoRegistro,
  Habito,
  Registro,
  Semana,
  TipoHabito,
} from './habitos'
export type {
  CampoMeta,
  DireccionMeta,
  EstadoMeta,
  FrecuenciaMeta,
  HitoMeta,
  Medicion,
  Meta,
  MomentoMedicion,
} from './metas'

export interface Ajustes {
  tema: Tema
  inicioSemana: 'lunes'
  /** En centímetros. Se usa para estimar la grasa corporal (sección 11). */
  estaturaCm: number
  ultimoRespaldo: Fecha | null
  version: 1
}

export type Tema = 'claro' | 'oscuro' | 'sistema'

/** Todo lo que se guarda en `localStorage`, bajo una sola llave. */
export interface DocumentoRacha {
  habitos: Habito[]
  registros: Registro[]
  semanas: Semana[]
  comodines: Comodin[]
  metas: Meta[]
  mediciones: Medicion[]
  ajustes: Ajustes
}
