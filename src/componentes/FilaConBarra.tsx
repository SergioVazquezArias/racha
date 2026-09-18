/**
 * Un renglón con su barra, que es como se lee todo en Estadísticas.
 *
 * Una etiqueta a la izquierda, una barra que ocupa lo que le toca y el número a
 * la derecha. Las tres listas de la pantalla —el ranking, los días de la semana
 * y los patrones de recaída— usan este mismo renglón para que se comparen de un
 * vistazo, sin que el ojo tenga que aprenderse tres formatos.
 *
 * El tono lo manda quien la usa: verde cuando más es mejor —cumplimiento—, rojo
 * cuando más es peor —recaídas—.
 */

export type TonoDeBarra = 'verde' | 'rojo' | 'neutro'

const RELLENO: Record<TonoDeBarra, string> = {
  verde: 'bg-emerald-500',
  rojo: 'bg-red-400',
  neutro: 'bg-neutral-400 dark:bg-neutral-500',
}

interface Props {
  etiqueta: string
  /** Lo que se lee a la derecha: `"87 %"`, `"3 recaídas"`. */
  valor: string
  /** De 0 a 100. `null` deja la barra vacía: no hay dato todavía. */
  porcentaje: number | null
  tono?: TonoDeBarra
  /** Un emoji a la izquierda de la etiqueta. */
  icono?: string
}

export default function FilaConBarra({ etiqueta, valor, porcentaje, tono = 'neutro', icono }: Props) {
  return (
    <li className="flex items-center gap-2 py-1.5">
      {icono !== undefined && (
        <span aria-hidden="true" className="w-6 shrink-0 text-lg">
          {icono}
        </span>
      )}

      <span className="w-24 shrink-0 truncate text-sm text-neutral-700 dark:text-neutral-200">{etiqueta}</span>

      <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <span
          className={`block h-full rounded-full ${RELLENO[tono]}`}
          style={{ width: `${porcentaje ?? 0}%` }}
        />
      </span>

      <span className="w-16 shrink-0 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
        {valor}
      </span>
    </li>
  )
}
