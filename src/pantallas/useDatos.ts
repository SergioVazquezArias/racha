/**
 * Los datos que la pantalla Hoy necesita, y la forma de volver a leerlos.
 *
 * Todo pasa por el repositorio (regla 5): aquí no se toca `localStorage` ni de
 * lejos. Después de marcar una palomita o registrar una recaída se llama a
 * `recargar()`, que vuelve a leer el documento y redibuja la pantalla con los
 * contadores y las rachas al día.
 *
 * El nombre empieza con `use` y no con `usar`, que sería lo natural en español
 * (regla 1), porque React **exige** ese prefijo: es cómo reconoce a estas
 * funciones y las revisa. Es requisito del framework, no una elección de
 * nombre. De ahí para adelante todo vuelve a estar en español.
 */

import { useCallback, useState } from 'react'

import { obtenerComodines, obtenerHabitos, obtenerRegistros, obtenerSemanas } from '../datos/repositorio'
import type { DatosDeRacha } from '../logica/rachas'
import type { Habito } from '../tipos'

/**
 * Los hábitos más todo lo que hace falta para calcular sus rachas.
 *
 * Extiende `DatosDeRacha` a propósito: así este mismo objeto se le pasa tal cual
 * a `rachaDe()` y ninguna pantalla tiene que armar la bolsa a mano.
 *
 * Los archivados vienen aparte y no mezclados: la pantalla Hoy no los enseña
 * nunca, y la de Hábitos los enseña abajo, en su propio bloque (sección 9).
 */
export interface DatosDeHoy extends DatosDeRacha {
  habitos: Habito[]
  archivados: Habito[]
}

function leerDatos(): DatosDeHoy {
  const todos = obtenerHabitos()

  return {
    habitos: todos.filter((habito) => habito.archivadoEn === null),
    archivados: todos.filter((habito) => habito.archivadoEn !== null),
    registros: obtenerRegistros(),
    semanas: obtenerSemanas(),
    comodines: obtenerComodines(),
  }
}

export function useDatos(): { datos: DatosDeHoy; recargar: () => void } {
  const [datos, setDatos] = useState<DatosDeHoy>(leerDatos)
  const recargar = useCallback(() => setDatos(leerDatos()), [])
  return { datos, recargar }
}
