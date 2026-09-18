/**
 * Los campos que piden un número con decimales o una fecha.
 *
 * Están aparte de `CamposDeFormulario.tsx` por dos razones: ese archivo ya
 * estaba cerca del límite de doscientos renglones (regla 4), y estos dos son de
 * otra familia. El número de un hábito va de 1 a 7 y es entero —cinco veces por
 * semana—; el de una meta trae decimales y no tiene tope: 81.4 kg, 93.5 cm.
 *
 * Los dos abren el teclado que toca en el iPhone y miden lo que mide un pulgar.
 */

/** Un número con decimales. Vacío es vacío, no cero. */
export function CampoDecimal({
  etiqueta,
  valor,
  alCambiar,
  unidad,
  placeholder,
}: {
  etiqueta: string
  valor: number | null
  alCambiar: (valor: number | null) => void
  unidad?: string
  placeholder?: string
}) {
  return (
    <label className="block flex-1">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {etiqueta}
        {unidad !== undefined && unidad !== '' && ` · ${unidad}`}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        value={valor ?? ''}
        placeholder={placeholder}
        onChange={(evento) => {
          const escrito = evento.target.value
          alCambiar(escrito === '' ? null : Number(escrito))
        }}
        className="mt-1 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-base tabular-nums text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  )
}

/** Una fecha. El iPhone abre su rueda de fechas; el valor sigue siendo `"YYYY-MM-DD"`. */
export function CampoFecha({
  etiqueta,
  valor,
  alCambiar,
}: {
  etiqueta: string
  valor: string
  alCambiar: (valor: string) => void
}) {
  return (
    <label className="block flex-1">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{etiqueta}</span>
      <input
        type="date"
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        className="mt-1 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  )
}
