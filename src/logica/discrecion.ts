/**
 * El interruptor de "Mostrar nombres reales" (sección 8).
 *
 * Vive **solo en memoria**. Este archivo no importa el repositorio, no toca
 * `localStorage` y no entra al documento JSON que se guarda en el teléfono.
 * Esa ausencia es la funcionalidad: cada arranque de la app empieza apagado,
 * sin excepción, y nadie tiene que acordarse de apagarlo antes de cerrarla.
 *
 * Es lógica pura y separada de React a propósito, para que se pueda probar con
 * Vitest (regla 10). Quien la conecta a la pantalla es
 * `src/pantallas/discrecion.tsx`.
 */

/** Lo único que hay que saber: si los nombres reales están a la vista. */
export interface Discrecion {
  mostrarNombresReales: boolean
}

/**
 * Cómo arranca la app. Siempre apagado.
 *
 * Es una función y no una constante suelta a propósito: devuelve un objeto
 * nuevo cada vez, así nadie puede modificar «el arranque» desde fuera y dejarlo
 * prendido para la próxima.
 */
export function alArrancar(): Discrecion {
  return { mostrarNombresReales: false }
}

/** Voltea el interruptor. Devuelve un estado nuevo; no guarda nada en ningún lado. */
export function alternar(discrecion: Discrecion): Discrecion {
  return { mostrarNombresReales: !discrecion.mostrarNombresReales }
}
