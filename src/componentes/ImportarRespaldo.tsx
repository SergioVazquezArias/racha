/**
 * Importar un respaldo (sección 14).
 *
 * Dos entradas, que son las parejas de los dos caminos de salida: elegir el
 * archivo guardado en Archivos, o pegar el texto que se copió.
 *
 * Antes de tocar nada se revisa —versión, forma y que esté completo— y se
 * enseña **qué trae** el archivo. Un respaldo con cero hábitos delata que se
 * eligió el archivo equivocado, y eso hay que verlo antes de reemplazar seis
 * meses de rachas, no después. La revisión está en
 * `src/logica/validarRespaldo.ts`, con sus pruebas.
 */

import { useState } from 'react'

import ConfirmarConPalabra from './ConfirmarConPalabra'
import { importarDocumento } from '../datos/repositorio'
import { PALABRA_PARA_IMPORTAR } from '../logica/confirmaciones'
import { fechaLargaEnPalabras } from '../logica/fechas'
import { resumenDelDocumento } from '../logica/respaldo'
import { revisarRespaldo } from '../logica/validarRespaldo'
import { leerArchivo } from '../pantallas/archivos'
import type { Revision } from '../logica/validarRespaldo'

export default function ImportarRespaldo() {
  const [revision, setRevision] = useState<Revision | null>(null)
  const [pegado, setPegado] = useState('')
  const [pegando, setPegando] = useState(false)

  async function alElegirArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    // Se vacía el campo para que elegir dos veces el mismo archivo funcione.
    evento.target.value = ''
    if (archivo === undefined) return
    setRevision(revisarRespaldo(await leerArchivo(archivo)))
  }

  function importar() {
    if (revision === null || !revision.ok) return
    importarDocumento(revision.documento)
    // La app se vuelve a abrir entera: cambiaron todos los datos de golpe y
    // cada pantalla tiene los suyos en memoria desde que se abrió.
    window.location.reload()
  }

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Restaurar un respaldo
      </h2>

      <label className="block w-full cursor-pointer rounded-2xl border border-neutral-200 py-4 text-center text-base font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
        Elegir el archivo
        <input type="file" accept=".json,application/json" onChange={alElegirArchivo} className="hidden" />
      </label>

      {pegando ? (
        <div className="mt-2">
          <textarea
            value={pegado}
            onChange={(evento) => setPegado(evento.target.value)}
            placeholder="Pega aquí el texto del respaldo"
            aria-label="Texto del respaldo"
            className="h-32 w-full rounded-2xl border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <button
            type="button"
            onClick={() => setRevision(revisarRespaldo(pegado))}
            className="mt-1 w-full rounded-2xl border border-neutral-200 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
          >
            Revisar el texto pegado
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPegando(true)}
          className="mt-2 w-full py-3 text-sm text-neutral-600 dark:text-neutral-300"
        >
          O pegar el texto del respaldo
        </button>
      )}

      {revision !== null && !revision.ok && (
        <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs leading-relaxed text-red-800 dark:bg-red-950 dark:text-red-200">
          {revision.problema} No se cambió nada.
        </p>
      )}

      {revision !== null && revision.ok && (
        <ConfirmarConPalabra
          titulo="Restaurar este respaldo"
          palabra={PALABRA_PARA_IMPORTAR}
          textoDelBoton="Reemplazar todo"
          alCerrar={() => setRevision(null)}
          alConfirmar={importar}
        >
          <p>
            El respaldo trae {resumenDelDocumento(revision.documento)}
            {revision.creadoEn === null ? '' : `, y es del ${fechaLargaEnPalabras(revision.creadoEn)}`}.
          </p>
          <p>
            <strong className="font-medium">Reemplaza todo lo que hay ahora</strong>: tus hábitos, tus metas y
            todo el historial de hoy se pierden y quedan los del archivo. No se puede deshacer.
          </p>
        </ConfirmarConPalabra>
      )}
    </section>
  )
}
