import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuración de Vite. La ruta base se ajusta en la fase 08, al publicar en
// GitHub Pages.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
