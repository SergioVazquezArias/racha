/**
 * Armado del documento completo.
 *
 * Aquí se juntan las piezas: los ajustes de fábrica, el documento en blanco y
 * el documento con datos de ejemplo que se siembra la primera vez que se abre
 * la app en un teléfono nuevo.
 */

import { habitosDeEjemplo } from './habitos'
import { historialDeEjemplo } from './historial'
import { medicionesDeEjemplo, metasDeEjemplo } from './metas'
import type { Ajustes, DocumentoRacha } from '../../tipos'

/** Ajustes de fábrica de una instalación nueva. */
export const AJUSTES_INICIALES: Ajustes = {
  tema: 'sistema',
  inicioSemana: 'lunes',
  estaturaCm: 175,
  ultimoRespaldo: null,
  version: 1,
}

/** Documento en blanco: sin hábitos, sin historial, con los ajustes de fábrica. */
export function documentoVacio(): DocumentoRacha {
  return {
    habitos: [],
    registros: [],
    semanas: [],
    comodines: [],
    metas: [],
    mediciones: [],
    ajustes: AJUSTES_INICIALES,
  }
}

/** Documento con los datos de ejemplo, para que ninguna pantalla nazca vacía. */
export function documentoDeEjemplo(): DocumentoRacha {
  const habitos = habitosDeEjemplo()
  const { registros, semanas } = historialDeEjemplo(habitos)
  const metas = metasDeEjemplo(habitos)
  return {
    habitos,
    registros,
    semanas,
    comodines: [],
    metas,
    mediciones: medicionesDeEjemplo(metas),
    ajustes: AJUSTES_INICIALES,
  }
}
