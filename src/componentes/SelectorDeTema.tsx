/**
 * El selector de tema de Ajustes: claro, oscuro o como el sistema.
 *
 * «Sistema» es lo de fábrica, y para un teléfono que cambia solo al anochecer
 * suele ser lo mejor. Las otras dos están porque el automático no siempre
 * acierta: leer de noche en claro deslumbra, y en oscuro a pleno sol no se ve.
 */

import { Segmentado } from './CamposDeFormulario'
import { OPCIONES_DE_TEMA } from '../logica/tema'
import { useTema } from '../pantallas/tema'

export default function SelectorDeTema() {
  const { tema, cambiarTema } = useTema()

  return (
    <div className="rounded-2xl bg-white p-4 dark:bg-neutral-900">
      <Segmentado etiqueta="Tema" opciones={OPCIONES_DE_TEMA} valor={tema} alElegir={cambiarTema} />
    </div>
  )
}
