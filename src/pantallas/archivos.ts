/**
 * Cómo sale un archivo de la app hacia el teléfono, y cómo entra uno.
 *
 * Aquí está la razón de que la pantalla de respaldo ofrezca tres botones en
 * lugar de uno. **Dentro de la app instalada en la pantalla de inicio, la
 * descarga de toda la vida no es confiable en el iPhone.** En Safari normal
 * funciona; instalada, unas veces deja la app atorada en una pantalla de
 * descarga sin salida y otras no hace absolutamente nada, sin un solo mensaje
 * de error. Falla en silencio, que para un respaldo es lo peor que puede pasar:
 * creerías que lo tienes y no tendrías nada.
 *
 * Por eso:
 *
 * 1. **Compartir** — la hoja de compartir de iOS, que sí funciona dentro de la
 *    app instalada y lleva a «Guardar en Archivos». Es el camino bueno en el
 *    teléfono, y además el sistema avisa si de verdad se guardó o si se
 *    canceló, así que la fecha del último respaldo queda bien apuntada.
 * 2. **Descargar** — lo normal en la computadora.
 * 3. **Copiar el texto** — no depende de nada del sistema, solo de la pantalla.
 *    Es el que no puede fallar.
 *
 * Nada de esto se puede probar con Vitest: son las funciones del navegador, no
 * lógica. Lo que sí se prueba está en `src/logica/respaldo.ts`.
 */

/** Qué pasó al intentar entregar el archivo. */
export type Entrega = 'entregado' | 'cancelado' | 'imposible'

/** El tipo de archivo. Es un JSON, que es lo que es. */
const TIPO = 'application/json'

/** El archivo, listo para entregárselo al sistema. */
function comoArchivo(texto: string, nombre: string, tipo = TIPO): File {
  return new File([texto], nombre, { type: tipo })
}

/**
 * El archivo en un tipo que este teléfono acepte compartir, o `null`.
 *
 * Se intenta primero con `application/json`, que es la verdad. iOS no usa
 * estos nombres por dentro —tiene su propia lista de tipos— y hay aparatos que
 * se niegan a compartir los que no reconocen, así que si dice que no se
 * reintenta llamándolo texto pelón. El nombre del archivo no cambia: sigue
 * terminando en `.json`, que es lo que mira iOS para saber qué guardó.
 */
function archivoCompartible(texto: string, nombre: string): File | null {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return null

  for (const tipo of [TIPO, 'text/plain']) {
    const archivo = comoArchivo(texto, nombre, tipo)
    if (navigator.canShare({ files: [archivo] })) return archivo
  }

  return null
}

/**
 * ¿Este aparato sabe abrir la hoja de compartir con un archivo dentro?
 *
 * Se pregunta antes de enseñar el botón: en una computadora de escritorio casi
 * nunca se puede, y un botón que no hace nada es justo lo que se quiere evitar.
 */
export function sePuedeCompartir(texto: string, nombre: string): boolean {
  try {
    return archivoCompartible(texto, nombre) !== null
  } catch {
    return false
  }
}

/**
 * Abre la hoja de compartir de iOS con el respaldo dentro.
 *
 * Se manda solo el archivo, sin título ni texto: en iOS, acompañar un archivo
 * con texto hace que a veces se comparta el texto y se pierda el archivo.
 */
export async function compartirArchivo(texto: string, nombre: string): Promise<Entrega> {
  try {
    const archivo = archivoCompartible(texto, nombre)
    if (archivo === null) return 'imposible'
    await navigator.share({ files: [archivo] })
    return 'entregado'
  } catch (error) {
    // Cancelar es lo normal y no es un error: alguien abrió la hoja, lo pensó
    // mejor y cerró. No debe apuntarse como respaldo hecho.
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelado'
    return 'imposible'
  }
}

/** La descarga de toda la vida. Funciona bien en la computadora. */
export function descargarArchivo(texto: string, nombre: string): void {
  const direccion = URL.createObjectURL(new Blob([texto], { type: TIPO }))
  const enlace = document.createElement('a')
  enlace.href = direccion
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  // La dirección se suelta un minuto después: borrarla de inmediato cancela la
  // descarga en algunos navegadores, que todavía no la han terminado de leer.
  setTimeout(() => URL.revokeObjectURL(direccion), 60_000)
}

/** Copia el respaldo al portapapeles. Devuelve si se pudo. */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // Si no se pudo, el texto sigue a la vista en la pantalla y se puede
    // seleccionar a mano. Por eso el botón de copiar nunca es el único camino.
    return false
  }
}

/** Lee el archivo que se eligió en el selector de Archivos de iOS. */
export async function leerArchivo(archivo: File): Promise<string> {
  return archivo.text()
}
