/**
 * Las piezas sueltas que la gráfica de una meta dibuja a mano.
 *
 * Son tres cosas que Recharts no sabe hacer solo y que en un teléfono se notan:
 * el punto hueco de las mediciones nocturnas, la fecha de las orillas sin que
 * se corte, y de qué lado cae el nombre de un hito.
 *
 * Viven aparte del componente de la gráfica porque juntos pasaban de doscientos
 * renglones (regla 4).
 */

import { anclaDeLaFecha } from '../logica/rotulos'
import { diaYMesCorto, sumarDias } from '../logica/fechas'
import type { ColoresDeGrafica } from '../pantallas/tema'
import type { EjeDeTiempo, PuntoDeSerie } from '../logica/serieMeta'
import type { Fecha } from '../tipos'

/** Lo que Recharts le pasa a cada punto de la línea. */
interface PropiedadesDePunto {
  cx?: number
  cy?: number
  payload?: PuntoDeSerie
}

/**
 * Un punto de la curva real.
 *
 * Los de mañana van rellenos y los de noche **huecos**: relleno del color del
 * fondo y borde del color de la línea (sección 11). Es la misma señal que el
 * texto de abajo explica, para que nadie tenga que adivinar por qué un punto se
 * ve distinto.
 */
export function PuntoDeMedicion({
  cx,
  cy,
  payload,
  colores,
}: PropiedadesDePunto & { colores: ColoresDeGrafica }) {
  if (cx === undefined || cy === undefined || payload === undefined || payload.real === null) {
    return <g />
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={payload.noche ? colores.fondo : colores.real}
      stroke={colores.real}
      strokeWidth={2}
    />
  )
}

/** Lo que Recharts le pasa a cada marca del eje de abajo. */
interface PropiedadesDeMarca {
  x?: number
  y?: number
  payload?: { value: number }
}

/**
 * Una fecha del eje de abajo, escrita para que no se corte.
 *
 * De dónde se agarra cada una lo decide `anclaDeLaFecha()`, que está probada:
 * las orillas se agarran hacia adentro para no salirse de la pantalla.
 */
export function MarcaDeFecha({
  x,
  y,
  payload,
  inicio,
  tiempo,
  color,
}: PropiedadesDeMarca & { inicio: Fecha; tiempo: EjeDeTiempo; color: string }) {
  if (x === undefined || y === undefined || payload === undefined) return <g />

  const dia = payload.value

  return (
    <text
      x={x}
      y={y}
      dy={12}
      textAnchor={anclaDeLaFecha(dia, tiempo)}
      fill={color}
      fontSize={11}
    >
      {diaYMesCorto(sumarDias(inicio, dia))}
    </text>
  )
}
