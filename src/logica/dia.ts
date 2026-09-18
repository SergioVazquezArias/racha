/**
 * Lo que pasó hoy con un hábito.
 *
 * Son tres preguntas que la pantalla Hoy hace todo el tiempo —¿ya lo marqué?,
 * ¿hubo recaída?, ¿cómo se llama el registro de este día?— y que se contestan
 * aquí una sola vez, para que los componentes no las resuelvan cada uno por su
 * cuenta.
 *
 * El `id` de un registro es `${habitoId}:${fecha}`, y ese id compuesto hace
 * imposible duplicar un día (sección 4): volver a registrar el mismo día
 * corrige el registro en vez de agregar otro.
 */

import type { Fecha, Registro } from '../tipos'

/** El nombre del registro de un hábito en un día. */
export function idDeRegistro(habitoId: string, fecha: Fecha): string {
  return `${habitoId}:${fecha}`
}

/** ¿Este hábito positivo ya se palomeó ese día? */
export function estaMarcado(habitoId: string, registros: Registro[], fecha: Fecha): boolean {
  return registros.some(
    (registro) =>
      registro.habitoId === habitoId && registro.fecha === fecha && registro.estado === 'cumplido',
  )
}

/**
 * La recaída de un hábito negativo en ese día, si la hubo.
 *
 * Devuelve el registro completo y no un `true`, porque la pantalla enseña
 * también la hora y el contexto que se capturaron (sección 10).
 */
export function recaidaDelDia(habitoId: string, registros: Registro[], fecha: Fecha): Registro | undefined {
  return registros.find(
    (registro) =>
      registro.habitoId === habitoId && registro.fecha === fecha && registro.estado === 'fallado',
  )
}
