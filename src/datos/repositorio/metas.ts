/**
 * Metas, mediciones y ajustes.
 */

import { colocar, leerDocumento, modificar } from './documento'
import type { Ajustes, Fecha, Medicion, Meta } from '../../tipos'

export function obtenerMetas(): Meta[] {
  return leerDocumento().metas
}

export function guardarMeta(meta: Meta): void {
  modificar((documento) => colocar(documento.metas, meta))
}

/** Eliminar una meta borra también sus mediciones (sección 9). */
export function eliminarMeta(metaId: string): void {
  modificar((documento) => {
    documento.metas = documento.metas.filter((meta) => meta.id !== metaId)
    documento.mediciones = documento.mediciones.filter((m) => m.metaId !== metaId)
  })
}

export function obtenerMediciones(): Medicion[] {
  return leerDocumento().mediciones
}

export function obtenerMedicionesDe(metaId: string): Medicion[] {
  return obtenerMediciones().filter((medicion) => medicion.metaId === metaId)
}

export function guardarMedicion(medicion: Medicion): void {
  modificar((documento) => colocar(documento.mediciones, medicion))
}

/** Borra una medición suelta: la que se capturó con el dedo torcido. */
export function eliminarMedicion(medicionId: string): void {
  modificar((documento) => {
    documento.mediciones = documento.mediciones.filter((medicion) => medicion.id !== medicionId)
  })
}

export function obtenerAjustes(): Ajustes {
  return leerDocumento().ajustes
}

export function guardarAjustes(ajustes: Ajustes): void {
  modificar((documento) => {
    documento.ajustes = ajustes
  })
}

/**
 * Apunta el día en que se hizo el último respaldo (sección 14).
 *
 * Solo se escribe cuando el respaldo **salió de verdad**: al compartirlo y que
 * iOS confirme que se guardó, al descargarlo o al copiarlo. Si se abre la hoja
 * de compartir y se cancela, aquí no se toca nada, porque el aviso de los 30
 * días sirve de poco si se apaga con una intención.
 */
export function marcarRespaldo(fecha: Fecha): void {
  modificar((documento) => {
    documento.ajustes = { ...documento.ajustes, ultimoRespaldo: fecha }
  })
}
