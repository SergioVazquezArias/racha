/**
 * Los hábitos que sostienen una meta.
 *
 * Bajar de peso no se decide en la báscula: se decide en el gym, en el refresco
 * y en el postre. Vincular esos hábitos a la meta es lo que después permite
 * enseñar, debajo de la gráfica, las semanas en que sí y las semanas en que no.
 *
 * Los nombres salen de `mostrarNombre()` (regla 7): un hábito privado se elige
 * por su alias, sin destaparlo.
 */

import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { useDiscrecion } from '../pantallas/discrecion'
import type { Habito } from '../tipos'

interface Props {
  habitos: Habito[]
  elegidos: string[]
  alCambiar: (elegidos: string[]) => void
}

export default function SelectorDeHabitos({ habitos, elegidos, alCambiar }: Props) {
  const { mostrarNombresReales } = useDiscrecion()

  function alternar(id: string) {
    alCambiar(elegidos.includes(id) ? elegidos.filter((uno) => uno !== id) : [...elegidos, id])
  }

  if (habitos.length === 0) return null

  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Hábitos vinculados</p>
      <p className="mt-0.5 text-[0.7rem] text-neutral-400 dark:text-neutral-500">
        Los que sostienen esta meta. Se ven debajo de su gráfica.
      </p>

      <ul className="mt-2 flex flex-wrap gap-2">
        {habitos.map((habito) => {
          const elegido = elegidos.includes(habito.id)

          return (
            <li key={habito.id}>
              <button
                type="button"
                aria-pressed={elegido}
                onClick={() => alternar(habito.id)}
                className={`flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors ${
                  elegido
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                    : 'border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200'
                }`}
              >
                <span aria-hidden="true">{mostrarIcono(habito)}</span>
                {mostrarNombre(habito, mostrarNombresReales)}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
