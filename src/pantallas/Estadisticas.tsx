/**
 * La pantalla de Estadísticas (sección 13).
 *
 * Cuatro bloques: el ranking de cumplimiento a 30 días, la mejor racha de toda
 * la app, en qué días de la semana se cumple más, y los patrones de recaída.
 *
 * **Aquí los hábitos privados salen siempre con su alias.** No hace falta que
 * esta pantalla se acuerde de nada ni lleve una bandera especial: llama a
 * `mostrarNombre(habito)` **a secas**, sin pasarle el interruptor de nombres
 * reales, y esa omisión es la protección (sección 8). Si algún día alguien
 * agrega un bloque nuevo aquí y se le olvida el detalle, lo que saldrá es el
 * alias, que es el error bueno.
 *
 * Solo mira los hábitos activos: uno archivado ya no se está siguiendo y
 * ensuciaría la comparación. Su historial completo sigue en su detalle.
 */

import PatronesRecaida from '../componentes/PatronesRecaida'
import FilaConBarra from '../componentes/FilaConBarra'
import { mejorRachaGlobal, patronPorDiaDeSemana, rankingA30Dias } from '../logica/estadisticas'
import { hoy as hoyMismo } from '../logica/fechas'
import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { recaidasDe } from '../logica/patrones'
import { unidadDeRacha } from '../logica/textos'
import { useDatos } from './useDatos'

export default function Estadisticas() {
  const { datos } = useDatos()
  const hoy = hoyMismo()

  const ranking = rankingA30Dias(datos.habitos, datos.registros, hoy)
  const campeon = mejorRachaGlobal(datos.habitos, datos, hoy)
  const porDiaDeSemana = patronPorDiaDeSemana(datos.habitos, datos.registros, hoy)
  const recaidas = recaidasDe(datos.habitos, datos.registros)

  return (
    <div className="mx-auto max-w-md px-4 pb-28">
      <header className="borde-superior-seguro pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Stats</h1>
        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Cómo vienes últimamente</p>
      </header>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Cumplimiento a 30 días</h2>
          <ul className="mt-2">
            {ranking.map((fila) => (
              <FilaConBarra
                key={fila.habito.id}
                icono={mostrarIcono(fila.habito)}
                // Sin interruptor: en esta pantalla, siempre el alias.
                etiqueta={mostrarNombre(fila.habito)}
                valor={fila.cumplimiento.porcentaje === null ? 'nuevo' : `${fila.cumplimiento.porcentaje} %`}
                porcentaje={fila.cumplimiento.porcentaje}
                tono="verde"
              />
            ))}
          </ul>
          {ranking.length === 0 && (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Todavía no hay hábitos activos.</p>
          )}
        </section>

        {campeon !== null && (
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Mejor racha</h2>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                {campeon.mejor}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {unidadDeRacha(campeon.habito, campeon.mejor)}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
              <span aria-hidden="true">{mostrarIcono(campeon.habito)}</span>
              {mostrarNombre(campeon.habito)}
            </p>
          </section>
        )}

        <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Por día de la semana</h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Qué tanto se cumple cada día, en las últimas doce semanas
          </p>
          <ul className="mt-2">
            {porDiaDeSemana.map((dia) => (
              <FilaConBarra
                key={dia.nombre}
                etiqueta={dia.nombre}
                valor={dia.porcentaje === null ? '—' : `${dia.porcentaje} %`}
                porcentaje={dia.porcentaje}
                tono="verde"
              />
            ))}
          </ul>
        </section>

        <PatronesRecaida recaidas={recaidas} />
      </div>
    </div>
  )
}
