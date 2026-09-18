/**
 * El nombre visible de un hábito (sección 8 del documento de arquitectura).
 *
 * Regla 7: **ninguna pantalla lee `habito.nombre` directo**. Todas preguntan
 * aquí.
 *
 * Un hábito privado se ve **idéntico a los demás**: su emoji normal, elegido
 * por el usuario, y su alias en lugar del nombre. No lleva ninguna marca que lo
 * distinga. Un punto gris entre emojis de colores delataría que hay algo
 * escondido, que es lo contrario de lo que se busca.
 *
 * Esto es discreción, no seguridad. No protege nada: solo evita que un nombre
 * privado se lea de reojo si alguien más toma el teléfono.
 */

import type { Habito } from '../tipos'

/**
 * El texto que se muestra de un hábito.
 *
 * Si es privado, su alias. Si es privado y alguien olvidó escribirle alias, un
 * texto genérico: nunca se enseña el nombre real por descuido.
 *
 * `mostrarReales` es el interruptor de Ajustes, y **vale «apagado» si no se
 * pasa**. Esa omisión es la red de seguridad: quien llame a esta función sin
 * pensarlo recibe el alias, y para ver el nombre real hay que pedirlo a
 * propósito. Por eso la pantalla de Estadísticas no tiene que acordarse de
 * nada: al no pasar el interruptor, muestra siempre el alias (sección 8).
 */
export function mostrarNombre(habito: Habito, mostrarReales = false): string {
  if (!habito.privado) return habito.nombre
  if (mostrarReales) return habito.nombre
  return habito.alias ?? 'Hábito privado'
}

/**
 * El ícono que se muestra de un hábito: siempre el suyo, privado o no.
 *
 * La función existe aunque hoy solo devuelva el emoji guardado, porque es el
 * único lugar donde se decide qué ícono se ve. El día que un hábito se quede
 * sin emoji, se resuelve aquí y no en cinco pantallas.
 */
export function mostrarIcono(habito: Habito): string {
  return habito.icono
}
