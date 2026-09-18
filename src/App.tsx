/**
 * El armazón de la app: la pantalla de la pestaña activa y la barra de abajo.
 *
 * No hay enrutador ni dirección en la barra del navegador, a propósito: son
 * cuatro pantallas dentro de una app instalada en la pantalla de inicio, y una
 * dependencia más no se paga sola. La pestaña activa vive en memoria; al cerrar
 * y volver a abrir, la app arranca en Hoy, que es lo que se quiere ver.
 */

import { useState } from 'react'

import BarraPestanas from './componentes/BarraPestanas'
import ProveedorDiscrecion from './pantallas/ProveedorDiscrecion'
import ProveedorTema from './pantallas/ProveedorTema'
import Estadisticas from './pantallas/Estadisticas'
import Habitos from './pantallas/Habitos'
import Hoy from './pantallas/Hoy'
import Metas from './pantallas/Metas'
import type { Pestana } from './pantallas/pestanas'

export default function App() {
  const [pestana, setPestana] = useState<Pestana>('hoy')

  // Los dos envuelven toda la app porque quien los necesita está abajo del
  // todo: el interruptor de nombres reales lo leen las filas de hábito, tres
  // niveles bajo Hoy, y el tema lo lee cada gráfica. El primero vive en memoria
  // y nace apagado en cada arranque (sección 8); el segundo se recuerda, porque
  // vive en los ajustes.
  return (
    <ProveedorTema>
      <ProveedorDiscrecion>
        <main className="min-h-dvh">{pantallaDe(pestana)}</main>
        <BarraPestanas activa={pestana} alCambiar={setPestana} />
      </ProveedorDiscrecion>
    </ProveedorTema>
  )
}

function pantallaDe(pestana: Pestana) {
  if (pestana === 'hoy') return <Hoy />

  if (pestana === 'habitos') return <Habitos />

  if (pestana === 'metas') return <Metas />

  return <Estadisticas />
}
