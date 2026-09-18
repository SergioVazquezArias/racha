/**
 * Armado del documento completo.
 *
 * Aquí se juntan las piezas: los ajustes de fábrica, el documento en blanco y
 * el documento con datos de ejemplo que se siembra la primera vez que se abre
 * la app en un teléfono nuevo.
 */

import { habitosDeEjemplo } from './habitos'
import { historialDeEjemplo } from './historial'
import { medicionesIniciales, metasIniciales } from './metas'
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

/**
 * Documento de una instalación nueva: los ocho hábitos de la sección 12 con un
 * historial de ejemplo, y las **dos metas de ejemplo** de la sección 11 con una
 * sola medición. Los hábitos nacen con historia para que ninguna pantalla se vea
 * vacía el primer día; las metas casi no, porque las medidas del cuerpo son del
 * usuario: las suyas las captura él, desde el primer domingo.
 */
export function documentoDeEjemplo(): DocumentoRacha {
  const habitos = habitosDeEjemplo()
  const { registros, semanas } = historialDeEjemplo(habitos)
  const metas = metasIniciales(habitos)
  return {
    habitos,
    registros,
    semanas,
    comodines: [],
    metas,
    mediciones: medicionesIniciales(metas),
    ajustes: AJUSTES_INICIALES,
  }
}
