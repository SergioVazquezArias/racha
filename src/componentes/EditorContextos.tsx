/**
 * Los contextos de un hábito negativo (sección 10).
 *
 * Son las opciones que se ofrecen de un toque al registrar una recaída —*con
 * amigos · estrés · después de comer*— y **las escribe el usuario dentro de la
 * app**. Ese es justo el punto: el repositorio es público, y los contextos de
 * un hábito privado son de las cosas más personales que hay aquí. Por eso no
 * hay ninguna lista sugerida en el código.
 *
 * Tocar un contexto lo borra. No pide confirmación: volver a escribirlo cuesta
 * dos segundos y un diálogo por cada palabra sería insoportable.
 */

interface Props {
  contextos: string[]
  alCambiar: (contextos: string[]) => void
}

export default function EditorContextos({ contextos, alCambiar }: Props) {
  function agregar(texto: string) {
    const limpio = texto.trim()
    if (limpio === '' || contextos.includes(limpio)) return
    alCambiar([...contextos, limpio])
  }

  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Contextos</p>
      <p className="mt-0.5 text-[0.7rem] text-neutral-400 dark:text-neutral-500">
        Lo que ofrecerá la app al registrar una recaída. Toca uno para quitarlo.
      </p>

      {contextos.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {contextos.map((contexto) => (
            <li key={contexto}>
              <button
                type="button"
                onClick={() => alCambiar(contextos.filter((uno) => uno !== contexto))}
                aria-label={`Quitar ${contexto}`}
                className="min-h-10 rounded-full border border-neutral-200 bg-white px-3 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                {contexto} <span aria-hidden="true" className="text-neutral-400">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(evento) => {
          evento.preventDefault()
          const campo = evento.currentTarget.elements.namedItem('contexto')
          if (campo instanceof HTMLInputElement) {
            agregar(campo.value)
            campo.value = ''
          }
        }}
        className="mt-2 flex gap-2"
      >
        <input
          type="text"
          name="contexto"
          placeholder="Agregar contexto"
          aria-label="Nuevo contexto"
          className="min-h-12 flex-1 rounded-2xl border border-neutral-200 bg-white px-3 text-base text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-neutral-200 px-4 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          Agregar
        </button>
      </form>
    </div>
  )
}
