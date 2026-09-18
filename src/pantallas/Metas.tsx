/**
 * La pantalla de Metas (sección 13).
 *
 * La lista de lo que se persigue a mediano plazo, con las cerradas abajo en su
 * propio bloque y apagadas, igual que los hábitos archivados. Cada renglón dice
 * en una línea lo único que importa de un vistazo: cómo vas contra el plan.
 *
 * La meta abierta se guarda **por su id y no por el objeto**: después de
 * guardar una medición se vuelven a leer los datos, y quedarse con el objeto
 * viejo enseñaría la meta de antes. Si se elimina, el id deja de encontrarse y
 * el detalle se cierra solo.
 */

import { useState } from 'react'

import DetalleMeta from './DetalleMeta'
import FormularioMeta from '../componentes/FormularioMeta'
import { guardarMeta } from '../datos/repositorio'
import { hoy as hoyMismo } from '../logica/fechas'
import { medicionesDe, useDatosMetas } from './useDatosMetas'
import { progresoDe } from '../logica/metas'
import { textoDeCierre, textoDeProgreso, valorConUnidad } from '../logica/textosMetas'
import type { DatosDeMetas } from './useDatosMetas'
import type { Fecha, Meta } from '../tipos'

export default function Metas() {
  const { datos, recargar } = useDatosMetas()
  const [abierta, setAbierta] = useState<string | null>(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const hoy = hoyMismo()

  const detalle = datos.metas.find((meta) => meta.id === abierta) ?? null
  const enEdicion = datos.metas.find((meta) => meta.id === editando) ?? null
  const activas = datos.metas.filter((meta) => meta.estado === 'activa')
  const cerradas = datos.metas.filter((meta) => meta.estado !== 'activa')

  function guardar(meta: Meta) {
    guardarMeta(meta)
    setFormularioAbierto(false)
    setEditando(null)
    recargar()
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28">
      <header className="borde-superior-seguro flex items-center justify-between pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Metas</h1>
        <button
          type="button"
          onClick={() => {
            setEditando(null)
            setFormularioAbierto(true)
          }}
          className="-mr-2 rounded-xl px-3 py-2 text-base font-medium text-neutral-500 dark:text-neutral-400"
        >
          Nueva
        </button>
      </header>

      {datos.metas.length === 0 && (
        <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          Todavía no hay metas. Toca «Nueva» para crear la primera.
        </p>
      )}

      <Lista titulo="Activas" metas={activas} datos={datos} hoy={hoy} alAbrir={setAbierta} />
      <Lista titulo="Cerradas" metas={cerradas} datos={datos} hoy={hoy} alAbrir={setAbierta} apagadas />

      {detalle !== null && (
        <DetalleMeta
          meta={detalle}
          datos={datos}
          hoy={hoy}
          alCerrar={() => setAbierta(null)}
          alEditar={() => {
            setEditando(detalle.id)
            setFormularioAbierto(true)
          }}
          alCambiar={recargar}
        />
      )}

      {formularioAbierto && (
        <FormularioMeta
          meta={enEdicion}
          habitos={datos.habitos}
          hoy={hoy}
          alCerrar={() => {
            setFormularioAbierto(false)
            setEditando(null)
          }}
          alGuardar={guardar}
        />
      )}
    </div>
  )
}

function Lista({
  titulo,
  metas,
  datos,
  hoy,
  alAbrir,
  apagadas = false,
}: {
  titulo: string
  metas: Meta[]
  datos: DatosDeMetas
  hoy: Fecha
  alAbrir: (id: string) => void
  apagadas?: boolean
}) {
  if (metas.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">{titulo}</h2>
      <ul className={`flex flex-col gap-2 ${apagadas ? 'opacity-60' : ''}`}>
        {metas.map((meta) => (
          <Fila key={meta.id} meta={meta} datos={datos} hoy={hoy} alAbrir={alAbrir} />
        ))}
      </ul>
    </section>
  )
}

/** Un renglón de la lista. Toda la fila se toca: abre el detalle. */
function Fila({
  meta,
  datos,
  hoy,
  alAbrir,
}: {
  meta: Meta
  datos: DatosDeMetas
  hoy: Fecha
  alAbrir: (id: string) => void
}) {
  const progreso = progresoDe(meta, medicionesDe(datos, meta.id), hoy)
  const cierre = textoDeCierre(meta)

  return (
    <li>
      <button
        type="button"
        onClick={() => alAbrir(meta.id)}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">{meta.nombre}</p>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {cierre ?? textoDeProgreso(meta, progreso)}
          </p>
        </div>

        <span className="shrink-0 text-right">
          <span className="block text-base font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
            {progreso.valorActual === null ? '—' : valorConUnidad(progreso.valorActual, meta.unidad)}
          </span>
          <span className="block text-[0.65rem] text-neutral-400 dark:text-neutral-500">
            meta {valorConUnidad(meta.valorObjetivo, meta.unidad)}
          </span>
        </span>

        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">
          ›
        </span>
      </button>
    </li>
  )
}
