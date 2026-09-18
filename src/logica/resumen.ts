/**
 * El resumen de la semana en curso que se ve en la pantalla Hoy (sección 13).
 *
 * Junta en dos números lo que llevan todos los hábitos semanales: cuántas
 * marcas se han hecho y cuántas se propusieron. Sirve para contestar de un
 * vistazo «¿cómo voy esta semana?» sin tener que sumar los renglones a mano.
 *
 * No juzga nada: la semana en curso no tiene color hasta que se cierre
 * (regla 8). Esto es una cuenta, no un veredicto.
 */

import { claveSemana } from './fechas'
import { hechosDeSemana } from './semaforo'
import type { Fecha, Habito, Registro } from '../tipos'

export interface MarcasDeLaSemana {
  hechas: number
  objetivo: number
}

/**
 * Las marcas de la semana en curso, sumadas.
 *
 * Solo cuenta hábitos positivos de cadencia semanal: son los únicos que tienen
 * un objetivo de veces por semana. Los diarios y los negativos no entran, que
 * no se miden así.
 */
export function marcasDeLaSemana(habitos: Habito[], registros: Registro[], hoy: Fecha): MarcasDeLaSemana {
  const clave = claveSemana(hoy)
  let hechas = 0
  let objetivo = 0

  for (const habito of habitos) {
    if (habito.tipo !== 'positivo' || habito.cadencia !== 'semanal') continue
    hechas += hechosDeSemana(habito, clave, registros)
    objetivo += habito.objetivo ?? 0
  }

  return { hechas, objetivo }
}
