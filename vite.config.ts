import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Configuración de Vite (fase 08).
 *
 * La app se publica en GitHub Pages dentro de una carpeta con el nombre del
 * repositorio, no en la raíz del dominio. De ahí `base`: sin eso la app buscaría
 * sus archivos un nivel más arriba y abriría en blanco.
 *
 * El resto es lo que convierte la página en una app instalable en el iPhone.
 */

/** La carpeta donde vive la app publicada: el nombre del repositorio. */
const BASE = '/racha/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // La app se actualiza sola: al abrirla, si hay versión nueva la instala
      // en segundo plano. Sergio no tiene que borrarla y volverla a agregar.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icono-apple-180.png'],

      /**
       * El manifiesto: lo que el iPhone lee al agregar la app a la pantalla de
       * inicio. No lleva descripción a propósito —nada que leer de reojo— y el
       * nombre es solo «Racha».
       */
      manifest: {
        name: 'Racha',
        short_name: 'Racha',
        lang: 'es',
        // `standalone` la abre sin barra de navegador: se ve y se siente app.
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        // Los colores del arranque, iguales a los del ícono y al fondo oscuro
        // de la app. Es lo que se ve el segundo que tarda en abrir.
        background_color: '#1c1917',
        theme_color: '#1c1917',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Android recorta el ícono con la forma que tenga el teléfono; el aro
          // queda bien adentro, así que el mismo dibujo sirve recortado.
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      workbox: {
        // Todo lo que se compila se guarda en el teléfono la primera vez. Con
        // eso la app abre sin conexión: los datos ya viven en `localStorage`,
        // así que sin internet funciona completa, no a medias.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // La gráfica se descarga aparte, al abrir una meta. Se guarda también,
        // para que la segunda vez ya no dependa de la red.
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
})
