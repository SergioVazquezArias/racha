/**
 * Arranque de la app.
 *
 * Tres cosas antes de dibujar nada:
 *
 * 1. `inicializar()`: si el teléfono está vacío, siembra los datos de ejemplo;
 *    si ya hay datos, no toca nada.
 * 2. El cierre de las semanas que terminaron mientras la app no se abría. Los
 *    veredictos se guardan una sola vez y no se recalculan (regla 8); aquí solo
 *    se emiten los que faltaban. La decisión de cuáles faltan la toma
 *    `src/logica/cierre.ts`, que es lógica pura y tiene sus propias pruebas.
 * 3. El tema. Va aquí, y no dentro de la app, porque si se eligió oscuro y el
 *    teléfono está en claro habría un destello blanco al abrir.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { guardarSemanas, inicializar } from './datos/repositorio'
import { semanasPorCerrar } from './logica/cierre'
import { hoy } from './logica/fechas'
import { esOscuro } from './logica/tema'
import { aplicarTema, sistemaEnOscuro } from './pantallas/tema'
import './index.css'

const documento = inicializar()
guardarSemanas(semanasPorCerrar(documento.habitos, documento.registros, documento.semanas, hoy()))
aplicarTema(esOscuro(documento.ajustes.tema, sistemaEnOscuro()))

const raiz = document.getElementById('root')
if (raiz === null) throw new Error('No se encontró el elemento raíz de la página.')

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
