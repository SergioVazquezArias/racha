/**
 * El detalle de un hábito (sección 13).
 *
 * De arriba abajo: los tres números siempre juntos, las barras semanales con el
 * color del semáforo, el mapa de calor de catorce semanas y, hasta el fondo,
 * las dos bajas —archivar y eliminar—, en ese orden y con ese peso: archivar es
 * lo habitual y eliminar lo excepcional (sección 9).
 *
 * Aquí **sí se respeta el interruptor de nombres reales**: es la pantalla desde
 * la que se administran los hábitos, y el nombre real se escribe al lado, en el
 * formulario. La que nunca lo respeta es Estadísticas.
 */

import { useState } from 'react'

import BarrasSemanales from '../componentes/BarrasSemanales'
import ConfirmarEliminar from '../componentes/ConfirmarEliminar'
import MapaDeCalor from '../componentes/MapaDeCalor'
import NumerosDeHabito from '../componentes/NumerosDeHabito'
import { archivado, revivido } from '../logica/altas'
import { historialDeSemanas } from '../logica/historial'
import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { rachaDe } from '../logica/rachas'
import { eliminarHabito, guardarHabito } from '../datos/repositorio'
import { fechaEnPalabras } from '../logica/fechas'
import { useDiscrecion } from './discrecion'
import type { DatosDeHoy } from './useDatos'
import type { Fecha, Habito } from '../tipos'

interface Props {
  habito: Habito
  datos: DatosDeHoy
  hoy: Fecha
  alCerrar: () => void
  alEditar: () => void
  /** Se llama después de archivar, revivir o eliminar. */
  alCambiar: () => void
}

export default function DetalleHabito({ habito, datos, hoy, alCerrar, alEditar, alCambiar }: Props) {
  const { mostrarNombresReales } = useDiscrecion()
  const [confirmando, setConfirmando] = useState(false)
  const semanas = historialDeSemanas(habito, datos, hoy)
  const guardado = habito.archivadoEn !== null

  function archivar() {
    // La mejor racha se congela aquí: al revivir, el conteo arranca de cero y
    // este número es lo único que sobrevive del historial de rachas.
    guardarHabito(archivado(habito, rachaDe(habito, datos, hoy).mejor, hoy))
    setConfirmando(false)
    alCerrar()
    alCambiar()
  }

  function revivir() {
    guardarHabito(revivido(habito, hoy))
    alCambiar()
  }

  function eliminar() {
    eliminarHabito(habito.id)
    setConfirmando(false)
    alCerrar()
    alCambiar()
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-stone-100 dark:bg-stone-950">
      <div className="mx-auto max-w-md px-4 pb-16">
        <header className="borde-superior-seguro flex items-center justify-between pb-4">
          <button type="button" onClick={alCerrar} className="-ml-2 px-2 py-1 text-base text-neutral-500 dark:text-neutral-400">
            Hábitos
          </button>
          <button type="button" onClick={alEditar} className="-mr-2 px-2 py-1 text-base font-medium text-neutral-500 dark:text-neutral-400">
            Editar
          </button>
        </header>

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-3xl">
            {mostrarIcono(habito)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {mostrarNombre(habito, mostrarNombresReales)}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitulo(habito)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <NumerosDeHabito habito={habito} datos={datos} hoy={hoy} />
          <BarrasSemanales semanas={semanas} />
          <MapaDeCalor semanas={semanas} />
        </div>

        {guardado ? (
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Archivado el {fechaEnPalabras(habito.archivadoEn ?? hoy).toLowerCase()}. Su historial está
              completo; al revivirlo la racha arranca de cero y la mejor se conserva.
            </p>
            <button
              type="button"
              onClick={revivir}
              className="mt-3 w-full rounded-2xl bg-neutral-900 py-3 text-base font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
            >
              Revivir
            </button>
          </section>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={archivar}
              className="w-full rounded-2xl bg-white py-3.5 text-base text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              Archivar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="w-full py-3 text-sm text-neutral-400 dark:text-neutral-500"
            >
              Eliminar
            </button>
          </div>
        )}

        {confirmando && (
          <ConfirmarEliminar
            habito={habito}
            alCerrar={() => setConfirmando(false)}
            alEliminar={eliminar}
            alArchivar={archivar}
          />
        )}
      </div>
    </div>
  )
}

/** El renglón chico bajo el nombre: qué clase de hábito es y desde cuándo. */
function subtitulo(habito: Habito): string {
  const clase =
    habito.tipo === 'negativo'
      ? 'Negativo · días limpios'
      : habito.cadencia === 'semanal'
        ? `Positivo · ${habito.objetivo ?? 0} por semana, mínimo ${habito.minimo ?? 0}`
        : 'Positivo · todos los días'

  return `${clase} · desde el ${fechaEnPalabras(habito.creadoEn).toLowerCase()}`
}
