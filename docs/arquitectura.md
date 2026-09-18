# Racha — Arquitectura

App personal de hábitos y metas. Documento de referencia del proyecto.
Versión 4 · 17 de septiembre de 2026 · Sergio Vázquez

---

## 1. Qué es y para quién

App de seguimiento de hábitos diarios y metas de mediano plazo, de **un solo
usuario**. No hay cuentas, no hay servidor, no hay sincronización. Los datos
viven únicamente en el iPhone del usuario.

El usuario **no sabe programar**. Dirige el proyecto leyendo planes y aprobando
cambios. Toda comunicación, interfaz, comentarios y mensajes van **en español**.

### Restricciones no negociables

- **Costo cero.** Nada que requiera suscripción, servidor o cuenta de pago.
- **Se instala en un iPhone 16** como app de pantalla de inicio (PWA).
- **Funciona sin internet.**
- **Los datos nunca salen del teléfono.**
- El repositorio es **público** (portafolio), así que ningún dato personal
  puede vivir en el código.

---

## 2. Stack técnico

| Capa | Elección |
|---|---|
| Base | Vite + React + TypeScript |
| Estilos | Tailwind CSS |
| Persistencia | `localStorage`, encapsulado en `src/datos/repositorio/` |
| Fechas | `date-fns` |
| Gráficas | Recharts |
| Pruebas | Vitest (solo lógica, no interfaz) |
| PWA | `vite-plugin-pwa` |
| Hosting | GitHub Pages con GitHub Actions |

---

## 3. Reglas del proyecto

Estas reglas van en `CLAUDE.md` y aplican a todo el código.

1. **Español** en interfaz, nombres de variables de dominio, comentarios y
   mensajes de commit.
2. **Fechas como `"YYYY-MM-DD"` en hora local.** Nunca UTC, nunca timestamps
   para identificar un día. Un viaje a otro huso horario no debe alterar
   ninguna racha.
3. **TypeScript estricto.** Sin `any`.
4. **Ningún archivo arriba de 200 líneas.** Si crece, se parte.
5. **Todo acceso a datos pasa por `src/datos/repositorio/`.** Ningún
   componente toca `localStorage` directamente.
6. **Los hábitos positivos y negativos son componentes separados.** Nunca se
   unifican en uno con una bandera. La razón está en la sección 5.
7. **El nombre visible de un hábito siempre se obtiene con
   `mostrarNombre(habito)`.** Ningún componente lee `habito.nombre` directo.
8. **Los veredictos semanales se calculan una vez y se guardan.** No se
   recalcula el pasado.
9. Cada fase termina en un commit con mensaje legible en español.
10. **Toda lógica nueva lleva pruebas de Vitest con nombres en español**, para
    que el usuario pueda leerlas y auditarlas. Y nunca se toca
    `src/logica/rachas.ts` sin correr `npm test` después.
11. **Si algo de esta especificación es ambiguo o falta información, se
    pregunta.** No se inventa ni se asume.

---

## 4. Modelo de datos

Todo se guarda como un único documento JSON en `localStorage`, bajo la llave
`"racha.v1"`.

### Habito

```ts
{
  id: string
  nombre: string            // el real; solo lo ve el usuario
  alias: string | null      // lo que se muestra si privado === true
  icono: string             // emoji; los privados también llevan el suyo
  privado: boolean
  tipo: "positivo" | "negativo"
  cadencia: "diaria" | "semanal"
  objetivo: number | null   // veces por semana; null si diaria
  minimo: number | null     // piso que mantiene viva la racha
  permiteComodin: boolean   // false siempre en negativos
  contextos: string[]       // opciones de detonante para recaídas
  orden: number
  creadoEn: string          // "YYYY-MM-DD"
  archivadoEn: string | null
}
```

Un hábito **nunca se borra por accidente**: se archiva. Ver sección 9.

### Registro

Uno por hábito por día. El `id` compuesto hace imposible duplicar un día.

```ts
{
  id: string                // `${habitoId}:${fecha}`
  habitoId: string
  fecha: string             // "YYYY-MM-DD"
  estado: "cumplido" | "fallado"
  valor: number | null      // minutos, reps, etc.
  hora: string | null       // "HH:MM" — solo en recaídas
  contexto: string | null   // solo en recaídas
  nota: string | null
}
```

### Semana

El veredicto de cada semana, calculado una vez al cerrarla y **guardado**.

```ts
{
  id: string                // `${habitoId}:2026-W38`
  habitoId: string
  hechos: number
  objetivo: number          // el vigente cuando se cerró la semana
  minimo: number
  color: "verde" | "ambar" | "rojo"
  comodinUsado: boolean
  cerrada: boolean
}
```

