/**
 * La pantalla de Ajustes (sección 13).
 *
 * Se abre desde el engrane de la cabecera de Hoy y tapa toda la pantalla, con
 * un «Listo» arriba para volver. No es una quinta pestaña abajo a propósito:
 * cuatro es lo que cabe cómodo con el pulgar, y aquí se entra una vez al mes,
 * no a diario.
 *
 * Van en este orden, de lo inofensivo a lo irreversible: el tema, los nombres
 * reales, la estatura, el respaldo y, hasta el final y apartado, el botón de
 * borrar todo.
 */

import { useState } from 'react'

import BorrarTodo from '../componentes/BorrarTodo'
import { CampoDecimal } from '../componentes/CamposDeMedida'
import { Interruptor } from '../componentes/CamposDeFormulario'
import ExportarRespaldo from '../componentes/ExportarRespaldo'
import ImportarRespaldo from '../componentes/ImportarRespaldo'
import SelectorDeTema from '../componentes/SelectorDeTema'
import { guardarAjustes, obtenerAjustes } from '../datos/repositorio'
import { hoy } from '../logica/fechas'
import { avisoDeRespaldo, textoUltimoRespaldo } from '../logica/respaldo'
import { useDiscrecion } from './discrecion'
import type { Fecha } from '../tipos'

export default function Ajustes({ alCerrar }: { alCerrar: () => void }) {
  const { mostrarNombresReales, alternarNombresReales } = useDiscrecion()
  const [estatura, setEstatura] = useState<number | null>(() => obtenerAjustes().estaturaCm)
  // Se guarda aparte para que el aviso se apague en cuanto se hace el respaldo,
  // sin cerrar y volver a abrir Ajustes.
  const [ultimoRespaldo, setUltimoRespaldo] = useState<Fecha | null>(() => obtenerAjustes().ultimoRespaldo)

  /**
   * La estatura se guarda en cuanto es un número con sentido. Una persona no
   * mide 3 cm ni 900: un número imposible se queda en la pantalla sin guardarse,
   * porque torcería la grasa estimada sin avisar.
   */
  function cambiarEstatura(centimetros: number | null) {
    setEstatura(centimetros)
    if (centimetros === null || centimetros < 100 || centimetros > 250) return
    guardarAjustes({ ...obtenerAjustes(), estaturaCm: centimetros })
  }

  const aviso = avisoDeRespaldo(ultimoRespaldo, hoy())

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-100 dark:bg-stone-950">
      <div className="mx-auto max-w-md px-4 pb-16">
        <header className="borde-superior-seguro flex items-center justify-between pb-4">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Ajustes
          </h1>
          <button
            type="button"
            onClick={alCerrar}
            className="-mr-2 px-2 py-1 text-base font-medium text-neutral-500 dark:text-neutral-400"
          >
            Listo
          </button>
        </header>

        <section>
          <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">Apariencia</h2>

          <SelectorDeTema />

          <p className="mt-2 px-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Con «Sistema», la app cambia sola cuando el iPhone cambia al anochecer. Claro y oscuro mandan por
            encima de eso.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">Privacidad</h2>

          <Interruptor
            titulo="Mostrar nombres reales"
            prendido={mostrarNombresReales}
            alTocar={alternarNombresReales}
          />

          <p className="mt-2 px-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Apagado, los hábitos privados se ven con su alias. Se vuelve a apagar solo cada vez que abres
            la app. Esto es discreción, no seguridad: no cifra nada, solo evita que alguien lea un nombre
            de reojo.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">Tu cuerpo</h2>

          <div className="rounded-2xl bg-white p-4 dark:bg-neutral-900">
            <CampoDecimal
              etiqueta="Estatura"
              unidad="cm"
              valor={estatura}
              alCambiar={cambiarEstatura}
              placeholder="175"
            />
          </div>

          <p className="mt-2 px-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Se usa para estimar el porcentaje de grasa corporal a partir de la cintura y el cuello. Es lo
            único para lo que sirve, y la estimación se presenta siempre como eso: una estimación.
          </p>
        </section>

        {aviso === null ? (
          <p className="mt-8 px-1 text-xs text-neutral-500 dark:text-neutral-400">
            {textoUltimoRespaldo(ultimoRespaldo)}
          </p>
        ) : (
          <p className="mt-8 rounded-2xl bg-amber-100 p-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {aviso}
          </p>
        )}

        <ExportarRespaldo alRespaldar={() => setUltimoRespaldo(hoy())} />
        <ImportarRespaldo />
        <BorrarTodo />
      </div>
    </div>
  )
}
