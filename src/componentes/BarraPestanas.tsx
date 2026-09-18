/**
 * La barra de cuatro pestañas de abajo.
 *
 * Pegada al borde inferior y con hueco para la franja del gesto de inicio del
 * iPhone, que se lo come todo si no se le reserva espacio. Cada pestaña es un
 * blanco grande: se navega con el pulgar, sin apuntar.
 */

import { PESTANAS } from '../pantallas/pestanas'
import type { Pestana } from '../pantallas/pestanas'

interface Props {
  activa: Pestana
  alCambiar: (pestana: Pestana) => void
}

export default function BarraPestanas({ activa, alCambiar }: Props) {
  return (
    <nav
      aria-label="Pantallas de la app"
      className="borde-inferior-seguro fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 pt-1 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90"
    >
      <ul className="mx-auto flex max-w-md">
        {PESTANAS.map((pestana) => {
          const esActiva = pestana.clave === activa
          return (
            <li key={pestana.clave} className="flex-1">
              <button
                type="button"
                onClick={() => alCambiar(pestana.clave)}
                aria-current={esActiva ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 ${
                  esActiva ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                <span aria-hidden="true" className={`text-xl ${esActiva ? '' : 'opacity-60 grayscale'}`}>
                  {pestana.icono}
                </span>
                <span className={`text-[0.7rem] ${esActiva ? 'font-medium' : ''}`}>{pestana.nombre}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
