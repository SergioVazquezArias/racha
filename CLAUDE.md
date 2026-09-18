# Racha

App personal de hábitos diarios y metas de mediano plazo. Un solo usuario, sin
cuentas, sin servidor. Los datos viven únicamente en el iPhone.

La especificación completa está en **`docs/arquitectura.md`**. Este archivo es el
resumen operativo: léelo al empezar cada sesión.

---

## Cómo trabajamos

- **Sergio no programa.** Dirige el proyecto leyendo planes en español y
  aprobando cambios. Explícale siempre qué vas a hacer —en español claro, sin
  jerga— **antes** de hacerlo.
- **Antes de cualquier cambio grande, propón el plan por escrito en español y
  espera aprobación.** Sergio no lee código: ese plan es su única forma real de
  revisar el trabajo antes de que exista. No se empieza a escribir hasta que él
  diga que sí.
- **Todo en español**: interfaz, explicaciones, planes, comentarios del código y
  mensajes de commit.
- **Una fase por sesión.** El plan de las diez fases está en la sección 15 de
  `docs/arquitectura.md`. **Cada fase cierra con un commit** con mensaje legible
  en español.
- **El repositorio es público** (sirve de portafolio). Ningún dato personal puede
  vivir en el código: los alias y contextos de los hábitos privados los escribe
  el usuario dentro de la app, nunca en el repo ni en la documentación.
- **Costo cero.** Nada que requiera suscripción, servidor o cuenta de pago.
- La red corporativa del usuario bloquea `api.anthropic.com`; el desarrollo se
  hace con hotspot o desde casa.

---

## Reglas del proyecto

Aplican a todo el código. Son la sección 3 de `docs/arquitectura.md`.

1. **Español** en interfaz, nombres de variables de dominio, comentarios y
   mensajes de commit.
2. **Fechas como `"YYYY-MM-DD"` en hora local.** Nunca UTC, nunca timestamps para
   identificar un día. Un viaje a otro huso horario no debe alterar ninguna
   racha.
3. **TypeScript estricto.** Sin `any`.
4. **Ningún archivo arriba de 200 líneas.** Si crece, se parte.
5. **Todo acceso a datos pasa por `src/datos/repositorio/`.** Ningún componente
   toca `localStorage` directamente.
6. **Los hábitos positivos y negativos son componentes separados.** Nunca se
   unifican en uno con una bandera. La razón está en la sección 5 del documento.
7. **El nombre visible de un hábito siempre se obtiene con
   `mostrarNombre(habito)`.** Ningún componente lee `habito.nombre` directo.
8. **Los veredictos semanales se calculan una vez y se guardan.** No se recalcula
   el pasado.
9. Cada fase termina en un commit con mensaje legible en español.
10. **Toda lógica nueva lleva pruebas de Vitest con nombres en español**, para
    que Sergio pueda leerlas y auditarlas. Y nunca se toca
    `src/logica/rachas.ts` sin correr `npm test` después.
11. **Si algo de la especificación es ambiguo o falta información, se pregunta.**
    No se inventa ni se asume.

---

## Stack técnico

| Capa | Elección |
|---|---|
| Base | Vite + React + TypeScript |
| Estilos | Tailwind CSS |
| Persistencia | `localStorage`, encapsulado en `src/datos/repositorio/` |
| Fechas | `date-fns` |
| Gráficas | Recharts |
| Pruebas | Vitest (solo lógica, no interfaz). `npm test` |
| PWA | `vite-plugin-pwa` |
| Hosting | GitHub Pages con GitHub Actions |

---

## Avance

| Fase | Contenido | Estado |
|---|---|---|
| 00 | Instalación de herramientas | Hecha |
| 01 | Documento en el repo + `CLAUDE.md` + primer commit | Hecha |
| 02 | Esqueleto Vite/React/TS + tipos + repositorio + datos de ejemplo | Hecha |
| 03 | `src/logica/rachas.ts` con pruebas de Vitest | Hecha |
| 04 | Pantalla Hoy + registro de recaídas | Hecha |
| 05 | Modo discreto | Hecha |
| 06 | Hábitos, CRUD completo y Estadísticas | Hecha |
| 07 | Metas, mediciones y gráficas | Hecha |
| 08 | PWA, GitHub Pages, instalación en el iPhone y carga diferida de las gráficas | Hecha |
| 09 | Respaldo y cierre de la v1 | |
| 10 | README y portafolio | |
