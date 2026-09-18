/**
 * El mapa de calor de catorce semanas (sección 13).
 *
 * Catorce columnas —una por semana, la más vieja a la izquierda— y siete
 * renglones, de lunes a domingo. Cada cuadrito es un día.
 *
 * Los colores dicen lo mismo que el resto de la app, y en particular **no
 * inventan rojos**: un día anterior al alta del hábito, o uno que pasó
 * archivado, se queda casi en blanco; un día libre de un hábito semanal va
 * gris, que no es una falla (sección 6); y el día de hoy va con borde y sin
 * relleno, porque todavía no se juzga.
 */

import type { DiaDelMapa, EstadoDia, SemanaDelHistorial } from '../logica/historial'
import { fechaEnPalabras } from '../logica/fechas'

/** Cómo se pinta cada estado, y cómo se llama cuando se toca. */
const ASPECTO: Record<EstadoDia, { clase: string; nombre: string }> = {
  cumplido: { clase: 'bg-emerald-500', nombre: 'cumplido' },
  limpio: { clase: 'bg-emerald-200 dark:bg-emerald-900', nombre: 'limpio' },
  comodin: { clase: 'bg-sky-300 dark:bg-sky-800', nombre: 'comodín' },
  libre: { clase: 'bg-neutral-200 dark:bg-neutral-800', nombre: 'día libre' },
  fallado: { clase: 'bg-red-300 dark:bg-red-900', nombre: 'sin cumplir' },
  recaida: { clase: 'bg-red-500', nombre: 'recaída' },
  hoy: { clase: 'border border-neutral-400 dark:border-neutral-500', nombre: 'hoy' },
  fuera: { clase: 'bg-neutral-100 dark:bg-neutral-900', nombre: 'todavía no existía' },
}

/** Las iniciales de los siete días, en la orilla izquierda. */
const INICIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function MapaDeCalor({ semanas }: { semanas: SemanaDelHistorial[] }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Día a día</h2>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Catorce semanas</p>

      <div className="mt-3 flex gap-1">
        <ul className="flex shrink-0 flex-col gap-1 pr-0.5">
          {INICIALES.map((inicial, posicion) => (
            <li
              key={`${inicial}-${posicion}`}
              aria-hidden="true"
              className="flex h-4 items-center text-[0.6rem] leading-none text-neutral-300 dark:text-neutral-600"
            >
              {inicial}
            </li>
          ))}
        </ul>

        <ul className="flex flex-1 gap-1">
          {semanas.map((semana) => (
            <li key={semana.clave} className="flex flex-1 flex-col gap-1">
              {semana.dias.map((dia) => (
                <Cuadrito key={dia.fecha} dia={dia} />
              ))}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.65rem] text-neutral-400 dark:text-neutral-500">
        <Leyenda estado="cumplido" texto="cumplido" />
        <Leyenda estado="limpio" texto="limpio" />
        <Leyenda estado="recaida" texto="recaída" />
        <Leyenda estado="fallado" texto="sin cumplir" />
        <Leyenda estado="comodin" texto="comodín" />
      </ul>
    </section>
  )
}

function Cuadrito({ dia }: { dia: DiaDelMapa }) {
  const aspecto = ASPECTO[dia.estado]

  return (
    <span
      title={`${fechaEnPalabras(dia.fecha)}: ${aspecto.nombre}`}
      className={`h-4 w-full rounded-[3px] ${aspecto.clase}`}
    />
  )
}

function Leyenda({ estado, texto }: { estado: EstadoDia; texto: string }) {
  return (
    <li className="flex items-center gap-1">
      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-[2px] ${ASPECTO[estado].clase}`} />
      {texto}
    </li>
  )
}
