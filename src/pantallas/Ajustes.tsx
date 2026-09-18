/**
 * La pantalla de Ajustes (sección 13).
 *
 * Se abre desde el engrane de la cabecera de Hoy y tapa toda la pantalla, con
 * un «Listo» arriba para volver. No es una quinta pestaña abajo a propósito:
 * cuatro es lo que cabe cómodo con el pulgar, y aquí se entra una vez al mes,
 * no a diario.
 *
 * Por ahora solo trae el interruptor de nombres reales. Las fases 06 y 09 le
 * agregan el alta de hábitos y metas, el tema, la estatura, el recordatorio de
 * medición y el respaldo.
 */

import { Interruptor } from '../componentes/CamposDeFormulario'
import { useDiscrecion } from './discrecion'

export default function Ajustes({ alCerrar }: { alCerrar: () => void }) {
  const { mostrarNombresReales, alternarNombresReales } = useDiscrecion()

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
      </div>
    </div>
  )
}

