/**
 * Las palabras que hay que escribir para las dos cosas que no se deshacen:
 * borrar todo e importar un respaldo encima de lo que hay.
 *
 * La idea es la misma que la de eliminar un hábito (sección 9): un «¿seguro?»
 * se contesta que sí sin leerlo, pero sacar el teclado y escribir una palabra
 * obliga a detenerse. Son dos palabras distintas a propósito, para que el dedo
 * no aprenda una sola y la teclee en automático.
 */

/** Borra todos los datos y deja la app como recién instalada. */
export const PALABRA_PARA_BORRAR = 'BORRAR'

/** Escribe un respaldo encima de todo lo que hay ahora. */
export const PALABRA_PARA_IMPORTAR = 'REEMPLAZAR'

/**
 * ¿Lo escrito coincide con la palabra?
 *
 * Perdona mayúsculas y espacios de sobra, que en el teclado de un teléfono se
 * cuelan solos —el corrector pone una mayúscula sin que se la pidan—. No
 * perdona nada más: hay que escribir la palabra.
 */
export function palabraCorrecta(escrito: string, palabra: string): boolean {
  return escrito.trim().toLowerCase() === palabra.trim().toLowerCase()
}
