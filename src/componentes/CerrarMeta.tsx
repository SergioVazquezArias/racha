/**
 * Cerrar una meta: como cumplida o como abandonada, y con fecha.
 *
 * Las dos salidas están al mismo nivel y ninguna se esconde. Abandonar una meta
 * no es un fracaso que haya que tapar: es una decisión, y queda con su día
 * escrito. Una meta cerrada se sigue viendo entera —su gráfica, sus
 * mediciones— pero deja de pedir mediciones nuevas.
 *
 * La fecha llega con la de hoy puesta y se puede cambiar, porque uno casi
 * siempre cierra una meta unos días después de haberla dejado.
 */

import { useState } from 'react'

import { CampoFecha } from './CamposDeMedida'
import type { Fecha, Meta } from '../tipos'

interface Props {
  meta: Meta
  hoy: Fecha
  alCerrar: () => void
  alConfirmar: (como: 'cumplida' | 'abandonada', cuando: Fecha) => void
}

export default function CerrarMeta({ meta, hoy, alCerrar, alConfirmar }: Props) {
  const [cuando, setCuando] = useState<Fecha>(hoy)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" onClick={alCerrar} className="absolute inset-0 bg-black/40" />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Cerrar ${meta.nombre}`}
        className="hoja-que-sube borde-inferior-seguro relative w-full max-w-md rounded-t-3xl bg-white px-5 pt-5 dark:bg-neutral-900"
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Cerrar «{meta.nombre}»
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          Se conserva todo lo medido. La meta deja de pedir mediciones y se va al bloque de cerradas.
        </p>

        <div className="mt-4">
          <CampoFecha etiqueta="Fecha de cierre" valor={cuando} alCambiar={setCuando} />
        </div>

        <button
          type="button"
          onClick={() => alConfirmar('cumplida', cuando)}
          className="mt-4 w-full rounded-2xl bg-emerald-600 py-4 text-base font-medium text-white active:scale-[0.99]"
        >
          Cumplida
        </button>

        <button
          type="button"
          onClick={() => alConfirmar('abandonada', cuando)}
          className="mt-3 w-full rounded-2xl border border-neutral-200 py-4 text-base font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
        >
          Abandonada
        </button>

        <button
          type="button"
          onClick={alCerrar}
          className="mt-2 mb-2 w-full rounded-2xl py-3 text-sm text-neutral-500 dark:text-neutral-400"
        >
          Cancelar
        </button>
      </section>
    </div>
  )
}
