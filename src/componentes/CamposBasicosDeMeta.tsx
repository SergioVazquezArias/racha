/**
 * Los datos duros de una meta: nombre, fechas, valores, unidad y cadencia.
 *
 * Están aparte del formulario porque juntos pasaban de doscientos renglones
 * (regla 4), y porque son un bloque con sentido propio: es la meta en seco,
 * antes de los campos que se miden, los hitos y los hábitos que la sostienen.
 */

import SelectorDiaDeMedicion from './SelectorDiaDeMedicion'
import { CampoDecimal, CampoFecha } from './CamposDeMedida'
import { CampoTexto, Segmentado } from './CamposDeFormulario'
import type { CamposDeMeta } from '../logica/metasAltas'

interface Props {
  campos: CamposDeMeta
  alCambiar: (cambios: Partial<CamposDeMeta>) => void
}

export default function CamposBasicosDeMeta({ campos, alCambiar }: Props) {
  return (
    <>
      <CampoTexto
        etiqueta="Nombre"
        valor={campos.nombre}
        alCambiar={(nombre) => alCambiar({ nombre })}
        placeholder="Peso"
        maxLength={40}
      />

      <div className="flex gap-2">
        <CampoFecha
          etiqueta="Empieza"
          valor={campos.fechaInicio}
          alCambiar={(fechaInicio) => alCambiar({ fechaInicio })}
        />
        <CampoFecha
          etiqueta="Fecha objetivo"
          valor={campos.fechaObjetivo}
          alCambiar={(fechaObjetivo) => alCambiar({ fechaObjetivo })}
        />
      </div>

      <div className="flex gap-2">
        <CampoDecimal
          etiqueta="Punto de partida"
          valor={campos.valorInicial}
          alCambiar={(valorInicial) => alCambiar({ valorInicial })}
        />
        <CampoDecimal
          etiqueta="Objetivo"
          valor={campos.valorObjetivo}
          alCambiar={(valorObjetivo) => alCambiar({ valorObjetivo })}
        />
        <CampoTexto
          etiqueta="Unidad"
          valor={campos.unidad}
          alCambiar={(unidad) => alCambiar({ unidad })}
          placeholder="kg"
          ancho="w-24"
        />
      </div>

      <Segmentado
        etiqueta="La meta es"
        opciones={[
          { valor: 'bajar', texto: '↓ Bajar' },
          { valor: 'subir', texto: '↑ Subir' },
        ]}
        valor={campos.direccion}
        alElegir={(direccion) => alCambiar({ direccion })}
      />

      <Segmentado
        etiqueta="Cada cuánto se mide"
        opciones={[
          { valor: 'semanal', texto: 'Semanal' },
          { valor: 'mensual', texto: 'Mensual' },
        ]}
        valor={campos.frecuencia}
        // Al cambiar de cadencia el día se borra: un 6 que quería decir domingo
        // pasaría a querer decir «el día 6 del mes», que no es lo que se eligió.
        alElegir={(frecuencia) => alCambiar({ frecuencia, diaDeMedicion: null })}
      />

      <SelectorDiaDeMedicion
        frecuencia={campos.frecuencia}
        dia={campos.diaDeMedicion}
        alCambiar={(diaDeMedicion) => alCambiar({ diaDeMedicion })}
      />
    </>
  )
}
