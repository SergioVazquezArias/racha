/**
 * El respaldo escrito en la pantalla, para copiarlo a mano.
 *
 * Es el camino que no puede fallar: no depende de la hoja de compartir ni de
 * la descarga, solo de la pantalla. Si un día iOS rompe los otros dos, este
 * sigue ahí.
 *
 * Arranca tapado a propósito. Ahí dentro están **los nombres reales** de los
 * hábitos privados, así que destaparlo se pide a propósito y no se destapa solo
 * al abrir Ajustes (sección 8).
 */

import { useState } from 'react'

export default function TextoDelRespaldo({ texto }: { texto: string }) {
  const [destapado, setDestapado] = useState(false)

  if (!destapado) {
    return (
      <button
        type="button"
        onClick={() => setDestapado(true)}
        className="mt-3 w-full rounded-2xl border border-neutral-200 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
      >
        Ver el texto del respaldo
      </button>
    )
  }

  return (
    <div className="mt-3">
      <p className="mb-2 px-1 text-xs text-neutral-500 dark:text-neutral-400">
        Aquí se leen los nombres reales. Selecciona todo y cópialo a donde lo vayas a guardar.
      </p>
      <textarea
        readOnly
        value={texto}
        aria-label="Texto del respaldo"
        className="h-48 w-full rounded-2xl border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
      <button
        type="button"
        onClick={() => setDestapado(false)}
        className="mt-1 w-full py-2 text-sm text-neutral-600 dark:text-neutral-300"
      >
        Volver a taparlo
      </button>
    </div>
  )
}
