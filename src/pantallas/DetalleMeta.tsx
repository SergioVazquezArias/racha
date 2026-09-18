/**
 * El detalle de una meta (sección 13).
 *
 * Es la pantalla donde vive todo lo de la fase 07: la gráfica de la curva real
 * contra la recta del objetivo, los hitos, la proyección en palabras, la grasa
 * estimada, las barras de los hábitos vinculados y la lista de mediciones.
 *
 * Las cuatro operaciones de la meta salen de aquí: medir, editar, cerrarla como
 * cumplida o abandonada, y eliminarla escribiendo su nombre.
 *
 * Una meta cerrada enseña lo mismo pero ya no ofrece medir: lo que pasó, pasó.
 */

import { useState } from 'react'

import CerrarMeta from '../componentes/CerrarMeta'
import ConfirmarEliminarMeta from '../componentes/ConfirmarEliminarMeta'
import GraficaMeta from '../componentes/GraficaMeta'
import HabitosDeLaMeta from '../componentes/HabitosDeLaMeta'
import HojaMedicion from '../componentes/HojaMedicion'
import ListaDeMediciones from '../componentes/ListaDeMediciones'
import ResumenDeMeta from '../componentes/ResumenDeMeta'
import { cerrada } from '../logica/metasAltas'
import { eliminarMedicion, eliminarMeta, guardarMedicion, guardarMeta } from '../datos/repositorio'
import { habitosDe, medicionesDe } from './useDatosMetas'
import { progresoDe } from '../logica/metas'
import { textoDeCadencia, textoDeCierre, valorConUnidad } from '../logica/textosMetas'
import type { DatosDeMetas } from './useDatosMetas'
import type { Fecha, Medicion, Meta } from '../tipos'

interface Props {
  meta: Meta
  datos: DatosDeMetas
  hoy: Fecha
  alCerrar: () => void
  alEditar: () => void
  alCambiar: () => void
}

/** Qué hoja está abierta encima del detalle. */
type Hoja = { cual: 'medicion'; medicion: Medicion | null } | { cual: 'cierre' } | { cual: 'eliminar' } | null

export default function DetalleMeta({ meta, datos, hoy, alCerrar, alEditar, alCambiar }: Props) {
  const [hoja, setHoja] = useState<Hoja>(null)
  const mediciones = medicionesDe(datos, meta.id)
  const progreso = progresoDe(meta, mediciones, hoy)
  const activa = meta.estado === 'activa'
  const cierre = textoDeCierre(meta)

  function guardar(medicion: Medicion) {
    guardarMedicion(medicion)
    setHoja(null)
    alCambiar()
  }

  function borrarMedicion(medicionId: string) {
    eliminarMedicion(medicionId)
    setHoja(null)
    alCambiar()
  }

  function cerrarMeta(como: 'cumplida' | 'abandonada', cuando: Fecha) {
    guardarMeta(cerrada(meta, como, cuando))
    setHoja(null)
    alCambiar()
  }

  function borrarMeta() {
    eliminarMeta(meta.id)
    setHoja(null)
    alCambiar()
    alCerrar()
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-stone-100 dark:bg-stone-950">
      <div className="mx-auto max-w-md px-4 pb-16">
        <header className="borde-superior-seguro flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={alCerrar}
            className="-ml-2 px-2 py-1 text-base font-medium text-neutral-500 dark:text-neutral-400"
          >
            ‹ Metas
          </button>
          <button
            type="button"
            onClick={alEditar}
            className="-mr-2 px-2 py-1 text-base font-medium text-neutral-500 dark:text-neutral-400"
          >
            Editar
          </button>
        </header>

        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {meta.nombre}
        </h1>

        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {progreso.valorActual === null
            ? `Meta: ${valorConUnidad(meta.valorObjetivo, meta.unidad)}`
            : `${valorConUnidad(progreso.valorActual, meta.unidad)} · meta ${valorConUnidad(
                meta.valorObjetivo,
                meta.unidad,
              )}`}
          {cierre !== null && ` · ${cierre}`}
        </p>

        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <GraficaMeta meta={meta} mediciones={mediciones} />
          <p className="mt-1 px-1 text-[0.7rem] leading-relaxed text-neutral-400 dark:text-neutral-500">
            La línea punteada es el plan. Los puntos huecos son mediciones de noche.
          </p>
        </section>

        <div className="mt-3 flex flex-col gap-3">
          <ResumenDeMeta
            meta={meta}
            mediciones={mediciones}
            progreso={progreso}
            estaturaCm={datos.ajustes.estaturaCm}
            hoy={hoy}
          />

          <HabitosDeLaMeta habitos={habitosDe(datos, meta)} datos={datos} hoy={hoy} />

          <ListaDeMediciones
            meta={meta}
            mediciones={mediciones}
            cadencia={textoDeCadencia(meta)}
            alTocar={(medicion) => setHoja({ cual: 'medicion', medicion })}
          />
        </div>

        {activa && (
          <button
            type="button"
            onClick={() => setHoja({ cual: 'medicion', medicion: null })}
            className="mt-6 w-full rounded-2xl bg-neutral-900 py-4 text-base font-medium text-white active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-900"
          >
            Nueva medición
          </button>
        )}

        {activa && (
          <button
            type="button"
            onClick={() => setHoja({ cual: 'cierre' })}
            className="mt-3 w-full rounded-2xl border border-neutral-200 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
          >
            Cerrar esta meta
          </button>
        )}

        <button
          type="button"
          onClick={() => setHoja({ cual: 'eliminar' })}
          className="mt-3 w-full rounded-2xl py-3 text-sm text-red-600 dark:text-red-400"
        >
          Eliminar meta
        </button>
      </div>

      {hoja?.cual === 'medicion' && (
        <HojaMedicion
          meta={meta}
          medicion={hoja.medicion}
          hoy={hoy}
          alCerrar={() => setHoja(null)}
          alGuardar={guardar}
          alEliminar={
            hoja.medicion === null ? undefined : () => borrarMedicion(hoja.medicion?.id ?? '')
          }
        />
      )}

      {hoja?.cual === 'cierre' && (
        <CerrarMeta meta={meta} hoy={hoy} alCerrar={() => setHoja(null)} alConfirmar={cerrarMeta} />
      )}

      {hoja?.cual === 'eliminar' && (
        <ConfirmarEliminarMeta
          meta={meta}
          mediciones={mediciones}
          alCerrar={() => setHoja(null)}
          alEliminar={borrarMeta}
          alAbandonar={() => cerrarMeta('abandonada', hoy)}
        />
      )}
    </div>
  )
}
