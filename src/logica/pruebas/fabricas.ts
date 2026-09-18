/**
 * Fábricas de datos de mentiras para las pruebas.
 *
 * Existen para que cada prueba diga solo lo que le importa —«un hábito semanal
 * de 5 con mínimo 3»— y no tenga que repetir los veinte campos de un `Habito`.
 * Este archivo no forma parte de la app: nada dentro de `src` lo importa salvo
 * los archivos `.test.ts`.
 */

import { claveSemana, sumarDias } from '../fechas'
import type {
  ClaveSemana,
  ColorSemana,
  Comodin,
  Fecha,
  Habito,
  Medicion,
  Meta,
  MomentoMedicion,
  Registro,
  Semana,
} from '../../tipos'

/** Un hábito positivo de cadencia diaria. */
export function habitoDiario(creadoEn: Fecha, cambios: Partial<Habito> = {}): Habito {
  return {
    id: 'habito',
    nombre: 'Hábito de prueba',
    alias: null,
    icono: '✅',
    privado: false,
    tipo: 'positivo',
    cadencia: 'diaria',
    objetivo: null,
    minimo: null,
    permiteComodin: true,
    contextos: [],
    orden: 1,
    creadoEn,
    archivadoEn: null,
    revividoEn: null,
    mejorRachaPrevia: null,
    ...cambios,
  }
}

/** Un hábito positivo de cadencia semanal: `objetivo` veces por semana. */
export function habitoSemanal(creadoEn: Fecha, objetivo: number, minimo: number, cambios: Partial<Habito> = {}): Habito {
  return habitoDiario(creadoEn, { cadencia: 'semanal', objetivo, minimo, ...cambios })
}

/** Un hábito negativo. Nunca admite comodines (sección 7). */
export function habitoNegativo(creadoEn: Fecha, cambios: Partial<Habito> = {}): Habito {
  return habitoDiario(creadoEn, { tipo: 'negativo', permiteComodin: false, ...cambios })
}

/** Un día cumplido de un hábito positivo. */
export function cumplido(habitoId: string, fecha: Fecha): Registro {
  return { id: `${habitoId}:${fecha}`, habitoId, fecha, estado: 'cumplido', valor: null, hora: null, contexto: null, nota: null }
}

/** Una recaída de un hábito negativo. */
export function recaida(habitoId: string, fecha: Fecha, hora = '21:00'): Registro {
  return { id: `${habitoId}:${fecha}`, habitoId, fecha, estado: 'fallado', valor: null, hora, contexto: null, nota: null }
}

/** Varios días cumplidos de golpe. */
export function cumplidos(habitoId: string, fechas: Fecha[]): Registro[] {
  return fechas.map((fecha) => cumplido(habitoId, fecha))
}

/**
 * Un veredicto de semana ya cerrado, con el objetivo y el mínimo congelados
 * tal como estaban ese día (regla 8).
 */
export function semanaCerrada(habitoId: string, clave: ClaveSemana, color: ColorSemana, cambios: Partial<Semana> = {}): Semana {
  return {
    id: `${habitoId}:${clave}`,
    habitoId,
    hechos: color === 'verde' ? 5 : color === 'ambar' ? 4 : 1,
    objetivo: 5,
    minimo: 3,
    color,
    comodinUsado: false,
    cerrada: true,
    ...cambios,
  }
}

/** La misma semana cerrada, pero nombrada por una fecha cualquiera dentro de ella. */
export function semanaDe(habitoId: string, fecha: Fecha, color: ColorSemana, cambios: Partial<Semana> = {}): Semana {
  return semanaCerrada(habitoId, claveSemana(fecha), color, cambios)
}

/** Un comodín gastado hoy sobre el día indicado. */
export function comodin(habitoId: string, fecha: Fecha, aplicadoEn: Fecha = fecha): Comodin {
  return { id: `${habitoId}:${fecha}`, habitoId, fecha, aplicadoEn }
}

/**
 * Una meta de peso de ejemplo: de 82 kg el 15 de septiembre a 75 kg el 14
 * de abril. Son 211 días y 7 kg, el ritmo de 0.23 kg por semana del documento.
 */
export function metaDePeso(cambios: Partial<Meta> = {}): Meta {
  return {
    id: 'peso',
    nombre: 'Peso',
    fechaInicio: '2026-09-15',
    fechaObjetivo: '2027-04-14',
    valorInicial: 82,
    valorObjetivo: 75,
    unidad: 'kg',
    direccion: 'bajar',
    campos: [
      { clave: 'peso', etiqueta: 'Peso', unidad: 'kg' },
      { clave: 'cintura', etiqueta: 'Cintura', unidad: 'cm' },
      { clave: 'pecho', etiqueta: 'Pecho', unidad: 'cm' },
      { clave: 'cuello', etiqueta: 'Cuello', unidad: 'cm' },
    ],
    hitos: [{ nombre: 'Mitad del camino', fecha: '2027-03-24', valor: 75.7 }],
    habitosVinculados: ['gym'],
    frecuencia: 'semanal',
    estado: 'activa',
    cerradaEn: null,
    ...cambios,
  }
}

/** La meta de inglés: de 50 a 70 puntos. Una meta que **sube**, no que baja. */
export function metaDeIngles(cambios: Partial<Meta> = {}): Meta {
  return metaDePeso({
    id: 'ingles',
    nombre: 'Inglés',
    fechaInicio: '2026-10-01',
    fechaObjetivo: '2027-09-15',
    valorInicial: 50,
    valorObjetivo: 70,
    unidad: 'puntos',
    direccion: 'subir',
    campos: [{ clave: 'puntaje', etiqueta: 'Puntaje', unidad: 'puntos' }],
    hitos: [{ nombre: 'B1 confirmado', fecha: '2027-03-15', valor: 58 }],
    habitosVinculados: ['ingles'],
    frecuencia: 'mensual',
    ...cambios,
  })
}

/** Una medición. Por omisión es de mañana, que es como se pesa uno. */
export function medicion(
  metaId: string,
  fecha: Fecha,
  valores: Record<string, number>,
  momento: MomentoMedicion = 'manana',
): Medicion {
  return { id: `${metaId}:${fecha}`, metaId, fecha, momento, valores, nota: null }
}

/** Varias pesadas seguidas, una por semana, empezando en la fecha dada. */
export function pesadas(desde: Fecha, pesos: number[], cadaCuantosDias = 7): Medicion[] {
  return pesos.map((peso, cuantas) => {
    const fecha = sumarDias(desde, cuantas * cadaCuantosDias)
    return medicion('peso', fecha, { peso })
  })
}
