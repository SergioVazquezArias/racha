/**
 * Lo que se lee debajo de la gráfica de una meta.
 *
 * Todo aquí es texto en español, no números sueltos (sección 11): cómo vas
 * contra el plan, la proyección redactada, el aviso del ajuste de las
 * mediciones nocturnas, los hitos y la grasa corporal estimada.
 *
 * La grasa se enseña **siempre rotulada como estimación** y con la nota de que
 * lo que sirve es la tendencia. Solo aparece en metas que miden cintura y
 * cuello, y solo cuando hay una medición que traiga las dos.
 */

import { diaYMesEnPalabras } from '../logica/fechas'
import { grasaDeMedicion, midePorcentajeDeGrasa } from '../logica/grasa'
import { ordenadas } from '../logica/metas'
import { proyeccionDe } from '../logica/tendencia'
import {
  textoDeGrasa,
  textoDeProgreso,
  textoDeProyeccion,
  textoDeRestante,
  textoDelAjusteNocturno,
  valorConUnidad,
} from '../logica/textosMetas'
import type { ProgresoDeMeta } from '../logica/metas'
import type { Fecha, Medicion, Meta } from '../tipos'

interface Props {
  meta: Meta
  mediciones: Medicion[]
  progreso: ProgresoDeMeta
  estaturaCm: number
  hoy: Fecha
}

export default function ResumenDeMeta({ meta, mediciones, progreso, estaturaCm, hoy }: Props) {
  const proyeccion = proyeccionDe(meta, mediciones, hoy)
  const avisoNocturno = textoDelAjusteNocturno(proyeccion)
  const grasa = ultimaGrasa(meta, mediciones, estaturaCm)

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">A este ritmo</h2>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {textoDeProyeccion(meta, proyeccion)}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {textoDeProgreso(meta, progreso)}
        </p>

        {avisoNocturno !== null && (
          <p className="mt-3 border-t border-neutral-100 pt-3 text-xs leading-relaxed text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            {avisoNocturno}
          </p>
        )}
      </section>

      {meta.hitos.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Hitos</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {meta.hitos.map((hito) => (
              <li
                key={`${hito.nombre}:${hito.fecha}`}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-200">
                  <span aria-hidden="true" className="text-amber-500">
                    ●
                  </span>
                  {hito.nombre}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                  {valorConUnidad(hito.valor, meta.unidad)} · {diaYMesEnPalabras(hito.fecha)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {grasa !== null && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Grasa corporal</h2>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {textoDeGrasa(grasa.porcentaje)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Estimación a partir de cintura, cuello y tu estatura ({estaturaCm} cm), medida el{' '}
            {diaYMesEnPalabras(grasa.fecha)}. No es una medición clínica: lo que sirve es cómo cambia con
            los meses, no el número de un día.
          </p>
        </section>
      )}

      <p className="px-1 text-xs text-neutral-500 dark:text-neutral-400">{textoDeRestante(meta, progreso)}</p>
    </div>
  )
}

/** La grasa de la medición más reciente que traiga cintura y cuello. */
function ultimaGrasa(
  meta: Meta,
  mediciones: Medicion[],
  estaturaCm: number,
): { porcentaje: number; fecha: Fecha } | null {
  if (!midePorcentajeDeGrasa(meta.campos.map((campo) => campo.clave))) return null

  for (const medicion of [...ordenadas(mediciones)].reverse()) {
    const porcentaje = grasaDeMedicion(medicion, estaturaCm)
    if (porcentaje !== null) return { porcentaje, fecha: medicion.fecha }
  }

  return null
}
