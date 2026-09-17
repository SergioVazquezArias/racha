/**
 * Moldes de datos de Racha.
 *
 * Son los de la sección 4 de `docs/arquitectura.md`, copiados tal cual.
 * Si algo cambia aquí, cambia primero en el documento.
 *
 * Toda fecha es una cadena `"YYYY-MM-DD"` en hora local (regla 2). Nunca UTC,
 * nunca un timestamp: un viaje a otro huso horario no debe alterar una racha.
 */

/** Fecha de un día, `"YYYY-MM-DD"` en hora local. */
export type Fecha = string

/** Identificador de semana ISO, `"2026-W38"`. */
export type ClaveSemana = string

/** Hora del día, `"HH:MM"` en hora local. */
export type Hora = string

// ---------------------------------------------------------------------------
// Habito
// ---------------------------------------------------------------------------

/** Un hábito nunca se borra por accidente: se archiva (sección 9). */
export interface Habito {
  id: string
  /** El nombre real. Solo lo ve el usuario; nunca se escribe en el repositorio. */
  nombre: string
  /** Lo que se muestra si `privado === true`. */
  alias: string | null
  /** Emoji, o `"●"` si es privado: un emoji delata más que el texto. */
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

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Semana
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Medicion
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Ajustes
// ---------------------------------------------------------------------------

export interface Ajustes {
  tema: Tema
  inicioSemana: 'lunes'
  /** En centímetros. Se usa para estimar la grasa corporal (sección 11). */
  estaturaCm: number
  ultimoRespaldo: Fecha | null
  version: 1
}

export type Tema = 'claro' | 'oscuro' | 'sistema'

// ---------------------------------------------------------------------------
// Documento completo
// ---------------------------------------------------------------------------

/** Todo lo que se guarda en `localStorage`, bajo una sola llave. */
export interface DocumentoRacha {
  habitos: Habito[]
  registros: Registro[]
  semanas: Semana[]
  metas: Meta[]
  mediciones: Medicion[]
  ajustes: Ajustes
}
