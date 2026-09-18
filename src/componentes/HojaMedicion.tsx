/**
 * La captura de una medición (sección 13).
 *
 * Una hoja que sube desde abajo con un renglón por cada campo de la meta —en la
 * de peso son cuatro— y el selector de **mañana o noche**.
 *
 * Ese selector solo aparece en las metas que se miden en kilos. El peso de la
 * noche viene más alto y por eso importa saberlo (sección 11); el puntaje de un
 * examen de inglés no cambia con la hora del día, así que ahí preguntarlo sería
 * ruido y la medición se guarda como de mañana.
 *
 * No hace falta llenar los cuatro campos. Si un día solo te pesaste, se guarda
 * el peso y ya: un campo vacío se queda vacío, nunca se convierte en un cero.
 */

import { useState } from 'react'

import { CampoDecimal, CampoFecha } from './CamposDeMedida'
import { CampoTexto, Segmentado } from './CamposDeFormulario'
import { ajustaLaNoche } from '../logica/tendencia'
import { nuevaMedicion } from '../logica/metasAltas'
import type { Fecha, Medicion, Meta, MomentoMedicion } from '../tipos'

interface Props {
  meta: Meta
  /** La medición que se está corrigiendo, o `null` si es nueva. */
  medicion: Medicion | null
  hoy: Fecha
  alCerrar: () => void
  alGuardar: (medicion: Medicion) => void
  /** Solo al corregir una que ya existe. */
  alEliminar?: (() => void) | undefined
}

export default function HojaMedicion({ meta, medicion, hoy, alCerrar, alGuardar, alEliminar }: Props) {
  const [fecha, setFecha] = useState<Fecha>(medicion?.fecha ?? hoy)
  const [momento, setMomento] = useState<MomentoMedicion>(medicion?.momento ?? 'manana')
  const [nota, setNota] = useState(medicion?.nota ?? '')
  const [valores, setValores] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(meta.campos.map((campo) => [campo.clave, medicion?.valores[campo.clave] ?? null])),
  )

  const algoLleno = Object.values(valores).some((valor) => valor !== null)

  function guardar() {
    alGuardar(
      nuevaMedicion(
        meta.id,
        fecha,
        momento,
        valores,
        nota.trim() === '' ? null : nota.trim(),
        medicion?.id,
      ),
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" onClick={alCerrar} className="absolute inset-0 bg-black/40" />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Medición de ${meta.nombre}`}
        className="hoja-que-sube borde-inferior-seguro relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pt-5 dark:bg-neutral-900"
      >
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {medicion === null ? 'Nueva medición' : 'Corregir medición'}
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          <CampoFecha etiqueta="Día" valor={fecha} alCambiar={setFecha} />

          {ajustaLaNoche(meta) && (
            <Segmentado
              etiqueta="¿Cuándo te mediste?"
              opciones={[
                { valor: 'manana', texto: '🌅 De mañana' },
                { valor: 'noche', texto: '🌙 De noche' },
              ]}
              valor={momento}
              alElegir={setMomento}
            />
          )}

          <div className="flex flex-col gap-3">
            {meta.campos.map((campo) => (
              <CampoDecimal
                key={campo.clave}
                etiqueta={campo.etiqueta}
                unidad={campo.unidad}
                valor={valores[campo.clave] ?? null}
                placeholder="—"
                alCambiar={(valor) => setValores((antes) => ({ ...antes, [campo.clave]: valor }))}
              />
            ))}
          </div>

          <CampoTexto etiqueta="Nota (opcional)" valor={nota} alCambiar={setNota} maxLength={120} />
        </div>

        {ajustaLaNoche(meta) && momento === 'noche' && (
          <p className="mt-3 px-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Se guarda el peso tal como lo capturaste. Para calcular la tendencia se le restan 0.8 kg,
            porque de noche uno pesa más, y en la gráfica se dibuja con punto hueco.
          </p>
        )}

        <button
          type="button"
          disabled={!algoLleno}
          onClick={guardar}
          className={`mt-4 w-full rounded-2xl py-4 text-base font-medium transition-colors ${
            algoLleno
              ? 'bg-neutral-900 text-white active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-900'
              : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
          }`}
        >
          Guardar medición
        </button>

        <button
          type="button"
          onClick={alCerrar}
          className="mt-2 w-full rounded-2xl py-3 text-sm text-neutral-500 dark:text-neutral-400"
        >
          Cancelar
        </button>

        {medicion !== null && alEliminar !== undefined && (
          <button
            type="button"
            onClick={alEliminar}
            className="mb-2 w-full rounded-2xl py-3 text-sm text-red-600 dark:text-red-400"
          >
            Eliminar esta medición
          </button>
        )}
      </section>
    </div>
  )
}
