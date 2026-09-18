/**
 * Los datos que la pantalla de Metas necesita, y la forma de volver a leerlos.
 *
 * Es el hermano de `useDatos.ts`, que hace lo mismo para los hábitos. Trae
 * también los hábitos y su historial, porque el detalle de una meta enseña las
 * semanas de los hábitos vinculados: sin ellos no se podrían dibujar.
 *
 * Todo pasa por el repositorio (regla 5). Después de guardar una medición o de
 * cerrar una meta se llama a `recargar()` y la pantalla se redibuja con los
 * números al día.
 */

import { useCallback, useState } from 'react'

import {
  obtenerAjustes,
  obtenerComodines,
  obtenerHabitos,
  obtenerMediciones,
  obtenerMetas,
  obtenerRegistros,
  obtenerSemanas,
} from '../datos/repositorio'
import type { DatosDeRacha } from '../logica/rachas'
import type { Ajustes, Habito, Medicion, Meta } from '../tipos'

export interface DatosDeMetas extends DatosDeRacha {
  metas: Meta[]
  mediciones: Medicion[]
  /** Solo los activos: a una meta no se le vincula un hábito archivado. */
  habitos: Habito[]
  ajustes: Ajustes
}

function leerDatos(): DatosDeMetas {
  return {
    metas: obtenerMetas(),
    mediciones: obtenerMediciones(),
    habitos: obtenerHabitos().filter((habito) => habito.archivadoEn === null),
    ajustes: obtenerAjustes(),
    registros: obtenerRegistros(),
    semanas: obtenerSemanas(),
    comodines: obtenerComodines(),
  }
}

export function useDatosMetas(): { datos: DatosDeMetas; recargar: () => void } {
  const [datos, setDatos] = useState<DatosDeMetas>(leerDatos)
  const recargar = useCallback(() => setDatos(leerDatos()), [])
  return { datos, recargar }
}

/** Las mediciones de una meta, de la más reciente a la más vieja. */
export function medicionesDe(datos: DatosDeMetas, metaId: string): Medicion[] {
  return datos.mediciones
    .filter((medicion) => medicion.metaId === metaId)
    .sort((una, otra) => otra.fecha.localeCompare(una.fecha))
}

/** Los hábitos vinculados a una meta que todavía existen y están activos. */
export function habitosDe(datos: DatosDeMetas, meta: Meta): Habito[] {
  return datos.habitos.filter((habito) => meta.habitosVinculados.includes(habito.id))
}
