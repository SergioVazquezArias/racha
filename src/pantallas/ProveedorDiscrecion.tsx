/**
 * Quien guarda el interruptor de "Mostrar nombres reales" mientras la app está
 * abierta. Envuelve toda la app desde `App.tsx`.
 *
 * Lo guarda con `useState`, o sea en la memoria del navegador y nada más: al
 * cerrar la app se va, y el próximo arranque vuelve a nacer apagado (sección
 * 8). Aquí no hay repositorio ni `localStorage`, y esa ausencia es la
 * funcionalidad: nadie tiene que acordarse de apagarlo antes de cerrar.
 *
 * La lógica de cómo arranca y cómo se voltea está aparte, en
 * `src/logica/discrecion.ts`, para poder probarla con Vitest (regla 10).
 */

import { useCallback, useState } from 'react'

import { alArrancar, alternar } from '../logica/discrecion'
import { ContextoDiscrecion } from './discrecion'

export default function ProveedorDiscrecion({ children }: { children: React.ReactNode }) {
  const [discrecion, setDiscrecion] = useState(alArrancar)
  const alternarNombresReales = useCallback(() => setDiscrecion(alternar), [])

  return (
    <ContextoDiscrecion
      value={{ mostrarNombresReales: discrecion.mostrarNombresReales, alternarNombresReales }}
    >
      {children}
    </ContextoDiscrecion>
  )
}
