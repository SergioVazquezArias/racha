/**
 * Qué tema se ve, según lo que eligió el usuario y cómo esté el teléfono.
 *
 * Son tres opciones —claro, oscuro y como el sistema— y nacen en «sistema»
 * (sección 4). La decisión es una sola línea, pero vive aquí y no dentro de un
 * componente para poder probarla (regla 10): equivocarse aquí deja la app en
 * blanco sobre blanco.
 */

import type { Tema } from '../tipos'

/** Las tres opciones del selector de Ajustes, en el orden en que se ven. */
export const OPCIONES_DE_TEMA: { valor: Tema; texto: string }[] = [
  { valor: 'claro', texto: 'Claro' },
  { valor: 'oscuro', texto: 'Oscuro' },
  { valor: 'sistema', texto: 'Sistema' },
]

/**
 * ¿La app se dibuja en oscuro ahora mismo?
 *
 * `sistemaOscuro` es lo que contesta el teléfono. Solo se le hace caso cuando
 * la elección es «sistema»: elegir claro u oscuro manda por encima del iPhone,
 * incluso si cambia solo al anochecer.
 */
export function esOscuro(tema: Tema, sistemaOscuro: boolean): boolean {
  if (tema === 'claro') return false
  if (tema === 'oscuro') return true
  return sistemaOscuro
}
