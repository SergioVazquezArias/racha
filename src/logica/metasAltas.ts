/**
 * Crear, editar y cerrar una meta, y capturar una medición.
 *
 * Una meta no se archiva como un hábito: se **cierra**, como cumplida o como
 * abandonada, y en los dos casos se guarda el día en que se cerró. Una meta
 * cerrada se sigue viendo entera —su gráfica, sus mediciones, lo que llegaste a
 * mover— pero ya no pide mediciones nuevas. Abandonar no es un fracaso que haya
 * que esconder: es una decisión con fecha, y queda escrita.
 *
 * Eliminar sí borra todo, y por eso pide escribir el nombre de la meta, igual
 * que con los hábitos (sección 9).
 */

import { nuevoId } from './altas'
import type {
  CampoMeta,
  DireccionMeta,
  Fecha,
  FrecuenciaMeta,
  HitoMeta,
  Medicion,
  Meta,
  MomentoMedicion,
} from '../tipos'

/** Lo que el formulario de una meta maneja. Los números pueden estar vacíos. */
export interface CamposDeMeta {
  nombre: string
  fechaInicio: Fecha
  fechaObjetivo: Fecha
  valorInicial: number | null
  valorObjetivo: number | null
  unidad: string
  direccion: DireccionMeta
  campos: CampoMeta[]
  hitos: HitoMeta[]
  habitosVinculados: string[]
  frecuencia: FrecuenciaMeta
  diaDeMedicion: number | null
}

/** Una meta nueva. Nace activa y sin fecha de cierre. */
export function nuevaMeta(campos: CamposDeMeta, id: string = nuevoId()): Meta {
  return {
    id,
    ...soloLosCampos(campos),
    estado: 'activa',
    cerradaEn: null,
  }
}

/**
 * La misma meta con los cambios del formulario.
 *
 * El id, el estado y la fecha de cierre no se tocan: editar una meta cerrada
 * —corregirle una fecha, por ejemplo— no la revive.
 */
export function conCambios(meta: Meta, campos: CamposDeMeta): Meta {
  return { ...meta, ...soloLosCampos(campos) }
}

/** La meta cerrada, cumplida o abandonada, con el día en que se cerró. */
export function cerrada(meta: Meta, como: 'cumplida' | 'abandonada', cuando: Fecha): Meta {
  return { ...meta, estado: como, cerradaEn: cuando }
}

/** Vuelve a abrir una meta cerrada por error. */
export function reabierta(meta: Meta): Meta {
  return { ...meta, estado: 'activa', cerradaEn: null }
}

/**
 * Si lo escrito coincide con el nombre de la meta.
 *
 * Perdona mayúsculas y espacios de sobra, que en un teclado de teléfono se
 * cuelan solos. No perdona nada más: hay que escribirlo.
 */
export function confirmacionCorrecta(meta: Meta, texto: string): boolean {
  return normalizar(texto) === normalizar(meta.nombre)
}

/**
 * Una medición nueva.
 *
 * Solo se guardan los campos que se llenaron: una pesada sin cintura se guarda
 * con el peso y ya. Un campo vacío es un campo vacío, no un cero.
 */
export function nuevaMedicion(
  metaId: string,
  fecha: Fecha,
  momento: MomentoMedicion,
  valores: Record<string, number | null>,
  nota: string | null = null,
  id: string = nuevoId(),
): Medicion {
  const llenos: Record<string, number> = {}
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== null && Number.isFinite(valor)) llenos[clave] = valor
  }

  return { id, metaId, fecha, momento, valores: llenos, nota }
}

/** La medición de una meta en un día, si ya existe. Capturar dos veces la reemplaza. */
export function medicionDelDia(mediciones: Medicion[], metaId: string, fecha: Fecha): Medicion | null {
  return mediciones.find((una) => una.metaId === metaId && una.fecha === fecha) ?? null
}

/** Los campos que el formulario sí puede cambiar. */
function soloLosCampos(campos: CamposDeMeta) {
  return {
    nombre: campos.nombre.trim(),
    fechaInicio: campos.fechaInicio,
    fechaObjetivo: campos.fechaObjetivo,
    valorInicial: campos.valorInicial ?? 0,
    valorObjetivo: campos.valorObjetivo ?? 0,
    unidad: campos.unidad.trim(),
    direccion: campos.direccion,
    campos: campos.campos,
    hitos: [...campos.hitos].sort((uno, otro) => uno.fecha.localeCompare(otro.fecha)),
    habitosVinculados: campos.habitosVinculados,
    frecuencia: campos.frecuencia,
    diaDeMedicion: campos.diaDeMedicion,
  }
}

function normalizar(texto: string): string {
  return texto.trim().toLocaleLowerCase('es')
}
