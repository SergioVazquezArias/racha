/**
 * Las dos metas de la sección 11, con mediciones de ejemplo.
 *
 * Los números de la meta (valores de inicio y objetivo, campos medidos, hitos,
 * frecuencia y hábitos vinculados) son los del documento. Las fechas, en
 * cambio, se calculan hacia atrás desde hoy, para que la meta ya lleve diez
 * semanas de camino recorrido y las gráficas tengan una curva que dibujar el
 * primer día. El usuario corrige fechas y medidas en la app.
 *
 * El ritmo implícito de la meta de peso se respeta: 7 kg en unas 30 semanas,
 * que son los 0.23 kg por semana del documento.
 */

import { SEMANAS_DE_EJEMPLO } from './habitos'
import { hoy, sumarDias } from '../../logica/fechas'
import type { Habito, Medicion, Meta } from '../../tipos'

/** Cuánto dura la meta de peso, en días. Del 2026-09-15 al 2027-04-14. */
const DIAS_META_PESO = 211

/** Cuánto dura la meta de inglés, en días. Del 2026-10-01 al 2027-09-15. */
const DIAS_META_INGLES = 349

/** Las dos metas. Solo se vinculan los hábitos que existan de verdad. */
export function metasDeEjemplo(habitos: Habito[]): Meta[] {
  const existe = (id: string): boolean => habitos.some((habito) => habito.id === id)
  const inicio = sumarDias(hoy(), -SEMANAS_DE_EJEMPLO * 7)

  return [
    {
      id: 'peso',
      nombre: 'Peso',
      fechaInicio: inicio,
      fechaObjetivo: sumarDias(inicio, DIAS_META_PESO),
      valorInicial: 80,
      valorObjetivo: 72,
      unidad: 'kg',
      direccion: 'bajar',
      campos: [
        { clave: 'peso', etiqueta: 'Peso', unidad: 'kg' },
        { clave: 'cintura', etiqueta: 'Cintura', unidad: 'cm' },
        { clave: 'pecho', etiqueta: 'Pecho', unidad: 'cm' },
        { clave: 'cuello', etiqueta: 'Cuello', unidad: 'cm' },
      ],
      // 82 kg menos 75.7 kg son 6.3 kg, unas 27 semanas al ritmo del plan.
      hitos: [{ nombre: 'Mitad del camino', fecha: sumarDias(inicio, 192), valor: 75.7 }],
      habitosVinculados: ['gym', 'sin-refresco', 'sin-postre'].filter(existe),
      frecuencia: 'semanal',
      estado: 'activa',
      cerradaEn: null,
    },
    {
      id: 'ingles',
      nombre: 'Inglés',
      fechaInicio: inicio,
      fechaObjetivo: sumarDias(inicio, DIAS_META_INGLES),
      // El puntaje real llega con el primer examen; este es de relleno.
      valorInicial: 50,
      valorObjetivo: 70,
      unidad: 'puntos',
      direccion: 'subir',
      campos: [{ clave: 'puntaje', etiqueta: 'Puntaje', unidad: 'puntos' }],
      // El hito cae a los 165 días del arranque: del 2026-10-01 al 2027-03-15.
      hitos: [{ nombre: 'B1 confirmado', fecha: sumarDias(inicio, 165), valor: 58 }],
      habitosVinculados: ['ingles'].filter(existe),
      frecuencia: 'mensual',
      estado: 'activa',
      cerradaEn: null,
    },
  ]
}

/** Medida semanal de ejemplo: peso, cintura, pecho y cuello. */
interface MedidaCorporal {
  peso: number
  cintura: number
  pecho: number
  cuello: number
  /** El peso nocturno viene más alto; por eso se distingue (sección 11). */
  noche: boolean
}

/** Once mediciones semanales, de la más vieja a la más reciente. */
const MEDIDAS: MedidaCorporal[] = [
  { peso: 82.0, cintura: 94.0, pecho: 104.0, cuello: 39.5, noche: false },
  { peso: 81.7, cintura: 93.8, pecho: 103.8, cuello: 39.5, noche: false },
  { peso: 82.3, cintura: 93.5, pecho: 103.7, cuello: 39.4, noche: true },
  { peso: 81.2, cintura: 93.4, pecho: 103.5, cuello: 39.4, noche: false },
  { peso: 81.0, cintura: 93.0, pecho: 103.4, cuello: 39.3, noche: false },
  { peso: 81.1, cintura: 92.9, pecho: 103.2, cuello: 39.3, noche: false },
  { peso: 81.4, cintura: 92.6, pecho: 103.0, cuello: 39.2, noche: true },
  { peso: 80.4, cintura: 92.5, pecho: 102.9, cuello: 39.2, noche: false },
  { peso: 80.1, cintura: 92.3, pecho: 102.8, cuello: 39.1, noche: false },
  { peso: 79.8, cintura: 92.1, pecho: 102.6, cuello: 39.0, noche: false },
  { peso: 79.6, cintura: 92.0, pecho: 102.5, cuello: 39.0, noche: false },
]

/** Puntajes de inglés, uno al mes. */
const PUNTAJES = [50, 53, 55]

/** Las mediciones de ambas metas. */
export function medicionesDeEjemplo(metas: Meta[]): Medicion[] {
  const mediciones: Medicion[] = []
  const peso = metas.find((meta) => meta.id === 'peso')
  const ingles = metas.find((meta) => meta.id === 'ingles')

  if (peso !== undefined) {
    MEDIDAS.forEach((medida, indice) => {
      const fecha = sumarDias(peso.fechaInicio, indice * 7)
      mediciones.push({
        id: `peso:${fecha}`,
        metaId: 'peso',
        fecha,
        momento: medida.noche ? 'noche' : 'manana',
        valores: {
          peso: medida.peso,
          cintura: medida.cintura,
          pecho: medida.pecho,
          cuello: medida.cuello,
        },
        nota: null,
      })
    })
  }

  if (ingles !== undefined) {
    PUNTAJES.forEach((puntaje, indice) => {
      const fecha = sumarDias(ingles.fechaInicio, indice * 30)
      mediciones.push({
        id: `ingles:${fecha}`,
        metaId: 'ingles',
        fecha,
        momento: 'manana',
        valores: { puntaje },
        nota: null,
      })
    })
  }

  return mediciones
}
