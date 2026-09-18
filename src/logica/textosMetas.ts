/**
 * Los textos de las metas, en español y en palabras.
 *
 * El documento es explícito en esto (sección 11): la proyección se **redacta**,
 * no se enseña como un porcentaje suelto. «Vas al 68 %» no le dice nada a
 * nadie; «a este ritmo llegas a 75 kg el 2 de abril, 12 días antes» sí.
 *
 * Igual que los textos de los hábitos, ninguno de estos juzga. Si la tendencia
 * va en contra se dice que va en contra, sin reproche y sin caritas.
 */

import { DIAS_DE_LA_SEMANA, diaYMesEnPalabras, fechaLargaEnPalabras } from './fechas'
import { AJUSTE_NOCTURNO_KG } from './tendencia'
import { pluralizar } from './textos'
import type { ProgresoDeMeta } from './metas'
import type { Proyeccion } from './tendencia'
import type { Meta } from '../tipos'

/** Un número sin decimales de adorno: `75`, `81.4`, `75.75`. */
export function numero(valor: number): string {
  return String(Math.round(valor * 100) / 100)
}

/** Un valor con su unidad: `"75 kg"`, `"70 puntos"`. */
export function valorConUnidad(valor: number, unidad: string): string {
  return `${numero(valor)} ${unidad}`
}

/**
 * La proyección, redactada.
 *
 * Son cuatro frases posibles y ninguna deja al usuario adivinando: faltan
 * mediciones, llegas antes, llegas después, o no llegas.
 */
export function textoDeProyeccion(meta: Meta, proyeccion: Proyeccion): string {
  const objetivo = valorConUnidad(meta.valorObjetivo, meta.unidad)

  if (proyeccion.faltan > 0) {
    const verbo = proyeccion.faltan === 1 ? 'Falta' : 'Faltan'
    return `${verbo} ${pluralizar(proyeccion.faltan, 'medición', 'mediciones')} para poder proyectar.`
  }

  if (!proyeccion.llegas || proyeccion.fechaLlegada === null) {
    return `La tendencia va en contra: a este ritmo no llegas a ${objetivo}.`
  }

  const cuando = diaYMesEnPalabras(proyeccion.fechaLlegada)
  const diferencia = proyeccion.diferenciaEnDias ?? 0

  if (diferencia === 0) return `A este ritmo llegas a ${objetivo} el ${cuando}, justo en la fecha.`

  const dias = pluralizar(Math.abs(diferencia), 'día', 'días')
  return `A este ritmo llegas a ${objetivo} el ${cuando}, ${dias} ${diferencia > 0 ? 'antes' : 'después'}.`
}

/** Cómo vas contra la recta del plan. */
export function textoDeProgreso(meta: Meta, progreso: ProgresoDeMeta): string {
  if (progreso.valorActual === null) return 'Todavía no hay mediciones.'
  if (progreso.logrado) return `Objetivo alcanzado: ${valorConUnidad(progreso.valorActual, meta.unidad)}.`

  const ventaja = progreso.ventaja ?? 0
  const distancia = valorConUnidad(Math.abs(ventaja), meta.unidad)

  if (Math.abs(ventaja) < 0.05) return 'Vas justo sobre el plan.'
  return ventaja > 0 ? `Vas ${distancia} adelante del plan.` : `Vas ${distancia} atrás del plan.`
}

/** Cuánto falta para el objetivo. */
export function textoDeRestante(meta: Meta, progreso: ProgresoDeMeta): string {
  if (progreso.restante === null) return `Objetivo: ${valorConUnidad(meta.valorObjetivo, meta.unidad)}`
  if (progreso.restante === 0) return 'Ya llegaste al objetivo'
  return `Faltan ${valorConUnidad(progreso.restante, meta.unidad)}`
}

/**
 * El aviso del ajuste nocturno (sección 11).
 *
 * Devuelve `null` cuando no se está ajustando nada, para que la línea no
 * aparezca de adorno. Cuando aparece, dice exactamente qué se hizo y a cuántas
 * mediciones: nada oculto.
 */
export function textoDelAjusteNocturno(proyeccion: Proyeccion): string | null {
  if (proyeccion.nocturnas === 0) return null

  const cuantas = pluralizar(proyeccion.nocturnas, 'medición', 'mediciones')
  const verbo = proyeccion.nocturnas === 1 ? 'fue de noche; se le resta' : 'fueron de noche; se les restan'
  return `${cuantas} ${verbo} ${AJUSTE_NOCTURNO_KG} kg solo para calcular la tendencia. En la gráfica se ven con punto hueco y con el peso que capturaste.`
}

/** El estado de una meta cerrada. `null` si sigue activa. */
export function textoDeCierre(meta: Meta): string | null {
  if (meta.estado === 'activa' || meta.cerradaEn === null) return null

  const cuando = fechaLargaEnPalabras(meta.cerradaEn)
  return meta.estado === 'cumplida' ? `Cumplida el ${cuando}` : `Abandonada el ${cuando}`
}

/** La grasa corporal, siempre presentada como estimación (sección 11). */
export function textoDeGrasa(porcentaje: number): string {
  return `${numero(porcentaje)} % estimado`
}

/**
 * Cada cuánto y qué día se mide una meta: `"Semanal, los domingos"`.
 *
 * Sin día fijo se dice solo la cadencia. En plural solo se le pone ese al
 * sábado y al domingo: se dice «los lunes», no «los luneses».
 */
export function textoDeCadencia(meta: Meta): string {
  const cadencia = meta.frecuencia === 'semanal' ? 'Semanal' : 'Mensual'
  const dia = meta.diaDeMedicion
  if (dia === null) return cadencia

  if (meta.frecuencia === 'mensual') return `${cadencia}, el día ${dia}`

  const nombre = DIAS_DE_LA_SEMANA[dia]
  if (nombre === undefined) return cadencia

  return `${cadencia}, los ${dia >= 5 ? `${nombre}s` : nombre}`
}
