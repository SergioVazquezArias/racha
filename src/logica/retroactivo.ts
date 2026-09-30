/**
 * Los días de antes: qué se marca cuando dices que ya llevabas el hábito.
 *
 * Un hábito casi nunca empieza el día en que se apunta en la app. Cuando el
 * formulario recibe una fecha de inicio anterior a hoy, esto devuelve los
 * registros que hacen verdad esa frase: los días que van de esa fecha a ayer,
 * dados por cumplidos.
 *
 * Tres reglas, una por clase de hábito:
 *
 * - **Negativo** — no se marca nada, y es lo correcto: un negativo está limpio
 *   mientras no haya una recaída registrada (sección 5). Con mover la fecha ya
 *   cuenta los días solo.
 * - **Positivo diario** — se marcan todos los días. Es literalmente lo que
 *   significa «lo llevo desde entonces».
 * - **Positivo semanal** — se marcan **las veces que se propuso**, no las
 *   siete. Un hábito de cinco por semana con los siete días palomeados diría
 *   «7 de 5», un número que nadie se cree y que además ensucia el mapa de
 *   calor. Con cinco, cada semana pasada cierra en verde, que es lo que se
 *   quiso decir.
 *
 * Y dos que valen para todas:
 *
 * - **Hoy no se marca.** El juicio llega a medianoche (sección 6) y hoy lo
 *   marcas tú, en la pantalla Hoy, como cualquier otro día.
 * - **Nunca se pisa un día que ya tenga registro**, sea palomita o recaída. Al
 *   corregirle la fecha a un hábito que ya lleva semanas, lo que ya estaba
 *   escrito manda.
 *
 * Es lógica pura: no lee el reloj ni toca `localStorage`. El día de hoy llega
 * como parámetro para que las pruebas puedan fingir cualquier fecha.
 */

import { lunesDeLaSemana, sumarDias } from './fechas'
import { finDeConteo, inicioDeConteo } from './vida'
import type { Fecha, Habito, Registro } from '../tipos'

/**
 * Los registros que faltan por escribir para que el hábito cuente desde su
 * fecha de inicio. Lista vacía si no hay nada que rellenar.
 *
 * `registros` son todos los del documento; de ahí sale qué días están ya
 * escritos y no se deben tocar.
 */
export function registrosRetroactivos(habito: Habito, registros: Registro[], hoy: Fecha): Registro[] {
  if (habito.tipo === 'negativo') return []

  const escritos = diasEscritos(habito, registros)
  const libres = diasLibres(habito, escritos, hoy)
  const elegidos =
    habito.cadencia === 'semanal' ? porSemana(habito, libres, registros) : libres

  return elegidos.map((fecha) => cumplido(habito.id, fecha))
}

/** Los días de este hábito que ya tienen registro, del estado que sea. */
function diasEscritos(habito: Habito, registros: Registro[]): Set<Fecha> {
  return new Set(
    registros.filter((registro) => registro.habitoId === habito.id).map((registro) => registro.fecha),
  )
}

/** Los días que cuentan para el hábito y todavía están en blanco, de viejo a nuevo. */
function diasLibres(habito: Habito, escritos: Set<Fecha>, hoy: Fecha): Fecha[] {
  const fin = finDeConteo(habito, hoy)
  const dias: Fecha[] = []

  for (let dia = inicioDeConteo(habito); dia <= fin; dia = sumarDias(dia, 1)) {
    if (!escritos.has(dia)) dias.push(dia)
  }

  return dias
}

/**
 * De los días libres, los que hacen falta para cumplir el objetivo de cada
 * semana: los primeros, contando desde el lunes.
 *
 * Si la semana ya trae días cumplidos —porque se le está corrigiendo la fecha a
 * un hábito que ya se usaba— solo se completa lo que falte. Y si ya está
 * cumplida, no se añade ninguno.
 */
function porSemana(habito: Habito, libres: Fecha[], registros: Registro[]): Fecha[] {
  const objetivo = habito.objetivo ?? 0
  const cumplidosPorSemana = cuentaPorSemana(habito, registros)
  const elegidos: Fecha[] = []
  const puestos = new Map<Fecha, number>()

  for (const dia of libres) {
    const lunes = lunesDeLaSemana(dia)
    const llevados = (cumplidosPorSemana.get(lunes) ?? 0) + (puestos.get(lunes) ?? 0)
    if (llevados >= objetivo) continue

    elegidos.push(dia)
    puestos.set(lunes, (puestos.get(lunes) ?? 0) + 1)
  }

  return elegidos
}

/** Cuántos días cumplidos lleva ya el hábito en cada semana, por su lunes. */
function cuentaPorSemana(habito: Habito, registros: Registro[]): Map<Fecha, number> {
  const cuenta = new Map<Fecha, number>()

  for (const registro of registros) {
    if (registro.habitoId !== habito.id || registro.estado !== 'cumplido') continue
    const lunes = lunesDeLaSemana(registro.fecha)
    cuenta.set(lunes, (cuenta.get(lunes) ?? 0) + 1)
  }

  return cuenta
}

/** Un día dado por cumplido. Sin valor, sin hora, sin contexto y sin nota. */
function cumplido(habitoId: string, fecha: Fecha): Registro {
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
