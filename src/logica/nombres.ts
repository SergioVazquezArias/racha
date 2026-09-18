/**
 * El nombre visible de un hábito (sección 8 del documento de arquitectura).
 *
 * Regla 7: **ninguna pantalla lee `habito.nombre` directo**. Todas preguntan
 * aquí. Esta función se adelanta de la fase 05 porque la pantalla Hoy es la
 * primera que muestra nombres, y así la fase 05 solo tendrá que enriquecer este
 * archivo —agregando el interruptor de "mostrar nombres reales"— en vez de ir a
 * corregir componentes que ya leían el nombre por su cuenta.
 *
 * Esto es discreción, no seguridad. No protege nada: solo evita que un nombre
 * privado se lea de reojo si alguien más toma el teléfono.
 */

import type { Habito } from '../tipos'

/** El punto que sustituye al emoji en un hábito privado: delata menos. */
export const PUNTO_DISCRETO = '●'

/**
 * El texto que se muestra de un hábito.
 *
 * Si es privado, su alias. Si es privado y alguien olvidó escribirle alias, un
 * texto genérico: nunca se enseña el nombre real por descuido.
 */
export function mostrarNombre(habito: Habito): string {
  if (!habito.privado) return habito.nombre
  return habito.alias ?? 'Hábito privado'
}

/**
 * El ícono que se muestra de un hábito.
 *
 * En los privados siempre el punto, aunque el hábito tenga un emoji guardado:
 * un emoji delata más que el texto (sección 8).
 */
export function mostrarIcono(habito: Habito): string {
  return habito.privado ? PUNTO_DISCRETO : habito.icono
}
