/**
 * Armado del documento completo.
 *
 * Aquí se juntan las piezas: los ajustes de fábrica, el documento en blanco, el
 * documento con datos de ejemplo que se siembra la primera vez que se abre la
 * app en un teléfono nuevo, y el documento en limpio que deja el botón de
 * borrar todo.
 */

import { hoy } from '../../logica/fechas'
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

/**
 * Documento de un arranque en limpio: el que deja el botón de «borrar todo»
 * (sección 14).
 *
 * Los mismos ocho hábitos y las mismas dos metas, para no tener que escribirlos
 * desde la nada, pero **sin una sola línea de historial**: ni días registrados,
 * ni semanas cerradas, ni comodines, ni mediciones. Las rachas empiezan en cero
 * de verdad.
 *
 * Lo que hace falta explicar es el `creadoEn`. Los hábitos de ejemplo nacen
 * setenta y siete días atrás, porque ahí arranca el historial de ejemplo. Si se
 * vaciaran las listas y se les dejara esa fecha, la app, al abrirse, cerraría
 * once semanas pasadas **y las once saldrían rojas**: un hábito sin un solo día
 * marcado no cumple ningún objetivo. Serían justo las semanas inventadas que se
 * quería evitar. Por eso todos nacen hoy.
 *
 * Y naciendo hoy, la semana en curso no se juzga —un hábito que nace a media
 * semana no recibe veredicto de esa semana (sección 9)—, así que la primera
 * semana calificada es la que empieza el lunes que viene.
 */
export function documentoEnLimpio(): DocumentoRacha {
  const habitos = habitosDeEjemplo().map((habito) => ({ ...habito, creadoEn: hoy() }))

  return {
    habitos,
    registros: [],
    semanas: [],
    comodines: [],
    metas: metasIniciales(habitos),
    mediciones: [],
    ajustes: AJUSTES_INICIALES,
  }
}
