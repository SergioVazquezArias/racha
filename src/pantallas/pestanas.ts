/**
 * Las cuatro pestañas de abajo.
 *
 * Desde la fase 07 las cuatro llevan a una pantalla de verdad. **Hoy** sigue
 * siendo la única que se abre a diario (sección 13); las otras tres se visitan
 * cuando hay algo que revisar, que corregir o que medir.
 */

export type Pestana = 'hoy' | 'habitos' | 'metas' | 'stats'

export interface DefinicionPestana {
  clave: Pestana
  nombre: string
  icono: string
}

export const PESTANAS: DefinicionPestana[] = [
  { clave: 'hoy', nombre: 'Hoy', icono: '📅' },
  { clave: 'habitos', nombre: 'Hábitos', icono: '📋' },
  { clave: 'metas', nombre: 'Metas', icono: '🎯' },
  { clave: 'stats', nombre: 'Stats', icono: '📊' },
]