### Comodin

Un comodín gastado. Congela un día fallado o una semana roja: la racha no
crece, pero tampoco se rompe.

Se guarda como entidad propia y no como una bandera dentro de `Semana`
porque hacen falta las dos fechas: sin ellas no se puede comprobar ni el
límite de tres días hacia atrás ni la regla de uno al mes. El `comodinUsado`
de `Semana` se queda solo para pintar el escudo en el historial.

```ts
{
  id: string                // `${habitoId}:${fecha}`
  habitoId: string
  fecha: string             // el día que queda congelado
  aplicadoEn: string        // el día en que se gastó; decide de qué mes sale
}
```

### Meta

```ts
{
  id: string
  nombre: string
  fechaInicio: string
  fechaObjetivo: string
  valorInicial: number
  valorObjetivo: number
  unidad: string
  direccion: "bajar" | "subir"
  campos: { clave: string, etiqueta: string, unidad: string }[]
  hitos: { nombre: string, fecha: string, valor: number }[]
  habitosVinculados: string[]
  frecuencia: "semanal" | "mensual"
  estado: "activa" | "cumplida" | "abandonada"
  cerradaEn: string | null
}
```

### Medicion

```ts
{
  id: string
  metaId: string
  fecha: string
  momento: "manana" | "noche"
  valores: Record<string, number>
  nota: string | null
}
```

### Ajustes

```ts
{
  tema: "claro" | "oscuro" | "sistema"
  inicioSemana: "lunes"
  estaturaCm: 175
  ultimoRespaldo: string | null
  version: 1
}
```

---

## 5. Hábitos positivos y negativos

Esta asimetría es el corazón conceptual de la app.

### Positivo — ir al gym, leer, estudiar inglés

- Al empezar el día el estado es **pendiente**. No cuenta hasta que el usuario
  lo marque.
- El usuario toca una palomita cuando lo hizo.
- A medianoche, un día sin marcar se cierra sin cumplir.
- Admite comodines.

### Negativo — sin pantallas, sin refresco, sin postre

- Al empezar el día el estado es **limpio**. Cuenta a favor desde que arranca.
- El usuario **no hace nada** en un día normal. Solo registra si recayó.
- A medianoche, un día sin registro se cierra como cumplido.
- **No admite comodines.** Una recaída es una recaída.

### Consecuencia obligatoria de diseño

En la pantalla Hoy, los positivos se ven como lista de pendientes con palomita.
Los negativos se ven como un contador de días limpios que sube solo, con un
botón discreto de "registrar recaída" que no invita a tocarse.

Son **dos componentes distintos**: `FilaHabitoPositivo` y `FilaHabitoNegativo`.
No se unifican.

---

## 6. Cadencia, rachas y semáforo

### La cadencia define la unidad de la racha

| Cadencia | Unidad de la racha |
|---|---|
| Diaria | Días consecutivos |
| X veces por semana | **Semanas** consecutivas cumplidas |

Con cadencia semanal, un día en que el usuario no entrenó **no es una falla**:
es un día libre. Nunca se pinta rojo. El juicio ocurre al cerrar la semana.

### El semáforo semanal

Cada hábito semanal tiene dos números: `objetivo` y `minimo`.

| Situación | Color | Efecto en la racha |
|---|---|---|
| `hechos >= objetivo` | verde | +1 |
| `minimo <= hechos < objetivo` | ámbar | +1, pero la semana queda marcada |
| `hechos < minimo` | rojo | racha a 0 |
| **Dos semanas ámbar consecutivas** | — | racha a 0 |

La regla de las dos ámbar es deliberada: un mal día cuesta una marca, dos malas
semanas cuestan la racha.

### Métricas que siempre se muestran juntas

- **Racha actual** — motiva.
- **Mejor racha histórica** — nunca se pierde, ni al archivar.
- **% de cumplimiento a 30 días** — el número honesto. Una semana ámbar salva
  la racha pero baja el porcentaje.

### El día de hoy

El día en curso no cuenta ni a favor ni en contra hasta la medianoche. Se
muestra visualmente distinto.

---

## 7. Comodines

- **Uno al mes**, se recarga el día 1. **No se acumulan.**
- Se aplica sobre una semana roja (o un día fallado en cadencia diaria) y la
  **congela**: la racha no crece, pero tampoco se rompe.
- En el historial la semana lleva un escudo. **Nunca se pinta verde.**
- Aplicable **retroactivamente hasta 3 días**.
- **No aplica a hábitos negativos**, nunca.

El cupo del mes es del usuario, no de cada hábito: se cuenta por el
`aplicadoEn` del `Comodin`, así que un comodín gastado el 1 de septiembre
sobre el 30 de agosto sale del cupo de septiembre.

