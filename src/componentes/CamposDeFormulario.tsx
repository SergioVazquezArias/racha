/**
 * Las piezas sueltas de los formularios: un interruptor, un campo de texto, un
 * número y un selector de dos o tres opciones.
 *
 * Viven aparte porque las usan Ajustes y el formulario de hábitos, y porque
 * todas tienen que cumplir la misma regla: **del tamaño de un pulgar**. En un
 * iPhone, un control de menos de 44 puntos de alto se falla al tocarlo, y este
 * archivo es el único lugar donde eso se decide.
 */

/** Un interruptor. Toda la fila es el botón, no solo la palanca. */
export function Interruptor({
  titulo,
  prendido,
  alTocar,
}: {
  titulo: string
  prendido: boolean
  alTocar: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={prendido}
      onClick={alTocar}
      className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left dark:bg-neutral-900"
    >
      <span className="text-base text-neutral-900 dark:text-neutral-100">{titulo}</span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          prendido ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform dark:bg-neutral-900 ${
            prendido ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

/** Un campo de texto con su etiqueta encima. */
export function CampoTexto({
  etiqueta,
  valor,
  alCambiar,
  ancho,
  ...resto
}: {
  etiqueta: string
  valor: string
  alCambiar: (valor: string) => void
  ancho?: string
  placeholder?: string
  maxLength?: number
}) {
  return (
    <label className={`block ${ancho ?? ''}`}>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{etiqueta}</span>
      <input
        type="text"
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        className="mt-1 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-base text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        {...resto}
      />
    </label>
  )
}

/**
 * Un número chico y entero. Abre el teclado numérico del teléfono.
 *
 * Por omisión llega hasta 7, que son las veces por semana de un hábito. El día
 * del mes de una meta usa el mismo campo con el tope en 28.
 */
export function CampoNumero({
  etiqueta,
  valor,
  alCambiar,
  maximo = 7,
}: {
  etiqueta: string
  valor: number | null
  alCambiar: (valor: number | null) => void
  maximo?: number
}) {
  return (
    <label className="block flex-1">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{etiqueta}</span>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={maximo}
        value={valor ?? ''}
        onChange={(evento) => alCambiar(evento.target.value === '' ? null : Number(evento.target.value))}
        className="mt-1 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-base tabular-nums text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  )
}

export interface Opcion<T extends string> {
  valor: T
  texto: string
}

/**
 * Un selector de dos o tres opciones, en fila.
 *
 * Se puede bloquear —`fijo`— y entonces se ve apagado y no responde: así se
 * enseña el tipo y la cadencia de un hábito que ya existe sin dejar cambiarlos,
 * que es lo que pide la regla 2 de la sección 9.
 */
export function Segmentado<T extends string>({
  etiqueta,
  opciones,
  valor,
  alElegir,
  fijo = false,
}: {
  etiqueta: string
  opciones: Opcion<T>[]
  valor: T
  alElegir: (valor: T) => void
  fijo?: boolean
}) {
  return (
    <fieldset disabled={fijo} className={fijo ? 'opacity-60' : ''}>
      <legend className="text-xs text-neutral-500 dark:text-neutral-400">{etiqueta}</legend>
      <div className="mt-1 flex gap-2">
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={valor === opcion.valor}
            onClick={() => alElegir(opcion.valor)}
            className={`min-h-12 flex-1 rounded-2xl border px-3 text-sm transition-colors ${
              valor === opcion.valor
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                : 'border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200'
            }`}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
