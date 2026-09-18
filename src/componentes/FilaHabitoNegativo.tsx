/**
 * Un hábito negativo en la pantalla Hoy: sin pantallas, sin refresco, sin postre.
 *
 * Al revés que un positivo, empieza el día **limpio** y cuenta a favor desde
 * que arranca (sección 5). En un día normal el usuario **no hace nada**: el
 * contador sube solo y a medianoche el día se cierra como cumplido.
 *
 * De ahí las tres decisiones de diseño de este componente, y la razón de que sea
 * un archivo distinto del de los positivos (regla 6):
 *
 * - **No hay palomita.** No hay nada que marcar.
 * - **La fila es compacta**, de la misma altura que la de un positivo. La regla
 *   de la pantalla Hoy es que lo que pide acción va accesible y visible, y lo
 *   que solo informa va compacto. Son cinco negativos: si cada uno ocupara el
 *   doble, habría que bajar con el dedo para llegar a lo que sí hay que tocar.
 * - El botón de recaída es **texto gris y nada más**, sin borde ni fondo: está
 *   ahí para cuando se necesita, no para invitar a tocarse, y no debe competir
 *   con la palomita de marcar.
 */

import { useState } from 'react'

import { guardarRegistro } from '../datos/repositorio'
import { idDeRegistro, recaidaDelDia } from '../logica/dia'
import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { useDiscrecion } from '../pantallas/discrecion'
import { rachaDe } from '../logica/rachas'
import { pluralizar, textoDeNegativo } from '../logica/textos'
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
  const { mostrarNombresReales } = useDiscrecion()
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
    <li className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Sin ninguna marca para los privados: se ven idénticos a los demás, que
          es justo lo que pide la sección 8. Un emoji apagado los delataría. */}
      <span aria-hidden="true" className="text-lg">
        {mostrarIcono(habito)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-neutral-700 dark:text-neutral-200">{mostrarNombre(habito, mostrarNombresReales)}</p>
        <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
          {textoDeNegativo(actual, mejor, recaidaDeHoy)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span className="text-sm font-medium tabular-nums text-neutral-600 dark:text-neutral-300">
          {pluralizar(actual, 'día', 'días')}
        </span>

        {/* Texto gris y nada más: no debe competir con la palomita de marcar. */}
        <button
          type="button"
          onClick={() => setHojaAbierta(true)}
          className="-mr-1 px-1 py-0.5 text-xs text-neutral-400 dark:text-neutral-500"
        >
          Recaída
        </button>
      </div>

      {hojaAbierta && (
        <HojaRecaida habito={habito} alCerrar={() => setHojaAbierta(false)} alGuardar={registrar} />
      )}
    </li>
  )
}
