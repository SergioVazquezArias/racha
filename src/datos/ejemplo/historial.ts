/**
 * Diez semanas de historial de ejemplo, más la semana en curso a medias.
 *
 * Los números están escritos a mano, no sorteados al azar, para que la app se
 * vea siempre igual y para que haya de todo: semanas verdes, ámbar y alguna
 * roja, y una tendencia de recaídas que vaya a la baja.
 *
 * Las dos formas de generar historial son distintas a propósito (sección 5):
 * un hábito positivo guarda los días que se cumplieron; un hábito negativo no
 * guarda nada salvo las recaídas.
 */

import { SEMANAS_DE_EJEMPLO } from './habitos'
import { claveSemana, diasDeLaSemana, hoy, lunesDeLaSemana, sumarDias } from '../../logica/fechas'
import type { ColorSemana, Habito, Registro, Semana } from '../../tipos'

export interface Historial {
  registros: Registro[]
  semanas: Semana[]
}

/** Días cumplidos en cada una de las diez semanas cerradas, de la más vieja a la más nueva. */
const CUMPLIMIENTO: Record<string, number[]> = {
  gym: [5, 4, 5, 5, 3, 4, 5, 5, 4, 5],
  leer: [6, 6, 5, 6, 6, 4, 6, 5, 6, 6],
  ingles: [5, 6, 6, 4, 6, 6, 5, 6, 6, 5],
}

/** En qué orden se van llenando los días, de lunes (0) a domingo (6). */
const ORDEN_DE_DIAS: Record<string, number[]> = {
  gym: [0, 1, 3, 4, 5, 2, 6],
  leer: [0, 1, 2, 3, 4, 6, 5],
  ingles: [0, 2, 1, 3, 4, 5, 6],
}

/** Recaídas de cada semana. Todas van a la baja: el historial cuenta una mejora. */
const RECAIDAS: Record<string, number[]> = {
  'sin-pantallas': [2, 1, 2, 1, 1, 0, 1, 0, 1, 0],
  'sin-refresco': [3, 2, 2, 3, 1, 2, 1, 1, 2, 1],
  'sin-postre': [1, 1, 0, 1, 0, 1, 0, 0, 1, 0],
  'privado-1': [2, 1, 1, 1, 0, 1, 1, 0, 0, 1],
  'privado-2': [1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
}

/**
 * En qué días caen las recaídas. El fin de semana pesa, pero no todas caen
 * ahí: la tercera variante arranca entre semana. Así Estadísticas tiene un
 * patrón real que contar —del estilo "la mayoría son viernes o sábado"— y no
 * un dato tan redondo que se note inventado.
 */
const ORDEN_DE_RECAIDAS = [
  [4, 5, 3, 6, 2, 0, 1],
  [5, 4, 6, 3, 1, 2, 0],
  [2, 4, 5, 0, 3, 1, 6],
]

/** Horas de recaída, para que el patrón por hora del día tenga forma. */
const HORAS = ['21:40', '19:15', '23:05', '18:30', '22:20', '16:45']

/** Arma el historial completo de todos los hábitos. */
export function historialDeEjemplo(habitos: Habito[]): Historial {
  const registros: Registro[] = []
  const semanas: Semana[] = []
  const hoyMismo = hoy()
  const primerLunes = lunesDeLaSemana(sumarDias(hoyMismo, -SEMANAS_DE_EJEMPLO * 7))

  for (const habito of habitos) {
    // Se recorren las diez semanas cerradas y, al final, la semana en curso.
    for (let indice = 0; indice <= SEMANAS_DE_EJEMPLO; indice += 1) {
      const dias = diasDeLaSemana(sumarDias(primerLunes, indice * 7))
      const enCurso = indice === SEMANAS_DE_EJEMPLO

      if (habito.tipo === 'positivo') {
        const hechos = diasCumplidos(habito, indice, dias, hoyMismo, enCurso)
        registros.push(...hechos.map((fecha) => registroCumplido(habito.id, fecha)))
        // El veredicto solo se guarda al cerrar la semana (regla 8). La semana
        // en curso todavía no tiene veredicto: se juzga el lunes que viene.
        if (!enCurso) semanas.push(veredicto(habito, dias, hechos.length))
      } else {
        registros.push(...recaidas(habito, indice, dias, hoyMismo))
      }
    }
  }

  return { registros, semanas }
}

/** Qué días de la semana se cumplió un hábito positivo. */
function diasCumplidos(
  habito: Habito,
  indice: number,
  dias: string[],
  hoyMismo: string,
  enCurso: boolean,
): string[] {
  const orden = ORDEN_DE_DIAS[habito.id] ?? [0, 1, 2, 3, 4, 5, 6]
  const cuantos = enCurso
    ? (habito.objetivo ?? 0)
    : (CUMPLIMIENTO[habito.id]?.[indice] ?? 0)

  return orden
    .slice(0, cuantos)
    .map((posicion) => dias[posicion])
    .filter((fecha): fecha is string => fecha !== undefined)
    // El día de hoy y el futuro no se rellenan: el usuario los marca en la app.
    .filter((fecha) => fecha < hoyMismo && fecha >= habito.creadoEn)
    .sort()
}

/** Un día cumplido de un hábito positivo. */
function registroCumplido(habitoId: string, fecha: string): Registro {
  return {
    id: `${habitoId}:${fecha}`,
    habitoId,
    fecha,
    estado: 'cumplido',
    valor: null,
    hora: null,
    contexto: null,
    nota: null,
  }
}

/** Las recaídas de un hábito negativo en una semana. Los días limpios no se guardan. */
function recaidas(habito: Habito, indice: number, dias: string[], hoyMismo: string): Registro[] {
  const cuantas = RECAIDAS[habito.id]?.[indice] ?? 0
  const orden = ORDEN_DE_RECAIDAS[(indice + habito.orden) % ORDEN_DE_RECAIDAS.length] ?? []

  return orden
    .slice(0, cuantas)
    .map((posicion) => dias[posicion])
    .filter((fecha): fecha is string => fecha !== undefined)
    .filter((fecha) => fecha < hoyMismo && fecha >= habito.creadoEn)
    .sort()
    .map((fecha, posicion) => ({
      id: `${habito.id}:${fecha}`,
      habitoId: habito.id,
      fecha,
      estado: 'fallado' as const,
      valor: null,
      hora: HORAS[(indice + posicion) % HORAS.length] ?? null,
      contexto: habito.contextos[(indice + posicion) % Math.max(habito.contextos.length, 1)] ?? null,
      nota: null,
    }))
}

/** El veredicto de una semana cerrada: el semáforo de la sección 6. */
function veredicto(habito: Habito, dias: string[], hechos: number): Semana {
  const objetivo = habito.objetivo ?? 0
  const minimo = habito.minimo ?? 0
  const lunes = dias[0] ?? habito.creadoEn

  return {
    id: `${habito.id}:${claveSemana(lunes)}`,
    habitoId: habito.id,
    hechos,
    objetivo,
    minimo,
    color: colorDeSemana(hechos, objetivo, minimo),
    comodinUsado: false,
    cerrada: true,
  }
}

/** Verde cumple, ámbar salva la racha pero deja marca, rojo la rompe. */
function colorDeSemana(hechos: number, objetivo: number, minimo: number): ColorSemana {
  if (hechos >= objetivo) return 'verde'
  if (hechos >= minimo) return 'ambar'
  return 'rojo'
}

