/**
 * El tema de la app —claro, oscuro o como el sistema— a la mano de cualquier
 * pantalla, y los colores de las gráficas que salen de él.
 *
 * Quien lo guarda y lo aplica es `ProveedorTema.tsx`; aquí vive el enchufe, la
 * forma de leerlo y la traducción a colores. La decisión de si toca oscuro está
 * aparte, en `src/logica/tema.ts`, para poder probarla (regla 10).
 *
 * El resto de la app resuelve el tema con Tailwind, escribiendo `dark:` delante
 * de cada color. Recharts no puede: los ejes, las líneas y los puntos se
 * dibujan dentro de un SVG y quieren un color escrito, no una clase. Si se
 * dejara uno fijo, los números de los ejes quedarían negros sobre fondo negro
 * en cuanto la app se pusiera en oscuro.
 */

import { createContext, use } from 'react'

import type { Tema } from '../tipos'

/** Lo que el sistema contesta cuando se le pregunta si está en oscuro. */
export const CONSULTA = '(prefers-color-scheme: dark)'

export interface ValorTema {
  /** Lo elegido en Ajustes: claro, oscuro o sistema. */
  tema: Tema
  /** Si la app se está dibujando en oscuro ahora mismo. */
  oscuro: boolean
  /** Cambia el tema y lo guarda. Lo usa la pantalla de Ajustes. */
  cambiarTema: (tema: Tema) => void
}

/** Si algún componente quedara fuera del proveedor, ve la app en claro. */
export const ContextoTema = createContext<ValorTema>({
  tema: 'sistema',
  oscuro: false,
  cambiarTema: () => {},
})

/** El tema, para quien lo necesite. */
export function useTema(): ValorTema {
  return use(ContextoTema)
}

/** ¿El teléfono está en oscuro ahora mismo? */
export function sistemaEnOscuro(): boolean {
  if (typeof window === 'undefined' || window.matchMedia === undefined) return false
  return window.matchMedia(CONSULTA).matches
}

/**
 * Pinta el tema en la página.
 *
 * Escribe `data-tema` en la etiqueta de más afuera del documento, y de ahí
 * cuelga todo: los estilos de `index.css` leen ese atributo para decidir el
 * fondo, y Tailwind lo lee para resolver los `dark:` repartidos por la app.
 * Una sola palabra escrita aquí repinta las cuatro pantallas.
 */
export function aplicarTema(oscuro: boolean): void {
  document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro'
}

export interface ColoresDeGrafica {
  /** Los números de los ejes. */
  texto: string
  /** Las rayas horizontales del fondo. */
  reja: string
  /** Tu curva real. */
  real: string
  /** La recta punteada del objetivo. */
  plan: string
  /** Los marcadores de los hitos. */
  hito: string
  /** El fondo de la tarjeta: lo que rellena los puntos huecos de la noche. */
  fondo: string
}

const CLAROS: ColoresDeGrafica = {
  texto: '#525252',
  reja: '#e5e5e5',
  real: '#059669',
  plan: '#a3a3a3',
  hito: '#d97706',
  fondo: '#ffffff',
}

const OSCUROS: ColoresDeGrafica = {
  texto: '#a3a3a3',
  reja: '#404040',
  real: '#34d399',
  plan: '#737373',
  hito: '#fbbf24',
  fondo: '#171717',
}

/** Los colores de la gráfica, ya resueltos para el tema de ahora. */
export function useColoresDeGrafica(): ColoresDeGrafica {
  return useTema().oscuro ? OSCUROS : CLAROS
}
