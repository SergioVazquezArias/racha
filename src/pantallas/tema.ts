/**
 * Los colores de las gráficas, según el teléfono esté en claro o en oscuro.
 *
 * El resto de la app resuelve esto con Tailwind, escribiendo `dark:` delante de
 * cada color. Recharts no puede: los ejes, las líneas y los puntos se dibujan
 * dentro de un SVG y quieren un color escrito, no una clase. Si se dejara uno
 * fijo, los números de los ejes quedarían negros sobre fondo negro en cuanto el
 * teléfono se pusiera en modo oscuro.
 *
 * Por eso aquí se pregunta al sistema qué tema tiene puesto y se devuelven los
 * colores que tocan. Y se escucha el cambio: si el iPhone cambia solo al
 * anochecer, la gráfica se repinta sin cerrar la app.
 */

import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-color-scheme: dark)'

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

/** Si el sistema está en tema oscuro ahora mismo. */
export function useEsquemaOscuro(): boolean {
  const [oscuro, setOscuro] = useState(esOscuroAhora)

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia === undefined) return

    const consulta = window.matchMedia(CONSULTA)
    const alCambiar = (evento: MediaQueryListEvent): void => setOscuro(evento.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  return oscuro
}

/** Los colores de la gráfica, ya resueltos para el tema de ahora. */
export function useColoresDeGrafica(): ColoresDeGrafica {
  return useEsquemaOscuro() ? OSCUROS : CLAROS
}

function esOscuroAhora(): boolean {
  if (typeof window === 'undefined' || window.matchMedia === undefined) return false
  return window.matchMedia(CONSULTA).matches
}
