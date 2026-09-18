/**
 * La pantalla de Hábitos (sección 13).
 *
 * La lista de todo lo que se sigue, con los archivados abajo en su propio
 * bloque. De aquí salen las cuatro operaciones de la sección 9: crear, editar,
 * archivar —con su vuelta— y eliminar.
 *
 * El hábito abierto se guarda **por su id y no por el objeto**: después de
 * guardar un cambio se vuelven a leer los datos, y quedarse con el objeto viejo
 * enseñaría el hábito de antes. Si se elimina, el id deja de encontrarse y el
 * detalle se cierra solo.
 */

import { useState } from 'react'

import FormularioHabito from '../componentes/FormularioHabito'
import DetalleHabito from './DetalleHabito'
import { guardarHabito } from '../datos/repositorio'
import { hoy as hoyMismo } from '../logica/fechas'
import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { rachaDe } from '../logica/rachas'
import { textoDeRacha } from '../logica/textos'
import { useDatos } from './useDatos'
import { useDiscrecion } from './discrecion'
import type { DatosDeHoy } from './useDatos'
import type { Fecha, Habito } from '../tipos'

export default function Habitos() {
  const { datos, recargar } = useDatos()
  const [abierto, setAbierto] = useState<string | null>(null)
  // `null` no es «cerrado» sino «alta»: por eso el formulario se pregunta
  // aparte, con su propia bandera.
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const hoy = hoyMismo()

  const todos = [...datos.habitos, ...datos.archivados]
  const detalle = todos.find((habito) => habito.id === abierto) ?? null
  const enEdicion = todos.find((habito) => habito.id === editando) ?? null

  function guardar(habito: Habito) {
    guardarHabito(habito)
    setFormularioAbierto(false)
    setEditando(null)
    recargar()
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28">
      <header className="borde-superior-seguro flex items-center justify-between pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Hábitos</h1>
        <button
          type="button"
          onClick={() => {
            setEditando(null)
            setFormularioAbierto(true)
          }}
          className="-mr-2 rounded-xl px-3 py-2 text-base font-medium text-neutral-500 dark:text-neutral-400"
        >
          Nuevo
        </button>
      </header>

      {todos.length === 0 && (
        <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          Todavía no hay hábitos. Toca «Nuevo» para crear el primero.
        </p>
      )}

      <Lista titulo="Activos" habitos={datos.habitos} datos={datos} hoy={hoy} alAbrir={setAbierto} />

      {datos.archivados.length > 0 && (
        <Lista
          titulo="Archivados"
          habitos={datos.archivados}
          datos={datos}
          hoy={hoy}
          alAbrir={setAbierto}
          apagados
        />
      )}

      {detalle !== null && (
        <DetalleHabito
          habito={detalle}
          datos={datos}
          hoy={hoy}
          alCerrar={() => setAbierto(null)}
          alEditar={() => {
            setEditando(detalle.id)
            setFormularioAbierto(true)
          }}
          alCambiar={recargar}
        />
      )}

      {formularioAbierto && (
        <FormularioHabito
          habito={enEdicion}
          existentes={todos}
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
  habitos,
  datos,
  hoy,
  alAbrir,
  apagados = false,
}: {
  titulo: string
  habitos: Habito[]
  datos: DatosDeHoy
  hoy: Fecha
  alAbrir: (id: string) => void
  apagados?: boolean
}) {
  if (habitos.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">{titulo}</h2>
      <ul className={`flex flex-col gap-2 ${apagados ? 'opacity-60' : ''}`}>
        {habitos.map((habito) => (
          <Fila key={habito.id} habito={habito} datos={datos} hoy={hoy} alAbrir={alAbrir} />
        ))}
      </ul>
    </section>
  )
}

/** Un renglón de la lista. Toda la fila se toca: abre el detalle. */
function Fila({
  habito,
  datos,
  hoy,
  alAbrir,
}: {
  habito: Habito
  datos: DatosDeHoy
  hoy: Fecha
  alAbrir: (id: string) => void
}) {
  const { mostrarNombresReales } = useDiscrecion()
  const { actual } = rachaDe(habito, datos, hoy)

  return (
    <li>
      <button
        type="button"
        onClick={() => alAbrir(habito.id)}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span aria-hidden="true" className="text-2xl">
          {mostrarIcono(habito)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
            {mostrarNombre(habito, mostrarNombresReales)}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {habito.tipo === 'negativo' ? `${actual} días limpios` : textoDeRacha(habito, actual)}
          </p>
        </div>
        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">
          ›
        </span>
      </button>
    </li>
  )
}
