/**
 * Los puntos que la gráfica de una meta dibuja, y los números de sus dos ejes.
 *
 * Vive aparte del componente a propósito: aquí se puede probar con Vitest que
 * el eje vertical no invente valores. Recharts, si lo dejas, rotula 78.4 o
 * 80.15 —números que nadie reconoce— o estira el eje hasta un cero que la
 * gráfica nunca alcanza y aplasta la curva contra el techo. Las marcas se
 * calculan aquí: **redondas y dentro de lo que la gráfica de verdad enseña**.
 *
 * Cada punto trae el valor real y el valor del plan de esa fecha. El valor real
 * es el que se capturó, **sin el ajuste nocturno**: ese ajuste solo entra en la
 * cuenta de la tendencia (sección 11). Lo que el ojo ve son tus números.
 */

import { diaYMesCorto } from './fechas'
import { ordenadas, valorPlaneado, valorPrincipal } from './metas'
import type { Fecha, Medicion, Meta } from '../tipos'

export interface PuntoDeSerie {
  fecha: Fecha
  /** Para el eje de abajo: `"15 sept"`. */
  etiqueta: string
  /** Lo que capturaste. `null` en los extremos del plan, donde no mediste. */
  real: number | null
  /** Lo que tocaba ese día según la recta del objetivo. */
  plan: number
  /** Las de noche se dibujan con punto hueco. */
  noche: boolean
}

/**
 * Los puntos de la gráfica, de la fecha de inicio a la fecha objetivo.
 *
 * Siempre se incluyen los dos extremos del plan aunque no tengan medición, para
 * que la recta punteada se vea entera desde el primer día: si solo se dibujaran
 * las fechas medidas, la recta del objetivo terminaría en la última pesada y no
 * se vería a dónde va. Y también las fechas de los hitos, para que cada hito
 * tenga dónde pararse en el eje de abajo.
 */
export function serieDe(meta: Meta, mediciones: Medicion[]): PuntoDeSerie[] {
  const conValor = ordenadas(mediciones).filter((medicion) => valorPrincipal(meta, medicion) !== null)
  const porFecha = new Map<Fecha, PuntoDeSerie>()

  // Los extremos del plan y las fechas de los hitos. Los hitos entran aquí
  // porque el eje de abajo es una lista de fechas: un hito cuya fecha no esté en
  // la lista no se podría dibujar sobre la gráfica.
  const delPlan = [meta.fechaInicio, meta.fechaObjetivo, ...meta.hitos.map((hito) => hito.fecha)]

  for (const fecha of delPlan) {
    porFecha.set(fecha, {
      fecha,
      etiqueta: diaYMesCorto(fecha),
      real: null,
      plan: redondear(valorPlaneado(meta, fecha)),
      noche: false,
    })
  }

  for (const medicion of conValor) {
    porFecha.set(medicion.fecha, {
      fecha: medicion.fecha,
      etiqueta: diaYMesCorto(medicion.fecha),
      real: valorPrincipal(meta, medicion),
      plan: redondear(valorPlaneado(meta, medicion.fecha)),
      noche: medicion.momento === 'noche',
    })
  }

  return [...porFecha.values()].sort((uno, otro) => uno.fecha.localeCompare(otro.fecha))
}

export interface EjeVertical {
  minimo: number
  maximo: number
  /** Los números rotulados. El primero y el último son el mínimo y el máximo. */
  marcas: number[]
}

/** Los pasos que se ven redondos. Se elige el primero que no llene el eje de marcas. */
const PASOS = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 500, 1000]

/**
 * Los números del eje vertical.
 *
 * El eje se ajusta a lo que hay —no arranca en cero, porque una gráfica de peso
 * que arranque en cero no enseña nada— y se estira hasta el siguiente número
 * redondo por arriba y por abajo, de modo que cada marca rotulada caiga dentro
 * de lo dibujado.
 */
export function ejeDeValores(valores: number[], marcasMaximas = 5): EjeVertical {
  const limpios = valores.filter((valor) => Number.isFinite(valor))
  if (limpios.length === 0) return { minimo: 0, maximo: 1, marcas: [0, 1] }

  // Todos los valores iguales —una sola medición, o varias que no se movieron—
  // dejarían un eje sin altura, así que se le abre un margen a cada lado para
  // que la línea no quede pegada al borde.
  const margen = Math.max(...limpios) === Math.min(...limpios) ? 1 : 0
  const menor = Math.min(...limpios) - margen
  const mayor = Math.max(...limpios) + margen
  const rango = mayor - menor

  const huecos = Math.max(1, marcasMaximas - 1)
  const paso = PASOS.find((candidato) => rango / candidato <= huecos) ?? Math.ceil(rango / huecos)
  const minimo = redondear(Math.floor(menor / paso) * paso)
  const maximo = redondear(Math.ceil(mayor / paso) * paso)

  const marcas: number[] = []
  for (let marca = minimo; marca <= maximo + paso / 1000; marca += paso) {
    marcas.push(redondear(marca))
  }

  return { minimo, maximo, marcas }
}

/** El eje vertical de una meta, contando la curva, la recta del plan y los hitos. */
export function ejeDeLaMeta(meta: Meta, puntos: PuntoDeSerie[]): EjeVertical {
  const valores = [
    ...puntos.flatMap((punto) => (punto.real === null ? [punto.plan] : [punto.real, punto.plan])),
    ...meta.hitos.map((hito) => hito.valor),
  ]

  return ejeDeValores(valores)
}

/**
 * Las fechas rotuladas abajo.
 *
 * Se eligen de entre las que la serie **ya tiene**, repartidas parejo: así cada
 * etiqueta cae justo debajo de un punto dibujado y ninguna señala un día que la
 * gráfica no enseña. Siempre se rotulan la primera y la última.
 */
export function marcasDeFecha(puntos: PuntoDeSerie[], cuantas = 4): Fecha[] {
  if (puntos.length <= cuantas) return puntos.map((punto) => punto.fecha)

  const salto = (puntos.length - 1) / (cuantas - 1)
  const elegidas = new Set<Fecha>()
  for (let cuenta = 0; cuenta < cuantas; cuenta += 1) {
    const punto = puntos[Math.round(cuenta * salto)]
    if (punto !== undefined) elegidas.add(punto.fecha)
  }

  return [...elegidas]
}

/** Dos decimales: más que eso es ruido en un kilo o en un punto. */
function redondear(numero: number): number {
  return Math.round(numero * 100) / 100
}
