/**
 * El alta y la edición de un hábito (sección 9).
 *
 * Sube desde abajo, como la hoja de recaídas, y tapa la pantalla hasta que se
 * guarda o se cancela.
 *
 * Dos cosas que hace distinto a propósito:
 *
 * - **El tipo y la cadencia se eligen al crear y después se ven apagados.**
 *   Cambiarlos dejaría un historial que no significa nada: los días cumplidos
 *   de un positivo no son las recaídas de un negativo. Para eso se archiva y se
 *   crea otro.
 * - **Aquí sí se escribe y se lee el nombre real**, aunque el hábito sea
 *   privado. Es el único lugar donde tiene que ser así: es donde se escribe.
 *   El alias de al lado es lo que verá el resto de la app (sección 8).
 *
 * Quién decide qué se puede guardar es `validacion.ts`, y quién arma el hábito
 * es `altas.ts`. Este archivo solo dibuja y pregunta.
 */

import { useState } from 'react'

import { conCambios, nuevoHabito } from '../logica/altas'
import { mostrarNombre } from '../logica/nombres'
import { problemasDe } from '../logica/validacion'
import { CampoNumero, CampoTexto, Interruptor, Segmentado } from './CamposDeFormulario'
import EditorContextos from './EditorContextos'
import type { CamposDeHabito } from '../logica/altas'
import type { Fecha, Habito } from '../tipos'

interface Props {
  /** El hábito que se edita, o `null` si es un alta. */
  habito: Habito | null
  existentes: Habito[]
  hoy: Fecha
  alCerrar: () => void
  alGuardar: (habito: Habito) => void
}

/** Un hábito nuevo empieza como positivo semanal de 5 y 4, que es lo común. */
function camposIniciales(habito: Habito | null): CamposDeHabito {
  if (habito === null) {
    return {
      nombre: '',
      icono: '✅',
      privado: false,
      alias: null,
      tipo: 'positivo',
      cadencia: 'semanal',
      objetivo: 5,
      minimo: 4,
      permiteComodin: true,
      contextos: [],
    }
  }

  const { nombre, icono, privado, alias, tipo, cadencia, objetivo, minimo, permiteComodin, contextos } = habito
  return { nombre, icono, privado, alias, tipo, cadencia, objetivo, minimo, permiteComodin, contextos }
}

export default function FormularioHabito({ habito, existentes, hoy, alCerrar, alGuardar }: Props) {
  const [campos, setCampos] = useState<CamposDeHabito>(() => camposIniciales(habito))
  const [problemas, setProblemas] = useState<string[]>([])

  function cambiar(cambios: Partial<CamposDeHabito>) {
    setCampos((anteriores) => ({ ...anteriores, ...cambios }))
  }

  function guardar() {
    const encontrados = problemasDe(campos)
    setProblemas(encontrados)
    if (encontrados.length > 0) return

    alGuardar(habito === null ? nuevoHabito(campos, existentes, hoy) : conCambios(habito, campos))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Cerrar sin guardar" onClick={alCerrar} className="absolute inset-0 bg-black/40" />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={habito === null ? 'Nuevo hábito' : `Editar ${mostrarNombre(habito, true)}`}
        className="hoja-que-sube borde-inferior-seguro relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-stone-100 px-5 pt-4 dark:bg-stone-950"
      >
        <header className="flex items-center justify-between">
          <button type="button" onClick={alCerrar} className="-ml-2 px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400">
            Cancelar
          </button>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {habito === null ? 'Nuevo hábito' : 'Editar hábito'}
          </p>
          <span className="w-16" />
        </header>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <CampoTexto etiqueta="Emoji" valor={campos.icono} alCambiar={(icono) => cambiar({ icono })} maxLength={4} ancho="w-20" />
            <CampoTexto
              etiqueta="Nombre"
              valor={campos.nombre}
              alCambiar={(nombre) => cambiar({ nombre })}
              placeholder="Ir al gym"
              ancho="flex-1"
            />
          </div>

          <Segmentado
            etiqueta="Tipo"
            valor={campos.tipo}
            fijo={habito !== null}
            alElegir={(tipo) => cambiar({ tipo, cadencia: tipo === 'negativo' ? 'diaria' : campos.cadencia })}
            opciones={[
              { valor: 'positivo', texto: 'Positivo · lo hago' },
              { valor: 'negativo', texto: 'Negativo · lo evito' },
            ]}
          />

          {campos.tipo === 'positivo' && (
            <Segmentado
              etiqueta="Cadencia"
              valor={campos.cadencia}
              fijo={habito !== null}
              alElegir={(cadencia) =>
                cambiar({
                  cadencia,
                  objetivo: cadencia === 'semanal' ? (campos.objetivo ?? 5) : null,
                  minimo: cadencia === 'semanal' ? (campos.minimo ?? 4) : null,
                })
              }
              opciones={[
                { valor: 'diaria', texto: 'Todos los días' },
                { valor: 'semanal', texto: 'Veces por semana' },
              ]}
            />
          )}

          {campos.tipo === 'positivo' && campos.cadencia === 'semanal' && (
            <div className="flex gap-2">
              <CampoNumero etiqueta="Objetivo" valor={campos.objetivo} alCambiar={(objetivo) => cambiar({ objetivo })} />
              <CampoNumero etiqueta="Mínimo" valor={campos.minimo} alCambiar={(minimo) => cambiar({ minimo })} />
            </div>
          )}

          {campos.tipo === 'negativo' && (
            <EditorContextos contextos={campos.contextos} alCambiar={(contextos) => cambiar({ contextos })} />
          )}

          <div>
            <Interruptor titulo="Privado" prendido={campos.privado} alTocar={() => cambiar({ privado: !campos.privado })} />
            {campos.privado && (
              <div className="mt-2">
                <CampoTexto
                  etiqueta="Alias · es lo que se ve en pantalla"
                  valor={campos.alias ?? ''}
                  alCambiar={(alias) => cambiar({ alias })}
                  placeholder="Rutina"
                />
              </div>
            )}
          </div>

          {problemas.length > 0 && (
            <ul className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {problemas.map((problema) => (
                <li key={problema}>{problema}</li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={guardar}
            className="mb-2 w-full rounded-2xl bg-neutral-900 py-4 text-base font-medium text-white active:scale-[0.99] dark:bg-neutral-100 dark:text-neutral-900"
          >
            Guardar
          </button>
        </div>
      </section>
    </div>
  )
}
