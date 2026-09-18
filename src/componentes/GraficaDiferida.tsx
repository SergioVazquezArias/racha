/**
 * La gráfica de una meta, traída solo cuando hace falta (fase 08).
 *
 * Recharts es con diferencia lo más pesado del proyecto: pesa más que el resto
 * de la app junta. Y la app se abre a diario para lo mismo, tres toques en la
 * pantalla Hoy, que no necesitan ni una línea de esa librería.
 *
 * Por eso no viaja en el arranque. Se descarga la primera vez que abres una
 * meta —una espera de un parpadeo, con la app ya en pantalla— y de ahí en
 * adelante vive en el teléfono. Quien solo palomea sus hábitos nunca la baja.
 *
 * Mientras llega se deja un hueco del alto exacto de la gráfica, el mismo `h-56`
 * que usa `GraficaMeta`, para que nada brinque cuando aparezca.
 */

import { Suspense, lazy } from 'react'

import type { Medicion, Meta } from '../tipos'

const GraficaMeta = lazy(() => import('./GraficaMeta'))

export default function GraficaDiferida({
  meta,
  mediciones,
}: {
  meta: Meta
  mediciones: Medicion[]
}) {
  return (
    <Suspense fallback={<div className="h-56 w-full" aria-hidden />}>
      <GraficaMeta meta={meta} mediciones={mediciones} />
    </Suspense>
  )
}
