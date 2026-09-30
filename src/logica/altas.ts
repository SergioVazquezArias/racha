/**
 * Altas y bajas de hábitos (sección 9 del documento de arquitectura).
 *
 * Son las cuatro reglas que no se pueden improvisar, escritas como funciones
 * puras: reciben un hábito y devuelven otro, sin tocar `localStorage` ni leer
 * el reloj. Así se pueden probar una por una (regla 10) y el repositorio se
 * queda con su único trabajo, que es guardar.
 *
 * 1. **Un hábito cuenta desde su `creadoEn`.** Normalmente es hoy, pero se
 *    puede poner un día del pasado: hay hábitos que ya se llevaban antes de
 *    apuntarlos en la app. Nunca puede ser mañana.
 * 2. **Editar no reescribe los veredictos.** `conCambios` no toca las semanas
 *    ya cerradas: cambiar hoy el objetivo deja intacto el mes pasado. La fecha
 *    de inicio sí se puede corregir, porque es un dato que se captura mal con
 *    facilidad y no hay otra forma de arreglarlo.
 * 3. **Archivar conserva todo** —registros, semanas y mejor racha— y se puede
 *    revivir.
 * 4. **Eliminar borra todo el rastro**, y antes hay que escribir el nombre.
 */

import { mostrarNombre } from './nombres'
import type { Cadencia, Comodin, Fecha, Habito, Registro, Semana, TipoHabito } from '../tipos'

/** Lo que el formulario captura de un hábito. El resto lo pone la app. */
export interface CamposDeHabito {
  nombre: string
  icono: string
  privado: boolean
  alias: string | null
  tipo: TipoHabito
  cadencia: Cadencia
  objetivo: number | null
  minimo: number | null
  permiteComodin: boolean
  contextos: string[]
  /**
   * Desde cuándo se lleva el hábito. Por omisión hoy, y puede ser un día del
   * pasado: «esto ya lo hacía desde hace dos semanas, apenas lo estoy
   * apuntando». Quién marca esos días de antes es `retroactivo.ts`.
   */
  creadoEn: Fecha
}

/** Las cuatro listas donde un hábito deja rastro. */
export interface RastroDeHabitos {
  habitos: Habito[]
  registros: Registro[]
  semanas: Semana[]
  comodines: Comodin[]
}

/** El identificador de un hábito nuevo. Sin relación con su nombre: los privados también. */
export function nuevoId(): string {
  return crypto.randomUUID()
}

/**
 * Un hábito nuevo (regla 1 de la sección 9).
 *
 * Nace con el `creadoEn` que dijo el formulario —hoy, o el día del pasado desde
 * el que ya se llevaba—, y ahí arrancan todas las cuentas de la app: antes de
 * esa fecha no se mira nunca, así que jamás inventa fallas.
 *
 * Va al final de la lista, después del último que haya.
 */
export function nuevoHabito(
  campos: CamposDeHabito,
  existentes: Habito[],
  hoy: Fecha,
  id: string = nuevoId(),
): Habito {
  const ultimoOrden = existentes.reduce((mayor, habito) => Math.max(mayor, habito.orden), 0)

  return {
    id,
    ...coherentes(campos, hoy),
    orden: ultimoOrden + 1,
    archivadoEn: null,
    revividoEn: null,
    mejorRachaPrevia: null,
  }
}

/**
 * Un hábito editado (regla 2 de la sección 9).
 *
 * Solo cambia lo que el formulario captura. **El tipo y la cadencia se quedan
 * como estaban**, y las semanas ya cerradas ni se mencionan: guardan su propio
 * objetivo y su propio mínimo, congelados el día que se cerraron (regla 8).
 * Subirse el objetivo de 5 a 6 hoy no vuelve ámbar la semana pasada.
 *
 * El tipo y la cadencia no se editan porque cambiarlos dejaría un historial que
 * no significa nada: los días cumplidos de un positivo no son las recaídas de
 * un negativo. Para eso se archiva y se crea otro.
 *
 * La fecha de inicio **sí** se puede mover, y nunca destruye historial: hacia
 * atrás amplía lo que cuenta —los días nuevos los rellena `retroactivo.ts`— y
 * hacia adelante lo encoge, dejando los registros de fuera guardados y sin
 * mirar. En un hábito que se archivó y volvió el conteo arranca en `revividoEn`
 * y no aquí (sección 9), así que mover esta fecha no cambia su racha.
 */
