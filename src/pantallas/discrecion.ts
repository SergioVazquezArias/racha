/**
 * El interruptor de "Mostrar nombres reales", a la mano de cualquier pantalla.
 *
 * Se reparte por contexto —y no pasándolo de pantalla en pantalla— porque
 * quien lo necesita son las filas de hábito, que están tres niveles abajo de
 * Hoy. Quien lo guarda y lo voltea es `ProveedorDiscrecion.tsx`; aquí solo
 * vive el enchufe y la forma de leerlo.
 *
 * El nombre `useDiscrecion` lleva ese prefijo en inglés porque React lo exige
 * para reconocer estas funciones y revisarlas. De ahí para adelante, español.
 */

import { createContext, use } from 'react'

export interface ValorDiscrecion {
  /** Si están a la vista los nombres reales de los hábitos privados. */
  mostrarNombresReales: boolean
  /** Voltea el interruptor. Lo usa la pantalla de Ajustes. */
  alternarNombresReales: () => void
}

/**
 * Si algún componente quedara fuera del proveedor, lo que recibe es el
 * interruptor apagado: un error de montaje esconde nombres, nunca los enseña.
 */
export const ContextoDiscrecion = createContext<ValorDiscrecion>({
  mostrarNombresReales: false,
  alternarNombresReales: () => {},
})

/** El interruptor, para quien lo necesite. */
export function useDiscrecion(): ValorDiscrecion {
  return use(ContextoDiscrecion)
}
