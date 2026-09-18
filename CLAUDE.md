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
| 09 | Respaldo, borrado total, tema oscuro y cierre de la v1 | Hecha |
| 10 | README y portafolio | Hecha |

**La v1 está cerrada y etiquetada como `v1.0`.** De aquí en adelante no hay plan
de fases: lo que venga son cambios sueltos.

---

## Notas para retomar el proyecto

Escritas al cerrar la v1, para quien vuelva dentro de seis meses —Sergio, o una
sesión nueva— sin acordarse de nada.

### Cómo volver a empezar

1. Lee este archivo y luego `docs/arquitectura.md`, que es la especificación
   completa. Todo lo que parece arbitrario está explicado ahí.
2. `npm install` y `npm test`. Si las 389 pruebas pasan, el proyecto está sano.
3. `npm run dev` abre la app en <http://localhost:5173/racha/>. El `/racha/` del
   final hace falta.
4. Cada push a `main` corre las pruebas y publica en GitHub Pages. Si una prueba
   falla no se publica nada. **No hay otro paso de despliegue.**

La app real vive en el iPhone de Sergio y sus datos también: no hay servidor, no
hay copia, y el entorno de desarrollo nunca ve datos reales. Los ocho hábitos y
las dos metas que aparecen al abrir en el navegador son relleno.

### Decisiones que no hay que revertir sin pensarlo mucho

Cada una de estas parece simplificable, y cada una se tomó por una razón que no
es evidente desde el código:

- **Los hábitos positivos y negativos son dos componentes separados.** Unificarlos
  con una bandera es la primera refactorización que se le ocurre a cualquiera y
  produce un componente con dos modos que nadie entiende. La asimetría es
  conceptual, no cosmética (sección 5).
- **El ámbar y la regla de las dos ámbar consecutivas.** Sin el ámbar, un hábito
  semanal se juzga como binario y la app miente. Sin la regla de las dos, el
  ámbar vuelve al sistema complaciente y la racha deja de significar algo.
- **Los veredictos semanales se calculan una vez y se guardan** (regla 8).
  Recalcular el pasado con los números de hoy reescribiría la historia cada vez
  que se edita un objetivo.
- **Las fechas son `"YYYY-MM-DD"` en hora local, nunca UTC ni timestamps**
  (regla 2). Las pruebas corren en `America/Mexico_City` justamente para que un
  descuido con UTC se delate.
- **`mostrarNombre` recibe el interruptor como segundo parámetro opcional que
  vale «apagado» por omisión**, y el interruptor no se persiste. Las dos cosas
  son la red de seguridad del modo discreto: un descuido esconde nombres, nunca
  los enseña (sección 8).
- **El respaldo tiene tres botones y no uno.** La descarga falla en silencio
  dentro de la PWA instalada en iOS. Quitar los otros dos caminos porque «uno
  basta» reintroduce un fallo invisible en lo único que protege los datos. La
  hoja de compartir está **probada en el iPhone de Sergio**, no solo investigada.
- **Al borrar todo, los hábitos nacen con `creadoEn` de hoy.** Si conservaran su
  fecha original, la app cerraría once semanas pasadas en rojo al abrirse. Lo
  vigila `src/datos/ejemplo/documento.test.ts`; si esa prueba estorba, el
  problema es el cambio, no la prueba.
- **Recharts se carga aparte**, no en el arranque. La pantalla Hoy —que es el
  99 % del uso— no necesita la librería de gráficas.
- **La `base` de Vite es `/racha/`.** Sin eso la app publicada abre en blanco.

### Qué quedó fuera a propósito

No son pendientes. Son decisiones:

- **Notificaciones push**: exigirían un servidor y rompen el costo cero y el «los
  datos no salen del teléfono». Se sustituyen con un Atajo de iOS.
- **Sincronización y copia en la nube**: mismo motivo. El respaldo manual es la
  red de seguridad, y el recordatorio de los 30 días existe por eso.
- **Cuentas y multiusuario**: no es un producto.
- **Cifrado**: el modo discreto es discreción, no seguridad, y presentarlo de
  otro modo sería peor que no tenerlo.
- **Gamificación**: ni insignias, ni niveles, ni puntos.
- **Pruebas de interfaz**: se prueba la lógica y nada más. En una app de este
  tamaño las pruebas de interfaz cuestan más de lo que valen, y lo que de verdad
  puede salir mal es lógica pura.
- **Un enrutador**: son cuatro pantallas dentro de una app instalada. La pestaña
  activa vive en memoria y cada arranque abre en Hoy, que es lo que se quiere ver.

### Dónde morder con cuidado

- `src/logica/rachas.ts` — **nunca se toca sin correr `npm test` después**
  (regla 10). Es el archivo del que dependen todas las pantallas.
- `src/logica/cierre.ts` — decide qué semanas se cierran al arrancar la app. Un
  error aquí inventa historia o la borra.
- `src/datos/repositorio/documento.ts` — el único archivo que toca
  `localStorage`. Si algo tiene que escribir datos, pasa por aquí.
- `src/logica/validarRespaldo.ts` — el único lugar por donde entran datos de
  fuera. Todo lo demás lo escribió la app.
- La línea `@custom-variant dark (...)` de `src/index.css` es lo que hace que el
  selector de tema mande sobre el ajuste del iPhone. Si desaparece, los cientos
  de `dark:` de la app vuelven a obedecer solo al sistema, en silencio.