---

## 8. Modo discreto

Algunos hábitos son privados. El usuario no quiere que se lean si alguien toma
su teléfono.

- Un hábito con `privado: true` muestra su `alias` en lugar del nombre real.
  **Nada más cambia.**
- **Un hábito privado lleva un emoji normal, elegido por el usuario y acorde a
  su alias, igual que cualquier otro hábito.** No lleva punto gris ni ninguna
  otra marca. Un punto entre emojis de colores delataría que hay algo
  escondido, que es justo lo contrario de lo que se busca: lo que se quiere es
  que un hábito privado sea indistinguible de los demás.
- Existe una sola función `mostrarNombre(habito)` que decide qué texto se ve.
  **Todas** las pantallas la usan.
- En Ajustes hay un interruptor **"Mostrar nombres reales"** que vive en
  memoria y **no se persiste**: cada arranque de la app empieza apagado.
- `mostrarNombre(habito, mostrarReales)` recibe ese interruptor como segundo
  dato **opcional, que vale «apagado» si no se pasa**. Un descuido muestra el
  alias, nunca el nombre real.
- En Estadísticas, los hallazgos de hábitos privados se muestran siempre con el
  alias, aunque el interruptor esté prendido en otra pantalla. No hace falta
  recordarlo: Estadísticas llama a `mostrarNombre(habito)` a secas y el
  interruptor no le llega.
- Al exportar el respaldo, **advertir en pantalla** que el archivo contiene los
  nombres reales.

Esto es discreción, no seguridad. No se debe presentar como cifrado ni como
protección real.

---

## 9. Altas y bajas

### Archivar (lo habitual)

Sale de la pantalla Hoy. **Conserva todo**: registros, semanas, mejor racha.
Se puede revivir; al revivirlo la racha actual arranca en cero pero la **mejor
racha histórica se conserva**.

### Eliminar (excepcional)

Borra el hábito y todo su historial, sin vuelta atrás. Pide confirmación
**escribiendo el nombre del hábito**.

### Cuatro reglas que no se pueden improvisar

1. **Un hábito nuevo cuenta desde su `creadoEn`.** Nunca mira hacia atrás ni
   inventa fallas en días en que no existía.
2. **Cambiar `objetivo` o `minimo` no reescribe semanas ya cerradas.** Para eso
   existe la entidad `Semana`.
3. **Archivar un hábito no rompe la meta que lo usaba.** La meta lo suelta de
   sus barras de proceso pero conserva las semanas históricas ya dibujadas.
4. **Las metas se cierran como `cumplida` o `abandonada`** con fecha, y quedan
   en un histórico consultable. Eliminarlas borra también sus mediciones y pide
   escribir el nombre.

---

## 10. Registro de recaídas

Cinco de los ocho hábitos son negativos, así que las recaídas son el dato más
valioso de la app. No basta guardar la fecha.

Al registrar una recaída se captura, en **máximo tres toques**:

- **Hora** — automática.
- **Contexto** — uno de los `contextos` configurados en el hábito, de un toque.
  Ejemplos: *con amigos · estrés · después de comer · solo en casa · en la calle*.
- **Nota** — opcional.

La pantalla **no lleva lenguaje de juicio**. Sin "qué lástima", sin caritas
tristes. Se registra y se sigue.

A cambio, Estadísticas muestra patrones: por día de la semana, por hora del
día, y por contexto. Ejemplo: *"71 % de tus recaídas son viernes o sábado"*.

---

## 11. Metas de ejemplo

### Meta 1 — Peso

| Campo | Valor |
|---|---|
| Inicio | 80.0 kg el 2026-09-15 |
| Objetivo | 72.0 kg el 2027-04-14 |
| Campos medidos | peso, cintura, pecho, cuello |
| Frecuencia | semanal, domingo |
| Hito | "Mitad del camino" en 75.7 kg |
| Hábitos vinculados | gym, sin refresco, sin postre |

Ritmo implícito: 0.27 kg por semana.

**Estimación de grasa corporal.** Con cuello, cintura y la estatura de Ajustes
(175 cm) se calcula el porcentaje de grasa corporal con la fórmula de la Marina
de EE.UU. para hombres:

```
%grasa = 495 / (1.0324 - 0.19077 * log10(cintura - cuello)
                + 0.15456 * log10(estatura)) - 450
```

Medidas en centímetros. Presentarlo siempre como **estimación**, nunca como
medición clínica. Lo confiable es la tendencia.

