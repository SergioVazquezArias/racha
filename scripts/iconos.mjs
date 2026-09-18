/**
 * Dibuja los íconos de la app y los deja en `public/`.
 *
 * El ícono es lo único de Racha que otra persona va a ver: vive en la pantalla
 * de inicio del teléfono, entre WhatsApp y la cámara, y alguien puede mirarla
 * de reojo. Por eso **no dice nada**: un aro sobre un fondo oscuro. Sin
 * palomitas, sin calendarios, sin flechas que suben, sin letras. Quien lo vea
 * no puede saber de qué es la app, que es justo lo que pide la sección 8.
 *
 * Se genera con código y no con una imagen pegada en el repo para que se pueda
 * volver a hacer en cualquier momento —cambiar el color, el grosor o el
 * tamaño— y para no tener que instalar ningún programa de dibujo. Node trae
 * todo lo necesario: `zlib` comprime y un PNG no es más que eso comprimido con
 * cuatro etiquetas alrededor.
 *
 * Se corre solo cuando el dibujo cambia:
 *
 *     node scripts/iconos.mjs
 */

import { crc32, deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

/** El fondo del ícono: el mismo gris casi negro con el que abre la app. */
const FONDO = { r: 0x1c, g: 0x19, b: 0x17 }

/** El aro: el verde que la app ya usa para la curva de las gráficas. */
const TRAZO = { r: 0x34, g: 0xd3, b: 0x99 }

/** Qué tan grande es el aro y qué tan grueso, en proporción al lado del ícono. */
const RADIO = 0.3
const GROSOR = 0.085

/**
 * Los tres tamaños que hacen falta.
 *
 * 192 y 512 son los que pide el manifiesto de una PWA. El de 180 es aparte: es
 * el que iOS usa de verdad para la pantalla de inicio, y sin él el iPhone se
 * inventa uno recortando la primera pantalla de la app.
 */
const TAMANOS = [
  { lado: 192, archivo: 'icono-192.png' },
  { lado: 512, archivo: 'icono-512.png' },
  { lado: 180, archivo: 'icono-apple-180.png' },
]

/**
 * Los píxeles del ícono, cuatro bytes por punto (rojo, verde, azul, opacidad).
 *
 * Para cada píxel se mide su distancia al centro y se compara con el aro. Los
 * que caen justo en la orilla se pintan a medias, en proporción a cuánto les
 * toca: eso es lo que evita que el borde se vea de escalera.
 */
function pixeles(lado) {
  const centro = (lado - 1) / 2
  const radio = RADIO * lado
  const mitadDelGrosor = (GROSOR * lado) / 2
  const puntos = Buffer.alloc(lado * lado * 4)

  for (let fila = 0; fila < lado; fila += 1) {
    for (let columna = 0; columna < lado; columna += 1) {
      const dx = columna - centro
      const dy = fila - centro
      const distancia = Math.sqrt(dx * dx + dy * dy)

      // Cuánto de este píxel cae dentro del aro, de 0 (nada) a 1 (todo).
      const dentro = mitadDelGrosor - Math.abs(distancia - radio) + 0.5
      const cuanto = Math.min(1, Math.max(0, dentro))

      const donde = (fila * lado + columna) * 4
      puntos[donde] = Math.round(FONDO.r + (TRAZO.r - FONDO.r) * cuanto)
      puntos[donde + 1] = Math.round(FONDO.g + (TRAZO.g - FONDO.g) * cuanto)
      puntos[donde + 2] = Math.round(FONDO.b + (TRAZO.b - FONDO.b) * cuanto)
      puntos[donde + 3] = 255
    }
  }

  return puntos
}

/** Un trozo de archivo PNG: largo, nombre, contenido y su número de control. */
function trozo(nombre, contenido) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(contenido.length)

  const cuerpo = Buffer.concat([Buffer.from(nombre, 'ascii'), contenido])
  const control = Buffer.alloc(4)
  control.writeUInt32BE(crc32(cuerpo))

  return Buffer.concat([largo, cuerpo, control])
}

/** Arma el archivo PNG completo a partir de los píxeles. */
function png(lado, puntos) {
  const firma = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const cabecera = Buffer.alloc(13)
  cabecera.writeUInt32BE(lado, 0)
  cabecera.writeUInt32BE(lado, 4)
  cabecera[8] = 8 // ocho bits por color
  cabecera[9] = 6 // rojo, verde, azul y opacidad
  cabecera[10] = 0
  cabecera[11] = 0
  cabecera[12] = 0

  // Cada renglón de un PNG va precedido de un byte que dice cómo se comprimió.
  // Cero significa "tal cual", que es lo más simple y aquí basta.
  const renglones = Buffer.alloc(lado * (lado * 4 + 1))
  for (let fila = 0; fila < lado; fila += 1) {
    renglones[fila * (lado * 4 + 1)] = 0
    puntos.copy(renglones, fila * (lado * 4 + 1) + 1, fila * lado * 4, (fila + 1) * lado * 4)
  }

  return Buffer.concat([
    firma,
    trozo('IHDR', cabecera),
    trozo('IDAT', deflateSync(renglones, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ])
}

/** El mismo aro en SVG, que es el que se ve en la pestaña del navegador. */
function favicon() {
  const radio = RADIO * 64
  const grosor = GROSOR * 64

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1c1917"/>
  <circle cx="32" cy="32" r="${radio}" fill="none" stroke="#34d399" stroke-width="${grosor}"/>
</svg>
`
}

const destino = join(process.cwd(), 'public')
mkdirSync(destino, { recursive: true })

for (const { lado, archivo } of TAMANOS) {
  writeFileSync(join(destino, archivo), png(lado, pixeles(lado)))
  console.log(`${archivo}: ${lado}×${lado}`)
}

writeFileSync(join(destino, 'favicon.svg'), favicon())
console.log('favicon.svg')
