/**
 * Los patrones de recaída en pantalla (sección 10).
 *
 * Arriba la frase —*«el 71 % de tus recaídas son viernes o sábado»*—, que es lo
 * que de verdad sirve para decidir qué hacer el viernes, y debajo los tres
 * desgloses: por día, por hora y por contexto.
 *
 * Sin lenguaje de juicio, igual que al registrarlas: esto describe, no regaña.
 * Y si todavía no hay recaídas, no se enseña una pantalla vacía con ceros: se
 * dice en una línea y ya.
 */

import { fraseDeLosDias, recaidasPorContexto, recaidasPorDia, recaidasPorHora } from '../logica/patrones'
import { pluralizar } from '../logica/textos'
import FilaConBarra from './FilaConBarra'
import type { Conteo } from '../logica/patrones'
import type { Registro } from '../tipos'

export default function PatronesRecaida({ recaidas }: { recaidas: Registro[] }) {
  if (recaidas.length === 0) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Patrones de recaída</h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Todavía no hay recaídas registradas.
        </p>
      </section>
    )
  }

  const porDia = recaidasPorDia(recaidas)
  const frase = fraseDeLosDias(porDia)

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Patrones de recaída</h2>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
        {pluralizar(recaidas.length, 'recaída registrada', 'recaídas registradas')}
      </p>

      {frase !== null && (
        <p className="mt-3 rounded-xl bg-neutral-100 px-3 py-2.5 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {frase}
        </p>
      )}

      <Desglose titulo="Por día" conteos={porDia} />
      <Desglose titulo="Por hora" conteos={recaidasPorHora(recaidas)} />
      <Desglose titulo="Por contexto" conteos={recaidasPorContexto(recaidas)} />
    </section>
  )
}

function Desglose({ titulo, conteos }: { titulo: string; conteos: Conteo[] }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs text-neutral-400 dark:text-neutral-500">{titulo}</h3>
      <ul className="mt-1">
        {conteos.map((conteo) => (
          <FilaConBarra
            key={conteo.etiqueta}
            etiqueta={conteo.etiqueta}
            valor={conteo.cuenta === 0 ? '—' : `${conteo.cuenta} · ${conteo.porcentaje} %`}
            porcentaje={conteo.porcentaje}
            tono="rojo"
          />
        ))}
      </ul>
    </div>
  )
}
