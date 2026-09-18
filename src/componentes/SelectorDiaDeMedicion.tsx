/**
 * Qué día toca medirse.
 *
 * En una meta semanal son los siete días en fila, con su inicial. En una
 * mensual, el día del mes. En las dos, «sin día fijo» es una opción de verdad y
 * no un olvido: un examen de inglés cae cuando cae, y forzarlo a un día
 * inventado sería mentirle a la app.
 *
 * El tope del día del mes es 28 a propósito. Al 30 le falta febrero y al 31 le
 * faltan cuatro meses del año: una meta que se mide el 31 se saltaría un tercio
 * de sus mediciones sin que nadie entendiera por qué.
 */

import { CampoNumero } from './CamposDeFormulario'
import { DIAS_DE_LA_SEMANA } from '../logica/fechas'

interface Props {
  frecuencia: 'semanal' | 'mensual'
  dia: number | null
  alCambiar: (dia: number | null) => void
}

export default function SelectorDiaDeMedicion({ frecuencia, dia, alCambiar }: Props) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Qué día te mides</p>

      {frecuencia === 'semanal' ? (
        <div className="mt-1 flex gap-1">
          {DIAS_DE_LA_SEMANA.map((nombre, cual) => (
            <button
              key={nombre}
              type="button"
              aria-label={nombre}
              aria-pressed={dia === cual}
              onClick={() => alCambiar(dia === cual ? null : cual)}
              className={`min-h-12 flex-1 rounded-xl border text-sm capitalize transition-colors ${
                dia === cual
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                  : 'border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
              }`}
            >
              {nombre.charAt(0)}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-1 flex items-end gap-2">
          <CampoNumero etiqueta="Día del mes (1 a 28)" valor={dia} alCambiar={alCambiar} maximo={28} />
          {dia !== null && (
            <button
              type="button"
              onClick={() => alCambiar(null)}
              className="min-h-12 shrink-0 rounded-2xl px-3 text-sm text-neutral-500 dark:text-neutral-400"
            >
              Quitar
            </button>
          )}
        </div>
      )}

      <p className="mt-1 text-[0.7rem] text-neutral-400 dark:text-neutral-500">
        {dia === null
          ? 'Sin día fijo. Mides cuando puedas.'
          : 'Vuelve a tocarlo para dejarla sin día fijo.'}
      </p>
    </div>
  )
}
