/**
 * Cartel provisional de la fase 02.
 *
 * Todavía no hay pantallas: esto solo confirma que los datos de ejemplo se
 * sembraron bien en el teléfono. En la fase 04 lo reemplaza la pantalla Hoy.
 *
 * No muestra el nombre de ningún hábito a propósito. El nombre visible siempre
 * se obtiene con `mostrarNombre(habito)`, que llega en la fase 05 con el modo
 * discreto (regla 7).
 */

import {
  obtenerHabitosActivos,
  obtenerMediciones,
  obtenerMetas,
  obtenerRegistros,
  obtenerSemanas,
} from './datos/repositorio'

export default function App() {
  const cuentas = [
    { etiqueta: 'Hábitos activos', valor: obtenerHabitosActivos().length },
    { etiqueta: 'Registros', valor: obtenerRegistros().length },
    { etiqueta: 'Semanas cerradas', valor: obtenerSemanas().length },
    { etiqueta: 'Metas', valor: obtenerMetas().length },
    { etiqueta: 'Mediciones', valor: obtenerMediciones().length },
  ]

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Racha</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Fase 02 lista: tipos, repositorio y datos de ejemplo.
        </p>
      </header>

      <dl className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {cuentas.map((cuenta) => (
          <div key={cuenta.etiqueta} className="flex items-baseline justify-between px-4 py-3">
            <dt className="text-sm text-neutral-600">{cuenta.etiqueta}</dt>
            <dd className="text-lg font-medium tabular-nums">{cuenta.valor}</dd>
          </div>
        ))}
      </dl>

      <p className="text-xs text-neutral-500">
        Las pantallas llegan en la fase 04.
      </p>
    </main>
  )
}