export function conCambios(habito: Habito, campos: CamposDeHabito, hoy: Fecha): Habito {
  return {
    ...habito,
    ...coherentes({ ...campos, tipo: habito.tipo, cadencia: habito.cadencia }, hoy),
  }
}

/**
 * Un hábito archivado (regla 3 de la sección 9).
 *
 * Sale de la pantalla Hoy y **no se borra nada**: sus registros, sus semanas y
 * sus comodines se quedan donde están. Lo único que se escribe, además de la
 * fecha, es la mejor racha del momento, que queda congelada para que sobreviva
 * al archivado y a la vuelta.
 */
export function archivado(habito: Habito, mejorAhora: number, hoy: Fecha): Habito {
  return {
    ...habito,
    archivadoEn: hoy,
    mejorRachaPrevia: Math.max(habito.mejorRachaPrevia ?? 0, mejorAhora),
  }
}

/**
 * Un hábito revivido (regla 3 de la sección 9).
 *
 * Vuelve a la pantalla Hoy. **La racha actual arranca en cero** —de eso se
 * encarga `revividoEn`, que mueve el inicio del conteo a hoy— y **la mejor
 * racha histórica se conserva**, guardada en `mejorRachaPrevia` el día que se
 * archivó. El historial viejo sigue completo y visible en su detalle.
 */
export function revivido(habito: Habito, hoy: Fecha): Habito {
  return { ...habito, archivadoEn: null, revividoEn: hoy }
}

/**
 * ¿El texto escrito coincide con el nombre del hábito? (regla 4 de la sección 9).
 *
 * Se compara contra **el nombre que se está viendo en pantalla**: el alias si el
 * hábito es privado y el interruptor de nombres reales está apagado. Pedir el
 * nombre real de un hábito cuyo nombre real está escondido sería imposible de
 * cumplir sin prender el interruptor delante de quien sea que esté mirando.
 *
 * Perdona mayúsculas y espacios de sobra, que en un teclado de teléfono se
 * cuelan solos. No perdona nada más: hay que escribirlo.
 */
export function confirmacionCorrecta(habito: Habito, texto: string, mostrarReales = false): boolean {
  return normalizar(texto) === normalizar(mostrarNombre(habito, mostrarReales))
}

/**
 * Todo sin el hábito (regla 4 de la sección 9).
 *
 * Eliminar borra el hábito **y todo su historial**: registros, semanas y
 * comodines. Sin vuelta atrás. Es lo excepcional; lo habitual es archivar.
 */
export function sinElHabito(rastro: RastroDeHabitos, habitoId: string): RastroDeHabitos {
  return {
    habitos: rastro.habitos.filter((habito) => habito.id !== habitoId),
    registros: rastro.registros.filter((registro) => registro.habitoId !== habitoId),
    semanas: rastro.semanas.filter((semana) => semana.habitoId !== habitoId),
    comodines: rastro.comodines.filter((comodin) => comodin.habitoId !== habitoId),
  }
}

/**
 * Los campos puestos de acuerdo entre ellos, para que no se guarden hábitos
 * imposibles: un negativo con comodines, o un hábito diario con objetivo de
 * cinco veces por semana.
 */
function coherentes(campos: CamposDeHabito, hoy: Fecha): CamposDeHabito {
  const semanal = campos.cadencia === 'semanal'

  return {
    ...campos,
    nombre: campos.nombre.trim(),
    // Una fecha de mañana dejaría al hábito sin días que contar y con cuentas
    // en negativo. `validacion.ts` ya no la deja pasar; esto es el segundo
    // cerrojo, por si algún día entra por otro lado.
    creadoEn: campos.creadoEn > hoy ? hoy : campos.creadoEn,
    alias: campos.privado ? (campos.alias?.trim() || null) : null,
    // Un negativo nunca admite comodín: una recaída es una recaída (sección 7).
    permiteComodin: campos.tipo === 'negativo' ? false : campos.permiteComodin,
    objetivo: semanal ? campos.objetivo : null,
    minimo: semanal ? campos.minimo : null,
    // Los contextos son las opciones que se ofrecen al registrar una recaída,
    // así que solo tienen sentido en un hábito negativo (sección 10).
    contextos: campos.tipo === 'negativo' ? campos.contextos.map((c) => c.trim()).filter((c) => c !== '') : [],
  }
}

/** Sin mayúsculas, sin espacios de sobra. Para comparar lo que se escribió. */
function normalizar(texto: string): string {
  return texto.trim().toLowerCase().replace(/\s+/g, ' ')
}
