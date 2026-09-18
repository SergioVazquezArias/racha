/**
 * Hábitos y todo lo que cuelga de ellos: registros, semanas y comodines.
 */

import { colocar, leerDocumento, modificar } from './documento'
import type { Comodin, Fecha, Habito, Registro, Semana } from '../../tipos'

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

/** Archivar conserva todo el historial (sección 9). Es lo habitual. */
export function archivarHabito(habitoId: string, fecha: Fecha): void {
  modificar((documento) => {
    const habito = documento.habitos.find((candidato) => candidato.id === habitoId)
    if (habito !== undefined) habito.archivadoEn = fecha
  })
}

/** Eliminar borra el hábito y todo su historial. Sin vuelta atrás. */
export function eliminarHabito(habitoId: string): void {
  modificar((documento) => {
    documento.habitos = documento.habitos.filter((habito) => habito.id !== habitoId)
    documento.registros = documento.registros.filter((r) => r.habitoId !== habitoId)
    documento.semanas = documento.semanas.filter((semana) => semana.habitoId !== habitoId)
    documento.comodines = documento.comodines.filter((c) => c.habitoId !== habitoId)
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

/** Los comodines gastados. Uno al mes, sin acumular (sección 7). */
export function obtenerComodines(): Comodin[] {
  return leerDocumento().comodines
}

export function guardarComodin(comodin: Comodin): void {
  modificar((documento) => colocar(documento.comodines, comodin))
}
