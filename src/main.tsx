/**
 * Arranque de la app.
 *
 * Dos cosas antes de dibujar nada:
 *
 * 1. `inicializar()`: si el teléfono está vacío, siembra los datos de ejemplo;
 *    si ya hay datos, no toca nada.
 * 2. El cierre de las semanas que terminaron mientras la app no se abría. Los
 *    veredictos se guardan una sola vez y no se recalculan (regla 8); aquí solo
 *    se emiten los que faltaban. La decisión de cuáles faltan la toma
 *    `src/logica/cierre.ts`, que es lógica pura y tiene sus propias pruebas.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { guardarSemanas, inicializar } from './datos/repositorio'
import { semanasPorCerrar } from './logica/cierre'
import { hoy } from './logica/fechas'
import './index.css'

const documento = inicializar()
guardarSemanas(semanasPorCerrar(documento.habitos, documento.registros, documento.semanas, hoy()))

const raiz = document.getElementById('root')
if (raiz === null) throw new Error('No se encontró el elemento raíz de la página.')

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
