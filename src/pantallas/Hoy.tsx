/**
 * La pantalla Hoy: la única que se abre a diario (sección 13).
 *
 * Va en este orden, de arriba abajo:
 *
 * 1. **Por hacer** — los hábitos positivos que faltan. Al marcar uno se baja al
 *    bloque de «Ya hecho hoy», y si fue un error se vuelve a tocar y regresa.
 * 2. **Vas limpio** — los negativos y su contador de días.
 * 3. **Esta semana** — las marcas de la semana y los comodines disponibles.
 *
 * La interacción diaria real son tres toques: los negativos no piden nada
 * (sección 12).
 */

import { useState } from 'react'

import FilaHabitoNegativo from '../componentes/FilaHabitoNegativo'
import FilaHabitoPositivo from '../componentes/FilaHabitoPositivo'
import ResumenSemana from '../componentes/ResumenSemana'
import { obtenerAjustes } from '../datos/repositorio'
import { estaMarcado } from '../logica/dia'
import { fechaEnPalabras, hoy as hoyMismo } from '../logica/fechas'
import { tocaAvisar } from '../logica/respaldo'
import Ajustes from './Ajustes'
import { useDatos } from './useDatos'
import type { DatosDeHoy } from './useDatos'
import type { Fecha, Habito } from '../tipos'

export default function Hoy() {
  const { datos, recargar } = useDatos()
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false)
  const hoy = hoyMismo()

  // El punto del engrane: hace más de 30 días que no hay respaldo (sección 14).
  // A Ajustes se entra una vez al mes, así que el aviso no se enteraría de nada
  // si solo viviera ahí dentro. Es un punto y nada más: no dice de qué es,
  // porque esta pantalla se ve de reojo (sección 8).
  //
  // Se vuelve a mirar al cerrar Ajustes, que es lo único que puede cambiarlo, y
  // no en cada toque de un hábito: leer los datos completos para pintar un
  // punto de ocho píxeles sería caro para lo que se usa esta pantalla.
  const [faltaRespaldo, setFaltaRespaldo] = useState(() => faltaElRespaldo(hoy))

  function cerrarAjustes() {
    setAjustesAbiertos(false)
    setFaltaRespaldo(faltaElRespaldo(hoy))
  }

  const positivos = datos.habitos.filter((habito) => habito.tipo === 'positivo')
  const negativos = datos.habitos.filter((habito) => habito.tipo === 'negativo')
  const pendientes = positivos.filter((habito) => !estaMarcado(habito.id, datos.registros, hoy))
  const hechos = positivos.filter((habito) => estaMarcado(habito.id, datos.registros, hoy))

  return (
    <div className="mx-auto max-w-md px-4 pb-28">
      <header className="borde-superior-seguro flex items-start justify-between pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Hoy</h1>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{fechaEnPalabras(hoy)}</p>
        </div>
        {/* El engrane abre Ajustes, que tapa la pantalla hasta que se toca «Listo». */}
        <button
          type="button"
          onClick={() => setAjustesAbiertos(true)}
          aria-label={faltaRespaldo ? 'Abrir ajustes: falta hacer un respaldo' : 'Abrir ajustes'}
          className="relative -mt-1 -mr-2 rounded-xl p-2 text-xl opacity-60"
        >
          <span aria-hidden="true">⚙️</span>
          {faltaRespaldo && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500"
            />
          )}
        </button>
      </header>

      {ajustesAbiertos && <Ajustes alCerrar={cerrarAjustes} />}

      <Seccion titulo="Por hacer" cuenta={pendientes.length}>
        {pendientes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-200 p-4 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            {positivos.length === 0 ? 'Todavía no hay hábitos positivos.' : 'Todo listo por hoy.'}
          </p>
        ) : (
          <Lista habitos={pendientes} datos={datos} hoy={hoy} alCambiar={recargar} />
        )}

        {hechos.length > 0 && (
          <>
            <p className="mt-4 mb-2 text-xs text-neutral-400 dark:text-neutral-500">Ya hecho hoy</p>
            <Lista habitos={hechos} datos={datos} hoy={hoy} alCambiar={recargar} />
          </>
        )}
      </Seccion>

      <Seccion titulo="Vas limpio" cuenta={negativos.length}>
        <ul className="flex flex-col gap-2">
          {negativos.map((habito) => (
            <FilaHabitoNegativo
              key={habito.id}
              habito={habito}
              datos={datos}
              hoy={hoy}
              alCambiar={recargar}
            />
          ))}
        </ul>
      </Seccion>

      <div className="mt-6">
        <ResumenSemana datos={datos} hoy={hoy} />
      </div>
    </div>
  )
}

/** Un título de sección con su cuenta al lado. */
function Seccion({
  titulo,
  cuenta,
  children,
}: {
  titulo: string
  cuenta: number
  children: React.ReactNode
}) {
  return (
    <section className="mt-2 mb-6">
      <h2 className="mb-2 flex items-baseline gap-2">
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{titulo}</span>
        <span className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500">{cuenta}</span>
      </h2>
      {children}
    </section>
  )
}

/** Una lista de hábitos positivos. */
function Lista({
  habitos,
  datos,
  hoy,
  alCambiar,
}: {
  habitos: Habito[]
  datos: DatosDeHoy
  hoy: Fecha
  alCambiar: () => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {habitos.map((habito) => (
        <FilaHabitoPositivo key={habito.id} habito={habito} datos={datos} hoy={hoy} alCambiar={alCambiar} />
      ))}
    </ul>
  )
}

/** ¿Hace más de 30 días que no se respalda? Lo que enciende el punto del engrane. */
function faltaElRespaldo(hoy: Fecha): boolean {
  return tocaAvisar(obtenerAjustes().ultimoRespaldo, hoy)
}
