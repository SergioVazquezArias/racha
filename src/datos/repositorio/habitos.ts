/**
 * Hábitos y todo lo que cuelga de ellos: registros, semanas y comodines.
 */

import { colocar, leerDocumento, modificar } from './documento'
import { sinElHabito } from '../../logica/altas'
import type { Comodin, Habito, Registro, Semana } from '../../tipos'

export function obtenerHabitos(): Habito[] {
  return leerDocumento().habitos.sort((uno, otro) => uno.orden - otro.orden)
}

/** Los que se ven en la pantalla Hoy: todos menos los archivados. */
export function obtenerHabitosActivos(): Habito[] {
  return obtenerHabitos().filter((habito) => habito.archivadoEn === null)
}

export function guardarHabito(habito: Habito): void {
  modificar((documento) => colocar(documento.habitos, habito))
}

/**
 * Eliminar borra el hábito y todo su historial. Sin vuelta atrás (sección 9).
 *
 * Quién se borra y quién se queda lo decide `sinElHabito`, en la lógica, que es
 * donde está probado. Aquí solo se guarda el resultado.
 *
 * Archivar no tiene función propia: es un cambio del hábito y se guarda con
 * `guardarHabito`, igual que cualquier otra edición.
 */
export function eliminarHabito(habitoId: string): void {
  modificar((documento) => {
    const limpio = sinElHabito(documento, habitoId)
    documento.habitos = limpio.habitos
    documento.registros = limpio.registros
    documento.semanas = limpio.semanas
    documento.comodines = limpio.comodines
  })
}

export function obtenerRegistros(): Registro[] {
  return leerDocumento().registros
}

export function obtenerRegistrosDe(habitoId: string): Registro[] {
  return obtenerRegistros().filter((registro) => registro.habitoId === habitoId)
}

export function guardarRegistro(registro: Registro): void {
  modificar((documento) => colocar(documento.registros, registro))
}

/** Desmarcar un día: se quita el registro, no se guarda como fallado. */
export function eliminarRegistro(registroId: string): void {
  modificar((documento) => {
    documento.registros = documento.registros.filter((registro) => registro.id !== registroId)
  })
}

export function obtenerSemanas(): Semana[] {
  return leerDocumento().semanas
}

/** Los veredictos se guardan una vez y no se recalculan (regla 8). */
export function guardarSemana(semana: Semana): void {
  modificar((documento) => colocar(documento.semanas, semana))
}

/**
 * Varios veredictos de golpe, en una sola escritura.
 *
 * Lo usa el cierre de semanas al arrancar la app: si pasaron varias semanas sin
 * abrirla, se guardan todas juntas y no una por una.
 */
export function guardarSemanas(semanas: Semana[]): void {
  if (semanas.length === 0) return
  modificar((documento) => {
    for (const semana of semanas) colocar(documento.semanas, semana)
  })
}

/** Los comodines gastados. Uno al mes, sin acumular (sección 7). */
export function obtenerComodines(): Comodin[] {
  return leerDocumento().comodines
}

export function guardarComodin(comodin: Comodin): void {
  modificar((documento) => colocar(documento.comodines, comodin))
}
