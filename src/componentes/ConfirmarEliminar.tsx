/**
 * La confirmación para eliminar un hábito (sección 9).
 *
 * Eliminar es lo excepcional: borra el hábito **y todo su historial**, sin
 * vuelta atrás. Por eso no basta un «¿seguro?» —que se contesta que sí sin
 * leerlo— sino que hay que **escribir el nombre del hábito**. El teclado obliga
 * a detenerse, que es justo lo que se busca.
 *
 * Lo que hay que escribir es el nombre **que se está viendo**: el alias si el
 * hábito es privado y el interruptor de nombres reales está apagado. Pedir un
 * nombre que está escondido sería imposible de cumplir sin destaparlo delante
 * de quien sea que esté mirando (sección 8).
 *
 * Y siempre se ofrece la salida buena: archivar, que conserva todo.
 */

import { useState } from 'react'

import { confirmacionCorrecta } from '../logica/altas'
import { mostrarNombre } from '../logica/nombres'
import { useDiscrecion } from '../pantallas/discrecion'
import type { Habito } from '../tipos'

interface Props {
  habito: Habito
  alCerrar: () => void
  alEliminar: () => void
  alArchivar: () => void
}

export default function ConfirmarEliminar({ habito, alCerrar, alEliminar, alArchivar }: Props) {
  const { mostrarNombresReales } = useDiscrecion()
  const [escrito, setEscrito] = useState('')
  const nombre = mostrarNombre(habito, mostrarNombresReales)
  const puede = confirmacionCorrecta(habito, escrito, mostrarNombresReales)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" onClick={alCerrar} className="absolute inset-0 bg-black/40" />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Eliminar ${nombre}`}
        className="hoja-que-sube borde-inferior-seguro relative w-full max-w-md rounded-t-3xl bg-white px-5 pt-5 dark:bg-neutral-900"
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Eliminar «{nombre}»</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          Se borra el hábito y todo su historial: sus días registrados, sus semanas y su mejor racha. No se
          puede deshacer.
        </p>

        <label className="mt-4 block">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Escribe «{nombre}» para confirmar
          </span>
          <input
            type="text"
            value={escrito}
            onChange={(evento) => setEscrito(evento.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            aria-label="Nombre del hábito"
            className="mt-1 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>

        <button
          type="button"
          disabled={!puede}
          onClick={alEliminar}
          className={`mt-4 w-full rounded-2xl py-4 text-base font-medium transition-colors ${
            puede ? 'bg-red-600 text-white active:scale-[0.99]' : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
          }`}
        >
          Eliminar para siempre
        </button>

        <button
          type="button"
          onClick={alArchivar}
          className="mt-3 mb-2 w-full rounded-2xl py-3 text-sm text-neutral-600 underline decoration-neutral-300 dark:text-neutral-300"
        >
          Mejor archívalo: conserva todo y se puede revivir
        </button>
      </section>
    </div>
  )
}