**Mediciones de mañana vs noche.** El peso nocturno es entre 0.5 y 1.5 kg más
alto. Por eso `Medicion.momento` existe. En la gráfica las mediciones nocturnas
se dibujan con **punto hueco**, y al calcular la tendencia se ajustan −0.8 kg,
avisándolo en pantalla con una línea de texto. Nada oculto.

### Meta 2 — Inglés

| Campo | Valor |
|---|---|
| Inicio | 50 puntos provisionales, puntaje base pendiente (llega el 2026-10-01) |
| Objetivo | 70 puntos (umbral B2) el 2027-09-15 |
| Campos medidos | puntaje 0–100 |
| Frecuencia | mensual |
| Hito | "B1 confirmado" — 58 puntos el 2027-03-15 |
| Hábito vinculado | inglés con Claude |

Escala fija de bandas, dibujadas como franjas de fondo en la gráfica:

```
40-54 = A2 · 55-69 = B1 · 70-84 = B2 · 85+ = C1
```

### Proyección

Con seis o más mediciones, calcular tendencia lineal y redactarla **en español
y en palabras**: *"a este ritmo llegas a 72 kg el 2 de abril, 12 días antes."*
Un porcentaje suelto no sirve.

---

## 12. Configuración inicial — 8 hábitos

| Hábito | Tipo | Cadencia | Objetivo / mínimo |
|---|---|---|---|
| Ir al gym | positivo | semanal | 5 / 4 |
| Leer 15 min | positivo | semanal | 6 / 5 |
| Inglés con Claude · 30 min | positivo | semanal | 6 / 5 |
| Sin pantallas | negativo | diaria | — |
| Sin refresco | negativo | diaria | — |
| Sin postre | negativo | diaria | — |
| Privado 1 | negativo, privado | diaria | — |
| Privado 2 | negativo, privado | diaria | — |

Los alias y contextos de los dos privados **los escribe el usuario en la app**.
No van en el código, no van en este documento, no van en el repositorio.

Interacción diaria real: **tres toques**. Los cinco negativos no piden nada.

---

## 13. Pantallas

1. **Hoy** — la única que se abre a diario. Positivos pendientes arriba,
   contadores de negativos abajo, resumen de la semana y comodines disponibles.
2. **Hábitos** — alta, edición, archivado y eliminación. Detalle de cada hábito
   con barras semanales de color (el semáforo) y mapa de calor de 14 semanas.
3. **Metas** — lista con progreso contra el plan e hitos. Detalle con gráfica de
   curva real contra recta del objetivo, barras de cumplimiento de los hábitos
   vinculados, proyección en texto y grasa estimada.
4. **Estadísticas** — ranking de cumplimiento a 30 días, mejor racha global,
   patrón por día de la semana y patrones de recaída.
5. **Ajustes** — interruptor de nombres reales, exportar e importar respaldo,
   alta de hábitos y metas, tema, estatura, recordatorio de medición.

---

## 14. Respaldo

- **Exportar**: descarga un JSON con todo, nombrado
  `racha-respaldo-YYYY-MM-DD.json`. Advertir que contiene nombres reales.
- **Importar**: valida `version` antes de sobrescribir y pide confirmación
  explícita.
- Guardar `ultimoRespaldo` y avisar en Ajustes si pasaron más de 30 días.

---

## 15. Plan de construcción

| Fase | Contenido |
|---|---|
| 00 | Instalación de herramientas. **Hecha.** |
| 01 | Este documento en el repo + `CLAUDE.md` + primer commit. **Hecha.** |
| 02 | Esqueleto Vite/React/TS + tipos + repositorio + datos de ejemplo. **Hecha.** |
| 03 | `src/logica/rachas.ts` con pruebas de Vitest. **Hecha.** |
| 04 | Pantalla Hoy + registro de recaídas. **Hecha.** |
| 05 | Modo discreto. **Hecha.** |
| 06 | Hábitos, CRUD completo y Estadísticas |
| 07 | Metas, mediciones y gráficas |
| 08 | PWA, GitHub Pages e instalación en el iPhone |
| 09 | Respaldo y cierre de la v1 |
| 10 | README y portafolio |

Una fase por sesión. Cada fase cierra con un commit.

---

## 16. Límites conocidos

- **Sin notificaciones push.** Requeriría un servidor. Se sustituye con un
  Atajo de iOS.
- **Sin sincronización.** Los datos viven en un solo teléfono.
- **El modo discreto es discreción, no seguridad.**
- **Safari borra almacenamiento de sitios sin usar en 7 días**, pero las apps
  de pantalla de inicio llevan su propio contador que se reinicia con cada uso.
  Uso diario, riesgo nulo. El respaldo cubre el resto.
- **La red corporativa del usuario bloquea `api.anthropic.com`.** El desarrollo
  se hace con hotspot o desde casa.
