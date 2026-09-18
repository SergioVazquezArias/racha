/**
 * La tarjeta de resumen de la pantalla Hoy (sección 13).
 *
 * Tres datos y nada más: en qué semana vamos, cuántas marcas lleva contra las
 * propuestas, y cuántos comodines quedan del mes.
 *
 * La barra no se pinta de rojo ni de ámbar: la semana en curso **no tiene
 * veredicto** hasta que se cierre (regla 8). Esto informa, no califica.
 */

import { comodinesDisponibles } from '../logica/comodines'
import { semanaEnPalabras } from '../logica/fechas'
import { marcasDeLaSemana } from '../logica/resumen'
import { textoDeComodines } from '../logica/textos'
import type { DatosDeHoy } from '../pantallas/useDatos'
import type { Fecha } from '../tipos'

interface Props {
  datos: DatosDeHoy
  hoy: Fecha
}

export default function ResumenSemana({ datos, hoy }: Props) {
  const { hechas, objetivo } = marcasDeLaSemana(datos.habitos, datos.registros, hoy)
  const comodines = comodinesDisponibles(datos.comodines, hoy)
  const avance = objetivo === 0 ? 0 : Math.min(100, Math.round((hechas / objetivo) * 100))

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Esta semana</h2>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{semanaEnPalabras(hoy)}</p>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
          {hechas}
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">de {objetivo} marcas</span>
      </p>

      <div
        role="progressbar"
        aria-valuenow={hechas}
        aria-valuemin={0}
        aria-valuemax={objetivo}
        aria-label="Marcas de la semana"
        className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
      >
        <div className="h-full rounded-full bg-neutral-900 dark:bg-neutral-100" style={{ width: `${avance}%` }} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <span aria-hidden="true">🛡️</span>
        {textoDeComodines(comodines)}
      </p>
    </section>
  )
}
