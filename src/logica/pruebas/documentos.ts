/**
 * Un documento completo de mentiras, para las pruebas del respaldo.
 *
 * Vive aparte de `fabricas.ts` —que arma piezas sueltas— porque esto arma el
 * documento entero, que es lo único que le interesa al respaldo. Como el resto
 * de `pruebas/`, nada de la app lo importa: solo los archivos `.test.ts`.
 */

import { habitoDiario, cumplido, metaDePeso } from './fabricas'
import type { Ajustes, DocumentoRacha } from '../../tipos'

/** Los ajustes de fábrica, repetidos aquí para que las pruebas no dependan de los de ejemplo. */
export const AJUSTES_DE_PRUEBA: Ajustes = {
  tema: 'sistema',
  inicioSemana: 'lunes',
  estaturaCm: 175,
  ultimoRespaldo: null,
  version: 1,
}

/** Un documento con un hábito, un día registrado y una meta. */
export function documentoDePrueba(cambios: Partial<DocumentoRacha> = {}): DocumentoRacha {
  return {
    habitos: [habitoDiario('2026-01-01')],
    registros: [cumplido('habito', '2026-01-01')],
    semanas: [],
    comodines: [],
    metas: [metaDePeso()],
    mediciones: [],
    ajustes: AJUSTES_DE_PRUEBA,
    ...cambios,
  }
}
