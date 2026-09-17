/**
 * Arranque de la app.
 *
 * Antes de dibujar nada se llama a `inicializar()`: si el teléfono está vacío,
 * siembra los datos de ejemplo; si ya hay datos, no toca nada.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { inicializar } from './datos/repositorio'
import './index.css'

inicializar()

const raiz = document.getElementById('root')
if (raiz === null) throw new Error('No se encontró el elemento raíz de la página.')

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
