/**
 * Los tres números de un hábito, siempre juntos (sección 6).
 *
 * El documento es explícito en que no se separan, y la razón es que cada uno
 * miente solo:
 *
 * - **La racha actual** motiva, pero se cae entera con un mal día.
 * - **La mejor racha** no se pierde nunca, pero puede ser de hace un año.
 * - **El cumplimiento** es el número honesto, pero no dice si vas seguido.
 *
 * El cumplimiento se enseña en sus tres ventanas —7 días, 30 días y todo— por
 * lo mismo: a siete días se ve la semana que llevas, a treinta la temporada, y
 * en total quién eres con este hábito.
 */

import { cumplimientos } from '../logica/cumplimiento'
import { rachaDe } from '../logica/rachas'
import { pluralizar, unidadDeRacha } from '../logica/textos'
import type { Cumplimiento } from '../logica/cumplimiento'
import type { DatosDeRacha } from '../logica/rachas'
import type { Fecha, Habito } from '../tipos'

interface Props {
  habito: Habito
  datos: DatosDeRacha
  hoy: Fecha
}

export default function NumerosDeHabito({ habito, datos, hoy }: Props) {
  const { actual, mejor } = rachaDe(habito, datos, hoy)
  const tres = cumplimientos(habito, datos.registros, hoy)

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="grid grid-cols-2 gap-3">
        <Numero titulo="Racha actual" valor={`${actual} ${unidadDeRacha(habito, actual)}`} />
        <Numero titulo="Mejor racha" valor={`${mejor} ${unidadDeRacha(habito, mejor)}`} />
      </div>

      <h3 className="mt-4 mb-2 text-xs text-neutral-400 dark:text-neutral-500">Cumplimiento</h3>
      <div className="grid grid-cols-3 gap-2">
        <Porcentaje titulo="7 días" cumplimiento={tres.sieteDias} />
        <Porcentaje titulo="30 días" cumplimiento={tres.treintaDias} />
        <Porcentaje titulo="Total" cumplimiento={tres.total} />
      </div>
    </section>
  )
}

function Numero({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{titulo}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
        {valor}
      </p>
    </div>
  )
}

/**
 * Un porcentaje con los días sobre los que se sacó.
 *
 * El renglón de abajo —«sobre 9 días»— está ahí para que un 100 % de un hábito
 * de tres días no se lea como un 100 % de un hábito de tres meses.
 */
function Porcentaje({ titulo, cumplimiento }: { titulo: string; cumplimiento: Cumplimiento }) {
  return (
    <div className="rounded-xl bg-neutral-100 px-2 py-2 text-center dark:bg-neutral-800">
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{titulo}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
        {cumplimiento.porcentaje === null ? '—' : `${cumplimiento.porcentaje} %`}
      </p>
      <p className="text-[0.65rem] text-neutral-400 dark:text-neutral-500">
        {cumplimiento.dias === 0 ? 'sin días aún' : `sobre ${pluralizar(cumplimiento.dias, 'día', 'días')}`}
      </p>
    </div>
  )
}
