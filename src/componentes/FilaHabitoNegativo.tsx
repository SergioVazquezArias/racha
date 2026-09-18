/**
 * Un hábito negativo en la pantalla Hoy: sin pantallas, sin refresco, sin postre.
 *
 * Al revés que un positivo, empieza el día **limpio** y cuenta a favor desde
 * que arranca (sección 5). En un día normal el usuario **no hace nada**: el
 * contador sube solo y a medianoche el día se cierra como cumplido.
 *
 * De ahí las dos decisiones de diseño de este componente, y la razón de que sea
 * un archivo distinto del de los positivos (regla 6):
 *
 * - **No hay palomita.** No hay nada que marcar.
 * - El botón de recaída es **deliberadamente discreto**: letra chica, gris, sin
 *   ícono, arriba a la derecha y lejos del contador. Está ahí para cuando se
 *   necesita, no para invitar a tocarse.
 */

import { useState } from 'react'

import { guardarRegistro } from '../datos/repositorio'
import { idDeRegistro, recaidaDelDia } from '../logica/dia'
import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { rachaDe } from '../logica/rachas'
import { pluralizar, textoDiasLimpios } from '../logica/textos'
import HojaRecaida from './HojaRecaida'
import type { DatosDeRacha } from '../logica/rachas'
import type { Fecha, Habito, Hora } from '../tipos'

interface Props {
  habito: Habito
  datos: DatosDeRacha
  hoy: Fecha
  /** Se llama después de registrar una recaída, para volver a leer los datos. */
  alCambiar: () => void
}

export default function FilaHabitoNegativo({ habito, datos, hoy, alCambiar }: Props) {
  const [hojaAbierta, setHojaAbierta] = useState(false)
  const { actual, mejor } = rachaDe(habito, datos, hoy)
  const recaidaDeHoy = recaidaDelDia(habito.id, datos.registros, hoy)

  /**
   * Guarda la recaída y cierra la hoja.
   *
   * El `id` es `${habitoId}:${fecha}`, así que registrar dos veces el mismo día
   * corrige el registro en vez de duplicarlo: sirve para arreglar un contexto
   * mal tocado.
   */
  function registrar(hora: Hora, contexto: string | null, nota: string | null) {
    guardarRegistro({
      id: idDeRegistro(habito.id, hoy),
      habitoId: habito.id,
      fecha: hoy,
      estado: 'fallado',
      valor: null,
      hora,
      contexto,
      nota,
    })
    setHojaAbierta(false)
    alCambiar()
  }

  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <span aria-hidden="true" className={habito.privado ? 'text-neutral-400' : ''}>
              {mostrarIcono(habito)}
            </span>
            <span className="truncate">{mostrarNombre(habito)}</span>
          </p>

          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {actual}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{textoDiasLimpios(actual)}</span>
          </p>

          {mejor > actual && (
            <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
              mejor: {pluralizar(mejor, 'día', 'días')}
            </p>
          )}
        </div>

        {/* Discreto a propósito: no debe competir con el contador. */}
        <button
          type="button"
          onClick={() => setHojaAbierta(true)}
          className="shrink-0 rounded-full border border-neutral-200 px-3 py-2 text-xs text-neutral-400 dark:border-neutral-700 dark:text-neutral-500"
        >
          Recaída
        </button>
      </div>

      {recaidaDeHoy !== undefined && (
        <p className="mt-3 border-t border-neutral-100 pt-2 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
          Registrada hoy
          {recaidaDeHoy.hora === null ? '' : ` a las ${recaidaDeHoy.hora}`}
          {recaidaDeHoy.contexto === null ? '' : ` · ${recaidaDeHoy.contexto}`}
        </p>
      )}

      {hojaAbierta && (
        <HojaRecaida habito={habito} alCerrar={() => setHojaAbierta(false)} alGuardar={registrar} />
      )}
    </li>
  )
}
