/**
 * Las mediciones de una meta, de la más reciente a la más vieja.
 *
 * Cada renglón se toca para corregirlo: una pesada capturada con el dedo torcido
 * —81.4 en vez de 84.1— tuerce la tendencia entera, y eso tiene que poder
 * arreglarse sin borrar nada más.
 *
 * Las de noche se marcan con su luna, la misma señal que el punto hueco de la
 * gráfica. Y se enseñan todos los campos que se capturaron, no solo el
 * principal: la cintura de hace tres meses es justo lo que uno quiere comparar.
 */

import { diaYMesCorto } from '../logica/fechas'
import { numero } from '../logica/textosMetas'
import type { Medicion, Meta } from '../tipos'

interface Props {
  meta: Meta
  /** Ya ordenadas de la más reciente a la más vieja. */
  mediciones: Medicion[]
  /** Cada cuánto toca medirse, ya redactado: «Semanal, los domingos». */
  cadencia: string
  alTocar: (medicion: Medicion) => void
}

export default function ListaDeMediciones({ meta, mediciones, cadencia, alTocar }: Props) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Mediciones</h2>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{cadencia}</p>

      {mediciones.length === 0 && (
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Todavía no hay ninguna. La primera arranca la gráfica.
        </p>
      )}

      <ul className="mt-2 flex flex-col">
        {mediciones.map((medicion) => (
          <li key={medicion.id} className="border-t border-neutral-100 first:border-t-0 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => alTocar(medicion)}
              className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left"
            >
              <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                {diaYMesCorto(medicion.fecha)}
                {medicion.momento === 'noche' && (
                  <span aria-label="de noche" title="De noche">
                    {' '}
                    🌙
                  </span>
                )}
              </span>

              <span className="flex flex-wrap justify-end gap-x-3 gap-y-0.5 text-sm tabular-nums text-neutral-700 dark:text-neutral-200">
                {meta.campos.map((campo) => {
                  const valor = medicion.valores[campo.clave]
                  if (valor === undefined) return null

                  return (
                    <span key={campo.clave}>
                      <span className="text-[0.65rem] text-neutral-400 dark:text-neutral-500">
                        {campo.etiqueta.toLocaleLowerCase('es')}{' '}
                      </span>
                      {numero(valor)}
                    </span>
                  )
                })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
