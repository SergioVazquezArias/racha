/**
 * El alta y la edición de una meta (sección 13).
 *
 * Una hoja que tapa la pantalla, porque una meta tiene bastante más que llenar
 * que un hábito: dos fechas, dos valores, los campos que se miden y los hitos.
 *
 * Antes de guardar se revisan las incoherencias que después no se podrían
 * dibujar —fechas al revés, un objetivo igual al punto de partida, una meta que
 * dice «bajar» y sube— y se enseñan en español, no como códigos de error. La
 * revisión vive en `validacionMetas.ts` para poder probarse sin la interfaz.
 */

import { useState } from 'react'

import CamposBasicosDeMeta from './CamposBasicosDeMeta'
import EditorCamposMedidos from './EditorCamposMedidos'
import EditorHitos from './EditorHitos'
import SelectorDeHabitos from './SelectorDeHabitos'
import { conCambios, nuevaMeta } from '../logica/metasAltas'
import { fechaPlaneadaPara } from '../logica/metas'
import { problemasDeMeta } from '../logica/validacionMetas'
import { sumarDias } from '../logica/fechas'
import type { CamposDeMeta } from '../logica/metasAltas'
import type { Fecha, Habito, Meta } from '../tipos'

interface Props {
  /** La meta que se edita, o `null` si es nueva. */
  meta: Meta | null
  habitos: Habito[]
  hoy: Fecha
  alCerrar: () => void
  alGuardar: (meta: Meta) => void
}

export default function FormularioMeta({ meta, habitos, hoy, alCerrar, alGuardar }: Props) {
  const [campos, setCampos] = useState<CamposDeMeta>(() => camposIniciales(meta, hoy))
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const problemas = problemasDeMeta(campos)

  function cambiar(cambios: Partial<CamposDeMeta>) {
    setCampos((antes) => ({ ...antes, ...cambios }))
  }

  /** La fecha en que la recta del plan pasa por un valor. Para colocar un hito. */
  function fechaSugerida(valor: number): Fecha {
    return fechaPlaneadaPara(
      {
        fechaInicio: campos.fechaInicio,
        fechaObjetivo: campos.fechaObjetivo,
        valorInicial: campos.valorInicial ?? 0,
        valorObjetivo: campos.valorObjetivo ?? 0,
      },
      valor,
    )
  }

  function guardar() {
    setIntentoGuardar(true)
    if (problemas.length > 0) return
    alGuardar(meta === null ? nuevaMeta(campos) : conCambios(meta, campos))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-100 dark:bg-stone-950">
      <div className="mx-auto max-w-md px-4 pb-16">
        <header className="borde-superior-seguro flex items-center justify-between pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {meta === null ? 'Nueva meta' : 'Editar meta'}
          </h1>
          <button
            type="button"
            onClick={alCerrar}
            className="-mr-2 px-2 py-1 text-base font-medium text-neutral-500 dark:text-neutral-400"
          >
            Cancelar
          </button>
        </header>

        <div className="flex flex-col gap-4">
          <CamposBasicosDeMeta campos={campos} alCambiar={cambiar} />

          <EditorCamposMedidos campos={campos.campos} alCambiar={(cambiados) => cambiar({ campos: cambiados })} />

          <EditorHitos
            hitos={campos.hitos}
            unidad={campos.unidad}
            valorSugerido={aMitadDelCamino(campos)}
            fechaSugerida={fechaSugerida}
            alCambiar={(hitos) => cambiar({ hitos })}
          />

          <SelectorDeHabitos
            habitos={habitos}
            elegidos={campos.habitosVinculados}
            alCambiar={(habitosVinculados) => cambiar({ habitosVinculados })}
          />
        </div>

        {intentoGuardar && problemas.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 rounded-2xl bg-red-50 p-3 dark:bg-red-950/40">
            {problemas.map((problema) => (
              <li key={problema} className="text-sm text-red-700 dark:text-red-300">
                {problema}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={guardar}
          className="mt-6 w-full rounded-2xl bg-neutral-900 py-4 text-base font-medium text-white active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-900"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}

/** Una meta nueva nace de hoy a dentro de seis meses, que es un plazo razonable. */
function camposIniciales(meta: Meta | null, hoy: Fecha): CamposDeMeta {
  if (meta !== null) return { ...meta }

  return {
    nombre: '',
    fechaInicio: hoy,
    fechaObjetivo: sumarDias(hoy, 182),
    valorInicial: null,
    valorObjetivo: null,
    unidad: '',
    direccion: 'bajar',
    campos: [],
    hitos: [],
    habitosVinculados: [],
    frecuencia: 'semanal',
    diaDeMedicion: null,
  }
}

/**
 * La mitad del camino entre el punto de partida y el objetivo.
 *
 * Es de donde arranca un hito nuevo, para que nazca en un número con sentido
 * —78.5 kg en la meta de peso— y no en un cero que hay que borrar.
 */
function aMitadDelCamino(campos: CamposDeMeta): number {
  const inicial = campos.valorInicial ?? 0
  const objetivo = campos.valorObjetivo ?? 0
  return Math.round(((inicial + objetivo) / 2) * 10) / 10
}
