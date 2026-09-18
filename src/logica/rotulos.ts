/**
 * Dónde se escribe cada rótulo de la gráfica para que no se corte.
 *
 * Son dos decisiones chicas y puramente de colocación, pero viven aquí y no
 * dentro del componente por la misma razón de siempre: así se pueden probar sin
 * dibujar nada (regla 10). Y falta poco para que se rompan solas — basta que un
 * hito se mueva de fecha o que una meta termine en una palabra más larga.
 */

import type { EjeDeTiempo } from './serieMeta'

/**
 * De dónde se agarra la fecha de una marca del eje de abajo.
 *
 * Recharts centra cada rótulo sobre su marca, y la última marca está pegada al
 * borde derecho: la mitad del texto se sale de la pantalla y «14 abr» se lee
 * «14 abı». En un teléfono no sobra ancho para regalarlo en márgenes, así que
 * la fecha de la orilla derecha **termina** en su marca y la de la izquierda
 * **empieza** en la suya. Las de en medio siguen centradas.
 */
export function anclaDeLaFecha(dia: number, tiempo: EjeDeTiempo): 'start' | 'middle' | 'end' {
  if (dia >= tiempo.maximo) return 'end'
  if (dia <= tiempo.minimo) return 'start'
  return 'middle'
}

/**
 * De qué lado del marcador se escribe el nombre de un hito.
 *
 * Encima, salvo cuando el hito cae pegado a un borde: ahí el nombre se saldría
 * de la gráfica. Pegado a la derecha se escribe a la izquierda del punto, y al
 * revés. El hito de peso cae al 90 % del camino, así que este caso no es raro:
 * es el que hay.
 */
export function ladoDelHito(dia: number, tiempo: EjeDeTiempo): 'top' | 'left' | 'right' {
  const ancho = tiempo.maximo - tiempo.minimo
  if (ancho <= 0) return 'top'

  const avance = (dia - tiempo.minimo) / ancho
  if (avance > 0.75) return 'left'
  if (avance < 0.25) return 'right'
  return 'top'
}
