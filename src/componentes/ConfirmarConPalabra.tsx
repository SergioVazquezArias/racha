/**
 * La hoja que pide escribir una palabra antes de algo que no se deshace.
 *
 * Es la misma idea que la de eliminar un hábito (sección 9): un «¿seguro?» se
 * contesta que sí sin leerlo, pero sacar el teclado obliga a detenerse. La usan
 * las dos cosas irreversibles de Ajustes —importar un respaldo encima de todo y
 * borrar todo— con palabras distintas, para que el dedo no aprenda una sola.
 */

import { useState } from 'react'

import { palabraCorrecta } from '../logica/confirmaciones'

interface Props {
  titulo: string
  /** La explicación de qué se pierde. La escribe quien usa la hoja. */
  children: React.ReactNode
  palabra: string
  textoDelBoton: string
  alCerrar: () => void
  alConfirmar: () => void
}

export default function ConfirmarConPalabra({
  titulo,
  children,
  palabra,
  textoDelBoton,
  alCerrar,
  alConfirmar,
}: Props) {
  const [escrito, setEscrito] = useState('')
  const puede = palabraCorrecta(escrito, palabra)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" onClick={alCerrar} className="absolute inset-0 bg-black/40" />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="hoja-que-sube borde-inferior-seguro relative w-full max-w-md rounded-t-3xl bg-white px-5 pt-5 dark:bg-neutral-900"
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{titulo}</h2>

        <div className="mt-2 space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {children}
        </div>

        <label className="mt-4 block">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Escribe «{palabra}» para confirmar
          </span>
          <input
            type="text"
            value={escrito}
            onChange={(evento) => setEscrito(evento.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            aria-label={`Escribe ${palabra}`}
            className="mt-1 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>

        <button
          type="button"
          disabled={!puede}
          onClick={alConfirmar}
          className={`mt-4 w-full rounded-2xl py-4 text-base font-medium transition-colors ${
            puede
              ? 'bg-red-600 text-white active:scale-[0.99]'
              : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
          }`}
        >
          {textoDelBoton}
        </button>

        <button
          type="button"
          onClick={alCerrar}
          className="mt-3 mb-2 w-full rounded-2xl py-3 text-sm text-neutral-600 dark:text-neutral-300"
        >
          Mejor no
        </button>
      </section>
    </div>
  )
}
