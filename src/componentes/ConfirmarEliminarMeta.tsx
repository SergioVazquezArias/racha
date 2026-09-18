/**
 * La confirmación para eliminar una meta (sección 9).
 *
 * Igual que con los hábitos: borrar una meta borra **todas sus mediciones**, y
 * eso no se pregunta con un «¿seguro?» que se contesta que sí sin leerlo. Hay
 * que escribir el nombre de la meta. El teclado obliga a detenerse.
 *
 * Y se ofrece la salida buena: cerrarla como abandonada, que conserva todo lo
 * medido y deja escrito el día en que decidiste soltarla.
 */

import { useState } from 'react'

import { confirmacionCorrecta } from '../logica/metasAltas'
import type { Medicion, Meta } from '../tipos'

interface Props {
  meta: Meta
  mediciones: Medicion[]
  alCerrar: () => void
  alEliminar: () => void
  alAbandonar: () => void
}

export default function ConfirmarEliminarMeta({
  meta,
  mediciones,
  alCerrar,
  alEliminar,
  alAbandonar,
}: Props) {
  const [escrito, setEscrito] = useState('')
  const puede = confirmacionCorrecta(meta, escrito)
  const cuantas = mediciones.length

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" onClick={alCerrar} className="absolute inset-0 bg-black/40" />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Eliminar ${meta.nombre}`}
        className="hoja-que-sube borde-inferior-seguro relative w-full max-w-md rounded-t-3xl bg-white px-5 pt-5 dark:bg-neutral-900"
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Eliminar «{meta.nombre}»
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          Se borra la meta y {cuantas === 1 ? 'su única medición' : `sus ${cuantas} mediciones`}. No se puede
          deshacer.
        </p>

        <label className="mt-4 block">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Escribe «{meta.nombre}» para confirmar
          </span>
          <input
            type="text"
            value={escrito}
            onChange={(evento) => setEscrito(evento.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            aria-label="Nombre de la meta"
            className="mt-1 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>

        <button
          type="button"
          disabled={!puede}
          onClick={alEliminar}
          className={`mt-4 w-full rounded-2xl py-4 text-base font-medium transition-colors ${
            puede
              ? 'bg-red-600 text-white active:scale-[0.99]'
              : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
          }`}
        >
          Eliminar para siempre
        </button>

        <button
          type="button"
          onClick={alAbandonar}
          className="mt-3 mb-2 w-full rounded-2xl py-3 text-sm text-neutral-600 underline decoration-neutral-300 dark:text-neutral-300"
        >
          Mejor ciérrala como abandonada: conserva todo lo medido
        </button>
      </section>
    </div>
  )
}
