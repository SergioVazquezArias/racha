/**
 * Borrar todo y empezar de cero (sección 14).
 *
 * Va al final de Ajustes y apartado del resto, porque es lo único de esta
 * pantalla que destruye datos. Pide escribir «BORRAR», y antes ofrece la salida
 * buena: hacer un respaldo, que está justo arriba.
 */

import { useState } from 'react'

import ConfirmarConPalabra from './ConfirmarConPalabra'
import { empezarDeCero } from '../datos/repositorio'
import { PALABRA_PARA_BORRAR } from '../logica/confirmaciones'

export default function BorrarTodo() {
  const [confirmando, setConfirmando] = useState(false)

  function borrar() {
    empezarDeCero()
    // Igual que al importar: cambió todo de golpe, así que la app se vuelve a
    // abrir en lugar de repintar pantalla por pantalla.
    window.location.reload()
  }

  return (
    <section className="mt-12">
      <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">Empezar de cero</h2>

      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="w-full rounded-2xl border border-red-300 py-4 text-base font-medium text-red-700 dark:border-red-900 dark:text-red-400"
      >
        Borrar todos mis datos
      </button>

      <p className="mt-2 px-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        Si hay algo que quieras conservar, haz un respaldo antes: es lo único que puede devolvértelo.
      </p>

      {confirmando && (
        <ConfirmarConPalabra
          titulo="Borrar todos mis datos"
          palabra={PALABRA_PARA_BORRAR}
          textoDelBoton="Borrar para siempre"
          alCerrar={() => setConfirmando(false)}
          alConfirmar={borrar}
        >
          <p>
            Se borran tus hábitos, tus metas, tus rachas y todo el historial. No se puede deshacer y en este
            teléfono no queda copia.
          </p>
          <p>
            La app queda <strong className="font-medium">como recién instalada</strong>, con los hábitos y las
            metas de ejemplo, para que no tengas que escribirlo todo desde la nada.
          </p>
        </ConfirmarConPalabra>
      )}
    </section>
  )
}
