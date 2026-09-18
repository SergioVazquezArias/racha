/**
 * Los hitos de una meta: los puntos intermedios que valen la pena marcar.
 *
 * «Mitad del camino» a los 76 kg, «B1 confirmado» a los 58 puntos. No son
 * el objetivo, son las paradas del camino, y se dibujan como marcadores sobre
 * la gráfica para que se vea cuándo te toca cruzarlas y si las cruzaste antes.
 *
 * Cada hito lleva un valor y una fecha, porque un marcador necesita las dos
 * cosas para pararse en algún lado de la gráfica. Si no sabes qué fecha ponerle,
 * la que corresponde es el día en que la recta del plan pasa por ese valor.
 */

import { CampoDecimal, CampoFecha } from './CamposDeMedida'
import { CampoTexto } from './CamposDeFormulario'
import type { HitoMeta } from '../tipos'

interface Props {
  hitos: HitoMeta[]
  unidad: string
  /** Un valor de arranque razonable para un hito nuevo: la mitad del camino. */
  valorSugerido: number
  /** La fecha que se propone para un hito nuevo, según la recta del plan. */
  fechaSugerida: (valor: number) => string
  alCambiar: (hitos: HitoMeta[]) => void
}

export default function EditorHitos({ hitos, unidad, valorSugerido, fechaSugerida, alCambiar }: Props) {
  function cambiar(posicion: number, cambios: Partial<HitoMeta>) {
    alCambiar(hitos.map((hito, cual) => (cual === posicion ? { ...hito, ...cambios } : hito)))
  }

  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Hitos</p>
      <p className="mt-0.5 text-[0.7rem] text-neutral-400 dark:text-neutral-500">
        Las paradas del camino. Se dibujan sobre la gráfica.
      </p>

      <ul className="mt-2 flex flex-col gap-3">
        {hitos.map((hito, posicion) => (
          <li key={posicion} className="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-700">
            <div className="flex items-end gap-2">
              <CampoTexto
                etiqueta="Nombre"
                valor={hito.nombre}
                alCambiar={(nombre) => cambiar(posicion, { nombre })}
                placeholder="Mitad del camino"
              />
              <button
                type="button"
                onClick={() => alCambiar(hitos.filter((_, cual) => cual !== posicion))}
                aria-label={`Quitar ${hito.nombre === '' ? 'hito' : hito.nombre}`}
                className="min-h-12 shrink-0 rounded-2xl px-3 text-lg text-neutral-400 dark:text-neutral-500"
              >
                ×
              </button>
            </div>

            <div className="mt-2 flex items-end gap-2">
              <CampoDecimal
                etiqueta="Valor"
                unidad={unidad}
                valor={hito.valor}
                alCambiar={(valor) =>
                  cambiar(posicion, {
                    valor: valor ?? 0,
                    // Al cambiar el valor se recoloca la fecha sobre la recta del
                    // plan, que es la que casi siempre se quiere.
                    fecha: valor === null ? hito.fecha : fechaSugerida(valor),
                  })
                }
              />
              <CampoFecha
                etiqueta="Fecha"
                valor={hito.fecha}
                alCambiar={(fecha) => cambiar(posicion, { fecha })}
              />
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          alCambiar([
            ...hitos,
            { nombre: '', fecha: fechaSugerida(valorSugerido), valor: valorSugerido },
          ])
        }
        className="mt-2 min-h-12 w-full rounded-2xl bg-neutral-200 px-4 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
      >
        Agregar hito
      </button>
    </div>
  )
}
