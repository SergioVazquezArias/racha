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
import { MarcaDeFecha, PuntoDeMedicion } from './PiezasDeGrafica'
import { ladoDelHito } from '../logica/rotulos'
import { diasEntre } from '../logica/fechas'
import { ejeDeLaMeta, ejeDeTiempo, serieDe } from '../logica/serieMeta'
import { useColoresDeGrafica } from '../pantallas/tema'
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
            tick={<MarcaDeFecha inicio={meta.fechaInicio} tiempo={tiempo} color={colores.texto} />}
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
            dot={(propiedades) => <PuntoDeMedicion {...propiedades} colores={colores} />}
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
