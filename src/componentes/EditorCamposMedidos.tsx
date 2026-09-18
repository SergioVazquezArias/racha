/**
 * Los campos que una meta captura en cada medición.
 *
 * En la meta de peso son cuatro —peso, cintura, pecho y cuello— y en la de
 * inglés uno solo. Se editan aquí porque son configurables por meta: nada en la
 * app da por hecho que una meta mide kilos.
 *
 * La **clave** es el nombre interno del campo y no se enseña: es lo que une la
 * medición con la meta. Se escribe sola a partir de la etiqueta, sin acentos ni
 * espacios, porque pedirle al usuario que invente identificadores sería pedirle
 * que programe.
 *
 * Los campos ya usados por alguna medición no se pueden renombrar de clave sin
 * perder lo medido, así que al editar una meta que ya tiene mediciones solo se
 * cambia la etiqueta que se ve.
 */

import { CampoTexto } from './CamposDeFormulario'
import type { CampoMeta } from '../tipos'

interface Props {
  campos: CampoMeta[]
  alCambiar: (campos: CampoMeta[]) => void
}

export default function EditorCamposMedidos({ campos, alCambiar }: Props) {
  function cambiar(posicion: number, cambios: Partial<CampoMeta>) {
    alCambiar(campos.map((campo, cual) => (cual === posicion ? { ...campo, ...cambios } : campo)))
  }

  function agregar() {
    alCambiar([...campos, { clave: '', etiqueta: '', unidad: '' }])
  }

  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Qué se mide</p>
      <p className="mt-0.5 text-[0.7rem] text-neutral-400 dark:text-neutral-500">
        El primero es el que la meta persigue y el que dibuja la gráfica.
      </p>

      <ul className="mt-2 flex flex-col gap-2">
        {campos.map((campo, posicion) => (
          <li key={posicion} className="flex items-end gap-2">
            <CampoTexto
              etiqueta={posicion === 0 ? 'Campo principal' : 'Campo'}
              valor={campo.etiqueta}
              alCambiar={(etiqueta) =>
                cambiar(posicion, { etiqueta, clave: campo.clave === '' ? aClave(etiqueta) : campo.clave })
              }
              placeholder="Peso"
            />
            <CampoTexto
              etiqueta="Unidad"
              valor={campo.unidad}
              alCambiar={(unidad) => cambiar(posicion, { unidad })}
              placeholder="kg"
              ancho="w-24"
            />
            <button
              type="button"
              onClick={() => alCambiar(campos.filter((_, cual) => cual !== posicion))}
              aria-label={`Quitar ${campo.etiqueta === '' ? 'campo' : campo.etiqueta}`}
              className="min-h-12 shrink-0 rounded-2xl px-3 text-lg text-neutral-400 dark:text-neutral-500"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={agregar}
        className="mt-2 min-h-12 w-full rounded-2xl bg-neutral-200 px-4 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
      >
        Agregar campo
      </button>
    </div>
  )
}

/** El nombre interno de un campo: sin acentos, sin espacios, en minúsculas. */
function aClave(etiqueta: string): string {
  return etiqueta
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
