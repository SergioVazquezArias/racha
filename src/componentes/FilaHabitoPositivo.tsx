/**
 * Un hábito positivo en la pantalla Hoy: ir al gym, leer, estudiar inglés.
 *
 * Empieza el día **pendiente** y no cuenta hasta que el usuario lo marque
 * (sección 5). Por eso este componente gira alrededor de una palomita grande,
 * del tamaño de un pulgar, y muestra el avance de la semana y la racha.
 *
 * No se parece por dentro al de los hábitos negativos y nunca se unifican con
 * una bandera (regla 6): aquel no tiene palomita y este no tiene contador de
 * días limpios.
 */

import { eliminarRegistro, guardarRegistro } from '../datos/repositorio'
import { estaMarcado, idDeRegistro } from '../logica/dia'
import { claveSemana } from '../logica/fechas'
import { mostrarIcono, mostrarNombre } from '../logica/nombres'
import { useDiscrecion } from '../pantallas/discrecion'
import { rachaDe } from '../logica/rachas'
import { hechosDeSemana } from '../logica/semaforo'
import { textoDeRacha, textoDeSemana } from '../logica/textos'
import type { DatosDeRacha } from '../logica/rachas'
import type { Fecha, Habito } from '../tipos'

interface Props {
  habito: Habito
  datos: DatosDeRacha
  hoy: Fecha
  /** Se llama después de marcar o desmarcar, para volver a leer los datos. */
  alCambiar: () => void
}

export default function FilaHabitoPositivo({ habito, datos, hoy, alCambiar }: Props) {
  const { mostrarNombresReales } = useDiscrecion()
  const idDeHoy = idDeRegistro(habito.id, hoy)
  const marcado = estaMarcado(habito.id, datos.registros, hoy)

  /** Marcar y desmarcar son el mismo botón: equivocarse no cuesta nada. */
  function alternar() {
    if (marcado) {
      // Desmarcar quita el registro; no lo guarda como fallado. Un día sin
      // marcar se cierra sin cumplir solo, a medianoche.
      eliminarRegistro(idDeHoy)
    } else {
      guardarRegistro({
        id: idDeHoy,
        habitoId: habito.id,
        fecha: hoy,
        estado: 'cumplido',
        valor: null,
        hora: null,
        contexto: null,
        nota: null,
      })
    }
    alCambiar()
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
        marcado
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
          : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
      }`}
    >
      <span aria-hidden="true" className="text-2xl">
        {mostrarIcono(habito)}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-medium ${
            marcado
              ? 'text-emerald-900 line-through decoration-emerald-400 dark:text-emerald-100'
              : 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          {mostrarNombre(habito, mostrarNombresReales)}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{detalle(habito, datos, hoy)}</p>
      </div>

      <button
        type="button"
        onClick={alternar}
        aria-pressed={marcado}
        aria-label={`${marcado ? 'Desmarcar' : 'Marcar'} ${mostrarNombre(habito, mostrarNombresReales)}`}
        className={`flex size-13 shrink-0 items-center justify-center rounded-full border-2 transition-colors active:scale-95 ${
          marcado
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-neutral-300 text-transparent dark:border-neutral-600'
        }`}
      >
        <Palomita />
      </button>
    </li>
  )
}

/**
 * El renglón chico de abajo.
 *
 * Con cadencia semanal muestra el avance de la semana y la racha en semanas;
 * con cadencia diaria, solo la racha en días. Los dos números salen de la
 * lógica de la fase 03: aquí no se calcula nada.
 */
function detalle(habito: Habito, datos: DatosDeRacha, hoy: Fecha): string {
  const { actual } = rachaDe(habito, datos, hoy)
  if (habito.cadencia !== 'semanal') return textoDeRacha(habito, actual)

  const hechos = hechosDeSemana(habito, claveSemana(hoy), datos.registros)
  return `${textoDeSemana(hechos, habito.objetivo ?? 0)} · ${textoDeRacha(habito, actual)}`
}

function Palomita() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-6" aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
