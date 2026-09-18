/**
 * Las barras de cumplimiento de los hábitos vinculados a una meta (sección 13).
 *
 * Una meta no se cumple midiéndose: se cumple con lo que haces cada semana. Por
 * eso debajo de la gráfica van las últimas ocho semanas de cada hábito
 * vinculado —el gym, el refresco, el postre— con el color del semáforo que ya
 * se calculó al cerrar cada semana (regla 8). Aquí no se decide ningún color.
 *
 * Son ocho semanas y no catorce como en el detalle de un hábito: aquí el hábito
 * es el acompañante, no el protagonista, y ocho caben sin apretar debajo de la
 * gráfica.
 *
 * Los nombres salen siempre de `mostrarNombre()` (regla 7), así que un hábito
 * privado vinculado a una meta se sigue viendo con su alias.
 */

import { historialDeSemanas } from '../logica/historial'
import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { useDiscrecion } from '../pantallas/discrecion'
import type { DatosDeRacha } from '../logica/rachas'
import type { SemanaDelHistorial } from '../logica/historial'
import type { ColorSemana, Fecha, Habito } from '../tipos'

/** Cuántas semanas se dibujan por hábito. */
const SEMANAS = 8

const RELLENO: Record<ColorSemana, string> = {
  verde: 'bg-emerald-500',
  ambar: 'bg-amber-400',
  rojo: 'bg-red-400',
}

interface Props {
  habitos: Habito[]
  datos: DatosDeRacha
  hoy: Fecha
}

export default function HabitosDeLaMeta({ habitos, datos, hoy }: Props) {
  if (habitos.length === 0) return null

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Lo que la sostiene</h2>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
        Las últimas ocho semanas de los hábitos vinculados
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {habitos.map((habito) => (
          <Fila key={habito.id} habito={habito} datos={datos} hoy={hoy} />
        ))}
      </ul>
    </section>
  )
}

function Fila({ habito, datos, hoy }: { habito: Habito; datos: DatosDeRacha; hoy: Fecha }) {
  const { mostrarNombresReales } = useDiscrecion()
  const semanas = historialDeSemanas(habito, datos, hoy, SEMANAS)

  return (
    <li>
      <p className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
        <span aria-hidden="true">{mostrarIcono(habito)}</span>
        <span className="truncate">{mostrarNombre(habito, mostrarNombresReales)}</span>
      </p>

      <ul className="mt-1 flex h-10 items-end gap-1">
        {semanas.map((semana, posicion) => (
          <Barra key={semana.clave} semana={semana} enCurso={posicion === semanas.length - 1} />
        ))}
      </ul>
    </li>
  )
}

function Barra({ semana, enCurso }: { semana: SemanaDelHistorial; enCurso: boolean }) {
  const lleno = semana.total === 0 ? 0 : Math.min(100, (semana.hechos / semana.total) * 100)

  return (
    <li className="flex h-full flex-1 flex-col justify-end">
      <div
        title={`${semana.etiqueta}: ${semana.hechos} de ${semana.total}`}
        className={`w-full rounded-sm ${color(semana, enCurso)}`}
        style={{ height: `${Math.max(6, lleno)}%` }}
      />
    </li>
  )
}

/** El color guardado del semáforo; gris si esa semana no tiene veredicto. */
function color(semana: SemanaDelHistorial, enCurso: boolean): string {
  if (semana.color !== null) return RELLENO[semana.color]
  if (enCurso) return 'bg-neutral-300 dark:bg-neutral-700'
  if (semana.total === 0) return 'bg-neutral-200 dark:bg-neutral-800'
  return 'bg-neutral-400 dark:bg-neutral-500'
}
