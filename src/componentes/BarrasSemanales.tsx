/**
 * Las catorce barras semanales del detalle de un hábito (sección 13).
 *
 * Cada barra es una semana, y su color es **el del veredicto guardado** cuando
 * lo hay: verde si llegó al objetivo, ámbar si llegó al mínimo, rojo si no.
 * Aquí no se decide ningún color; se pintan los que ya se calcularon al cerrar
 * cada semana (regla 8).
 *
 * Los hábitos diarios y los negativos no tienen semáforo —su unidad es el día,
 * no la semana— así que sus barras van en gris y solo cuentan cuántos días
 * salieron bien. Nunca se les inventa un color que el documento no les da.
 *
 * La última barra es la semana en curso, que todavía no tiene veredicto: va
 * punteada, para que se vea que aún no está juzgada.
 */

import type { SemanaDelHistorial } from '../logica/historial'
import type { ColorSemana } from '../tipos'

/** El relleno de cada color del semáforo. */
const RELLENO: Record<ColorSemana, string> = {
  verde: 'bg-emerald-500',
  ambar: 'bg-amber-400',
  rojo: 'bg-red-400',
}

export default function BarrasSemanales({ semanas }: { semanas: SemanaDelHistorial[] }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Semana a semana</h2>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Las últimas catorce semanas</p>

      <ul className="mt-4 flex h-24 items-end gap-1">
        {semanas.map((semana, posicion) => (
          <Barra key={semana.clave} semana={semana} enCurso={posicion === semanas.length - 1} />
        ))}
      </ul>

      <div className="mt-1 flex justify-between text-[0.65rem] text-neutral-400 dark:text-neutral-500">
        <span>{semanas[0]?.etiqueta}</span>
        <span>esta semana</span>
      </div>
    </section>
  )
}

function Barra({ semana, enCurso }: { semana: SemanaDelHistorial; enCurso: boolean }) {
  const lleno = semana.total === 0 ? 0 : Math.min(100, (semana.hechos / semana.total) * 100)
  // Una barra en cero se queda como una rayita: una semana sin nada también es
  // información, y un hueco en blanco no se lee.
  const alto = Math.max(6, lleno)

  return (
    <li className="flex h-full flex-1 flex-col justify-end">
      {semana.comodin && (
        <span aria-hidden="true" className="mb-0.5 text-center text-[0.6rem] leading-none">
          🛡️
        </span>
      )}
      <div
        title={`${semana.etiqueta}: ${semana.hechos} de ${semana.total}`}
        className={`w-full rounded-sm ${color(semana, enCurso)}`}
        style={{ height: `${alto}%` }}
      />
    </li>
  )
}

/**
 * De qué color va la barra.
 *
 * Con veredicto, el del semáforo. Sin veredicto y con días buenos, gris oscuro.
 * La semana en curso, gris claro: todavía no se juzga.
 */
function color(semana: SemanaDelHistorial, enCurso: boolean): string {
  if (semana.color !== null) return RELLENO[semana.color]
  if (enCurso) return 'bg-neutral-300 dark:bg-neutral-700'
  if (semana.total === 0) return 'bg-neutral-200 dark:bg-neutral-800'
  return 'bg-neutral-400 dark:bg-neutral-500'
}
