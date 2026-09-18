/**
 * Exportar el respaldo (sección 14).
 *
 * Tres botones en lugar de uno, y siempre los tres. La razón está explicada en
 * `src/pantallas/archivos.ts`: dentro de la app instalada en el iPhone, la
 * descarga de toda la vida **falla en silencio**, así que ofrecer solo esa
 * sería prometer un respaldo que a lo mejor no existe.
 *
 * De los tres, solo compartir se apunta solo, porque iOS confirma si el archivo
 * se guardó o si se canceló. Los otros dos preguntan «¿ya lo guardaste?»: un
 * aviso de respaldo que se apaga sin que haya respaldo no sirve de nada.
 */

import { useState } from 'react'

import TextoDelRespaldo from './TextoDelRespaldo'
import { leerDocumento, marcarRespaldo } from '../datos/repositorio'
import { hoy } from '../logica/fechas'
import { armarRespaldo, aTexto, nombreDeArchivo } from '../logica/respaldo'
import { compartirArchivo, copiarTexto, descargarArchivo, sePuedeCompartir } from '../pantallas/archivos'

/** El respaldo ya escrito, esperando por cuál de los tres caminos sale. */
interface Preparado {
  texto: string
  nombre: string
}

export default function ExportarRespaldo({ alRespaldar }: { alRespaldar: () => void }) {
  const [preparado, setPreparado] = useState<Preparado | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [porConfirmar, setPorConfirmar] = useState(false)

  function preparar() {
    const dia = hoy()
    setPreparado({ texto: aTexto(armarRespaldo(leerDocumento(), dia)), nombre: nombreDeArchivo(dia) })
    setMensaje(null)
    setPorConfirmar(false)
  }

  /** Apunta el día del respaldo, que es lo que apaga el aviso de los 30 días. */
  function apuntar(aviso: string) {
    marcarRespaldo(hoy())
    setPorConfirmar(false)
    setMensaje(aviso)
    alRespaldar()
  }

  async function compartir() {
    if (preparado === null) return
    const entrega = await compartirArchivo(preparado.texto, preparado.nombre)

    if (entrega === 'entregado') {
      apuntar('Guardado. Queda apuntado como el respaldo de hoy.')
      return
    }

    setMensaje(
      entrega === 'cancelado'
        ? 'Se canceló: no se guardó nada y no se apuntó nada.'
        : 'Este aparato no dejó abrir la hoja de compartir. Prueba con la descarga o copiando el texto.',
    )
  }

  function descargar() {
    if (preparado === null) return
    descargarArchivo(preparado.texto, preparado.nombre)
    setMensaje(
      'Se pidió la descarga. En la app instalada en el iPhone puede no pasar nada, y sin avisar: busca el archivo antes de darlo por hecho.',
    )
    setPorConfirmar(true)
  }

  async function copiar() {
    if (preparado === null) return

    if (!(await copiarTexto(preparado.texto))) {
      setMensaje('No se pudo copiar solo. Destapa el texto de aquí abajo y cópialo a mano.')
      return
    }

    setMensaje('Copiado. Pégalo en Notas, en un correo a ti mismo, o donde lo vayas a guardar.')
    setPorConfirmar(true)
  }

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">Hacer un respaldo</h2>

      <p className="mb-3 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <strong className="font-medium">El respaldo lleva los nombres reales</strong> de tus hábitos privados,
        tal cual y sin cifrar. Guárdalo donde solo entres tú: no lo mandes a un chat compartido ni lo dejes en
        una carpeta que alguien más abra.
      </p>

      {preparado === null ? (
        <Boton principal alTocar={preparar}>
          Hacer respaldo
        </Boton>
      ) : (
        <div className="rounded-2xl bg-white p-4 dark:bg-neutral-900">
          <p className="mb-3 font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
            {preparado.nombre}
          </p>

          {sePuedeCompartir(preparado.texto, preparado.nombre) && (
            <Boton principal alTocar={compartir}>
              Compartir y guardar en Archivos
            </Boton>
          )}

          <Boton alTocar={descargar}>Descargar el archivo</Boton>
          <Boton alTocar={copiar}>Copiar el texto</Boton>

          <TextoDelRespaldo texto={preparado.texto} />
        </div>
      )}

      {mensaje !== null && (
        <p className="mt-3 px-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">{mensaje}</p>
      )}

      {porConfirmar && (
        <button
          type="button"
          onClick={() => apuntar('Apuntado: el respaldo de hoy está hecho.')}
          className="mt-2 w-full rounded-2xl border border-neutral-300 py-3 text-sm text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
        >
          Ya lo guardé, apúntalo
        </button>
      )}
    </section>
  )
}

/** Un botón del tamaño de un pulgar. El principal va en negro; los demás, con borde. */
function Boton({
  children,
  alTocar,
  principal = false,
}: {
  children: React.ReactNode
  alTocar: () => void
  principal?: boolean
}) {
  return (
    <button
      type="button"
      onClick={alTocar}
      className={`mt-2 w-full rounded-2xl py-4 text-base font-medium ${
        principal
          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
          : 'border border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200'
      }`}
    >
      {children}
    </button>
  )
}
