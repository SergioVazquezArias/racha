/**
 * Las cuatro pestañas de abajo.
 *
 * En esta fase solo funciona **Hoy**, que es la única pantalla que se abre a
 * diario (sección 13). Las otras tres ya están en su lugar, con su ícono y su
 * nombre, y avisan en qué fase llegan: así la app se siente completa al
 * navegarla y no hay que rehacer la barra más adelante.
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
