/**
 * Quien guarda el tema y lo pinta en la página. Envuelve toda la app desde
 * `App.tsx`.
 *
 * Al revés que el interruptor de nombres reales —que nace apagado cada vez—
 * este sí se recuerda: vive en los ajustes, y por eso pasa por el repositorio
 * (regla 5).
 *
 * Escucha además el tema del teléfono. Con la opción «Sistema» puesta, si el
 * iPhone cambia solo al anochecer la app cambia con él sin cerrarla.
 */

import { useCallback, useEffect, useState } from 'react'

import { guardarAjustes, obtenerAjustes } from '../datos/repositorio'
import { esOscuro } from '../logica/tema'
import { aplicarTema, CONSULTA, ContextoTema, sistemaEnOscuro } from './tema'
import type { Tema } from '../tipos'

export default function ProveedorTema({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => obtenerAjustes().tema)
  const [oscuroEnElSistema, setOscuroEnElSistema] = useState(sistemaEnOscuro)

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia === undefined) return

    const consulta = window.matchMedia(CONSULTA)
    const alCambiar = (evento: MediaQueryListEvent): void => setOscuroEnElSistema(evento.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  const oscuro = esOscuro(tema, oscuroEnElSistema)

  useEffect(() => {
    aplicarTema(oscuro)
  }, [oscuro])

  const cambiarTema = useCallback((nuevo: Tema) => {
    setTema(nuevo)
    guardarAjustes({ ...obtenerAjustes(), tema: nuevo })
  }, [])

  return <ContextoTema value={{ tema, oscuro, cambiarTema }}>{children}</ContextoTema>
}
