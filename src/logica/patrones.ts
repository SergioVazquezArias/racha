/**
 * Los patrones de recaída (sección 10 del documento de arquitectura).
 *
 * Cinco de los ocho hábitos son negativos, así que las recaídas son el dato más
 * valioso de la app. Al registrarlas se capturan tres cosas —día, hora y
 * contexto— y aquí se convierten en las tres respuestas que valen la pena:
 * **cuándo pasa**, **a qué hora** y **con qué**.
 *
 * El tono es el mismo del registro: esto informa, no regaña. Una frase como
 * «el 71 % de tus recaídas son viernes o sábado» sirve para decidir qué hacer
 * el viernes; «llevas muchas recaídas» no sirve para nada.
 */

import { DIAS_DE_LA_SEMANA, diaDeLaSemana } from './fechas'
import type { Habito, Registro } from '../tipos'

/** Una fila de cualquiera de los tres patrones. */
export interface Conteo {
  etiqueta: string
  cuenta: number
  /** De 0 a 100, sobre el total de recaídas de ese patrón. */
  porcentaje: number
}

/** Las franjas del día, de cuatro en cuatro horas del reloj de seis. */
const FRANJAS = [
  { etiqueta: 'madrugada · 00 a 06', desde: 0, hasta: 6 },
  { etiqueta: 'mañana · 06 a 12', desde: 6, hasta: 12 },
  { etiqueta: 'tarde · 12 a 18', desde: 12, hasta: 18 },
  { etiqueta: 'noche · 18 a 24', desde: 18, hasta: 24 },
]

/** Las recaídas de un grupo de hábitos. Solo los negativos tienen. */
export function recaidasDe(habitos: Habito[], registros: Registro[]): Registro[] {
  const negativos = new Set(habitos.filter((habito) => habito.tipo === 'negativo').map((habito) => habito.id))

  return registros.filter((registro) => registro.estado === 'fallado' && negativos.has(registro.habitoId))
}

/**
 * Las recaídas por día de la semana, de lunes a domingo.
 *
 * Los siete días salen siempre, aunque alguno vaya en cero: un cero también es
 * el patrón, y una lista a la que le faltan días se lee mal.
 */
export function recaidasPorDia(recaidas: Registro[]): Conteo[] {
  const cuentas = new Array<number>(7).fill(0)

  for (const recaida of recaidas) {
    const dia = diaDeLaSemana(recaida.fecha)
    cuentas[dia] = (cuentas[dia] ?? 0) + 1
  }

  return cuentas.map((cuenta, dia) => ({
    etiqueta: DIAS_DE_LA_SEMANA[dia] ?? '',
    cuenta,
    porcentaje: porcentaje(cuenta, recaidas.length),
  }))
}

/**
 * Las recaídas por franja del día.
 *
 * Las que no tienen hora no entran: se guardaron sin ella y adivinarles una
 * inventaría un patrón que no existe.
 */
export function recaidasPorHora(recaidas: Registro[]): Conteo[] {
  const conHora = recaidas.filter((recaida) => recaida.hora !== null)

  return FRANJAS.map((franja) => {
    const cuenta = conHora.filter((recaida) => {
      const hora = Number(recaida.hora?.slice(0, 2))
      return hora >= franja.desde && hora < franja.hasta
    }).length

    return { etiqueta: franja.etiqueta, cuenta, porcentaje: porcentaje(cuenta, conHora.length) }
  })
}

/**
 * Las recaídas por contexto, de la más común a la menos.
 *
 * Las que se guardaron sin contexto se juntan al final, en su propia fila: son
 * parte del total y esconderlas subiría los porcentajes de las demás.
 */
export function recaidasPorContexto(recaidas: Registro[]): Conteo[] {
  const cuentas = new Map<string, number>()

  for (const recaida of recaidas) {
    const contexto = recaida.contexto ?? 'sin contexto'
    cuentas.set(contexto, (cuentas.get(contexto) ?? 0) + 1)
  }

  return [...cuentas.entries()]
    .map(([etiqueta, cuenta]) => ({ etiqueta, cuenta, porcentaje: porcentaje(cuenta, recaidas.length) }))
    .sort((una, otra) => otra.cuenta - una.cuenta || una.etiqueta.localeCompare(otra.etiqueta))
}

/**
 * El patrón de los días, dicho en una frase: *«el 71 % de tus recaídas son
 * viernes o sábado»*.
 *
 * Solo habla cuando hay algo que decir: con menos de cinco recaídas no hay
 * patrón que valga, y si los dos peores días no juntan la mitad, tampoco.
 * Devuelve `null` en esos casos y la pantalla no enseña nada, que es mejor que
 * enseñar una casualidad.
 */
export function fraseDeLosDias(porDia: Conteo[]): string | null {
  const total = porDia.reduce((suma, dia) => suma + dia.cuenta, 0)
  if (total < 5) return null

  const peores = [...porDia]
    .map((dia, indice) => ({ ...dia, indice }))
    .sort((uno, otro) => otro.cuenta - uno.cuenta)

  const primero = peores[0]
  if (primero === undefined || primero.cuenta === 0) return null

  if (porcentaje(primero.cuenta, total) >= 50) {
    return `El ${porcentaje(primero.cuenta, total)} % de tus recaídas son en ${primero.etiqueta}.`
  }

  const segundo = peores[1]
  if (segundo === undefined) return null

  const juntos = porcentaje(primero.cuenta + segundo.cuenta, total)
  if (juntos < 50) return null

  // En el orden de la semana, que es como se piensan: «viernes o sábado», no
  // «sábado o viernes», aunque el sábado tenga una recaída más.
  const [antes, despues] = primero.indice < segundo.indice ? [primero, segundo] : [segundo, primero]
  return `El ${juntos} % de tus recaídas son ${antes.etiqueta} o ${despues.etiqueta}.`
}

function porcentaje(cuenta: number, total: number): number {
  if (total === 0) return 0
  return Math.round((cuenta / total) * 100)
}
