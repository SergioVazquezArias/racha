/**
 * La gráfica de una meta (sección 13).
 *
 * Cuatro cosas se dibujan encima del mismo lienzo:
 *
 * - **Tu curva real**, con los números que capturaste. Las mediciones de noche
 *   van con **punto hueco** para que se distingan de un vistazo.
 * - **La recta del objetivo**, punteada, del valor inicial al valor final. Es el
 *   plan, no una predicción.
 * - **Los hitos**, como marcadores sobre la gráfica.
 * - **Las bandas de nivel** de inglés, como franjas de fondo.
 *
 * Los números de los dos ejes no los elige Recharts: se calculan en
 * `serieMeta.ts` para que sean redondos y caigan dentro de lo que la gráfica de
 * verdad alcanza. Y los colores salen de `tema.ts`, que los cambia cuando el
 * teléfono pasa a modo oscuro.
 */

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { bandasVisibles, usaBandasDeIngles } from '../logica/ingles'
import { diaYMesCorto, diasEntre, sumarDias } from '../logica/fechas'
import { ejeDeLaMeta, ejeDeTiempo, serieDe } from '../logica/serieMeta'
import { useColoresDeGrafica } from '../pantallas/tema'
import type { ColoresDeGrafica } from '../pantallas/tema'
import type { EjeDeTiempo, PuntoDeSerie } from '../logica/serieMeta'
import type { Medicion, Meta } from '../tipos'

export default function GraficaMeta({ meta, mediciones }: { meta: Meta; mediciones: Medicion[] }) {
  const colores = useColoresDeGrafica()
  const puntos = serieDe(meta, mediciones)
  const eje = ejeDeLaMeta(meta, puntos)
  const tiempo = ejeDeTiempo(puntos)

  return (
    <div className="-ml-2 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={puntos} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          {usaBandasDeIngles(meta) &&
            bandasVisibles(eje.minimo, eje.maximo).map((banda) => (
              <ReferenceArea
                key={banda.nombre}
                y1={Math.max(banda.desde, eje.minimo)}
                y2={Math.min(banda.hasta, eje.maximo)}
                fill={colores.texto}
                fillOpacity={banda.nombre === 'B1' || banda.nombre === 'C1' ? 0.12 : 0.05}
                label={{ value: banda.nombre, position: 'insideLeft', fontSize: 10, fill: colores.texto }}
              />
            ))}

          <CartesianGrid stroke={colores.reja} strokeDasharray="2 4" vertical={false} />

          <XAxis
            dataKey="dia"
            type="number"
            scale="linear"
            domain={[tiempo.minimo, tiempo.maximo]}
            ticks={tiempo.marcas}
            tickFormatter={(dia: number) => diaYMesCorto(sumarDias(meta.fechaInicio, dia))}
            tick={{ fill: colores.texto, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: colores.reja }}
            interval={0}
            minTickGap={0}
          />

          <YAxis
            domain={[eje.minimo, eje.maximo]}
            ticks={eje.marcas}
            tick={{ fill: colores.texto, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={38}
          />

          <Line
            type="linear"
            dataKey="plan"
            stroke={colores.plan}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="real"
            stroke={colores.real}
            strokeWidth={2}
            connectNulls
            isAnimationActive={false}
            dot={(propiedades: PropiedadesDePunto) => <Punto {...propiedades} colores={colores} />}
          />

          {meta.hitos.map((hito) => (
            <ReferenceDot
              key={`${hito.nombre}:${hito.fecha}`}
              x={diasEntre(meta.fechaInicio, hito.fecha)}
              y={hito.valor}
              r={5}
              fill={colores.hito}
              stroke={colores.fondo}
              strokeWidth={2}
              label={{
                value: hito.nombre,
                position: ladoDelHito(diasEntre(meta.fechaInicio, hito.fecha), tiempo),
                fill: colores.hito,
                fontSize: 10,
              }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Lo que Recharts le pasa a cada punto de la línea. */
interface PropiedadesDePunto {
  cx?: number
  cy?: number
  index?: number
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
function Punto({ cx, cy, payload, colores }: PropiedadesDePunto & { colores: ColoresDeGrafica }) {
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

/**
 * De qué lado del marcador se escribe el nombre del hito.
 *
 * Encima, salvo cuando el hito cae pegado a un borde: ahí el nombre se saldría
 * de la gráfica y quedaría cortado. Pegado a la derecha se escribe a la
 * izquierda del punto, y al revés. El hito de peso cae al 90 % del camino, así
 * que este caso no es raro: es el que hay.
 */
function ladoDelHito(dia: number, tiempo: EjeDeTiempo): 'top' | 'left' | 'right' {
  const ancho = tiempo.maximo - tiempo.minimo
  if (ancho <= 0) return 'top'

  const avance = (dia - tiempo.minimo) / ancho
  if (avance > 0.75) return 'left'
  if (avance < 0.25) return 'right'
  return 'top'
}
