/**
 * El registro de una recaída (sección 10 del documento de arquitectura).
 *
 * Cinco de los ocho hábitos son negativos, así que las recaídas son el dato más
 * valioso de la app: no basta guardar la fecha. Se capturan tres cosas en
 * **máximo tres toques**:
 *
 * 1. Toque uno: el botón «Recaída» de la fila abre esta hoja. La **hora ya
 *    viene puesta**, del reloj del teléfono, y solo se cambia si se quiere.
 * 2. Toque dos: el contexto, de un solo toque entre los que el hábito tenga
 *    configurados.
 * 3. Toque tres: «Guardar».
 *
 * La nota es opcional y viene plegada: si no se abre, no existe.
 *
 * **No hay lenguaje de juicio.** Ni «qué lástima», ni caritas tristes, ni rojo
 * de alarma. Se registra y se sigue.
 */

import { useState } from 'react'

import { horaActual } from '../logica/fechas'
import { mostrarNombre } from '../logica/nombres'
import { useDiscrecion } from '../pantallas/discrecion'
import type { Habito, Hora } from '../tipos'

interface Props {
  habito: Habito
  alCerrar: () => void
  alGuardar: (hora: Hora, contexto: string | null, nota: string | null) => void
}

export default function HojaRecaida({ habito, alCerrar, alGuardar }: Props) {
  const { mostrarNombresReales } = useDiscrecion()
  const [hora, setHora] = useState<Hora>(horaActual)
  const [contexto, setContexto] = useState<string | null>(null)
  const [nota, setNota] = useState('')
  const [notaAbierta, setNotaAbierta] = useState(false)

  function guardar() {
    const limpia = nota.trim()
    alGuardar(hora, contexto, limpia === '' ? null : limpia)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* El fondo oscurecido también cierra la hoja: salir siempre es fácil. */}
      <button
        type="button"
        aria-label="Cerrar sin registrar"
        onClick={alCerrar}
        className="absolute inset-0 bg-black/40"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Registrar recaída de ${mostrarNombre(habito, mostrarNombresReales)}`}
        className="hoja-que-sube borde-inferior-seguro relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pt-4 dark:bg-neutral-900"
      >
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={alCerrar}
            className="-ml-2 px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400"
          >
            Cancelar
          </button>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Registrar recaída</p>
          <span className="w-16" />
        </header>

        <h2 className="mt-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {mostrarNombre(habito, mostrarNombresReales)}
        </h2>

        <label className="mt-4 flex items-center justify-between rounded-2xl bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">Hora</span>
          <input
            type="time"
            value={hora}
            onChange={(evento) => setHora(evento.target.value)}
            aria-label="Hora de la recaída"
            className="bg-transparent text-lg font-medium tabular-nums text-neutral-900 dark:text-neutral-100"
          />
        </label>

        {habito.contextos.length > 0 && (
          <fieldset className="mt-4">
            <legend className="text-sm text-neutral-600 dark:text-neutral-300">¿Qué estaba pasando?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {habito.contextos.map((opcion) => (
                <BotonContexto
                  key={opcion}
                  texto={opcion}
                  elegido={contexto === opcion}
                  alTocar={() => setContexto(contexto === opcion ? null : opcion)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {notaAbierta ? (
          <textarea
            value={nota}
            onChange={(evento) => setNota(evento.target.value)}
            rows={3}
            autoFocus
            placeholder="Nota (opcional)"
            aria-label="Nota de la recaída"
            className="mt-4 w-full rounded-2xl border border-neutral-200 bg-white p-3 text-base text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        ) : (
          <button
            type="button"
            onClick={() => setNotaAbierta(true)}
            className="mt-4 text-sm text-neutral-500 underline decoration-neutral-300 dark:text-neutral-400"
          >
            Agregar una nota
          </button>
        )}

        <button
          type="button"
          onClick={guardar}
          className="mt-5 mb-2 w-full rounded-2xl bg-neutral-900 py-4 text-base font-medium text-white active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-900"
        >
          Guardar
        </button>
      </section>
    </div>
  )
}

/** Un contexto, del tamaño de un pulgar. Tocarlo otra vez lo suelta. */
function BotonContexto({ texto, elegido, alTocar }: { texto: string; elegido: boolean; alTocar: () => void }) {
  return (
    <button
      type="button"
      onClick={alTocar}
      aria-pressed={elegido}
      className={`min-h-12 rounded-2xl border px-3 py-2 text-sm transition-colors ${
        elegido
          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
          : 'border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
      }`}
    >
      {texto}
    </button>
  )
}
