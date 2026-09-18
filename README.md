# Racha

App de hábitos diarios y metas de mediano plazo. Un solo usuario, sin cuentas,
sin servidor, sin sincronización. Los datos viven únicamente en el teléfono.

Se instala en un iPhone como app de pantalla de inicio y funciona sin internet.
Está en producción y en uso diario: <https://sergiovazquezarias.github.io/racha/>

---

## El problema

Las apps de hábitos que hay tienden a dos defectos. El primero es mentir a
favor: inflan la racha, celebran cualquier cosa y terminan midiendo el uso de la
app en lugar de la conducta. El segundo es cobrar, sincronizar y guardar en un
servidor ajeno datos que son de lo más privado que tiene una persona.

Racha se escribió para un solo usuario con unos pocos requisitos duros:

- **Los datos no salen del teléfono.** No hay cuenta que crear ni servidor al
  que subir nada.
- **Costo cero.** Nada que requiera suscripción ni infraestructura de pago.
- **Algunos hábitos son privados** y no deben poder leerse si alguien más toma
  el teléfono un segundo.
- **La interacción diaria tiene que ser de tres toques.** Una app de hábitos que
  cuesta trabajo abrir se abandona en dos semanas, y entonces no mide nada.

No es un producto ni pretende serlo. Es software personal, y varias de sus
decisiones solo tienen sentido con eso en mente.

---

## Cómo funciona

Cuatro pantallas: **Hoy**, **Hábitos**, **Metas** y **Estadísticas**, más una de
Ajustes detrás del engrane.

Un hábito puede ser **positivo** (algo que quieres hacer) o **negativo** (algo
que quieres dejar de hacer), y su cadencia puede ser **diaria** o **X veces por
semana**. Las metas son objetivos numéricos de mediano plazo —bajar de peso,
subir un puntaje— con mediciones, hitos, una recta de plan y hábitos vinculados.

---

## Decisiones de diseño que vale la pena contar

### Un semáforo de tres colores, no cumplido/fallido

Casi todas las apps de hábitos son binarias: el día se cumplió o no. Eso
funciona para un hábito diario y es sencillamente incorrecto para uno de «cinco
veces por semana». Un martes en que no fuiste al gimnasio no es una falla: es un
día de descanso dentro de un plan que ya contaba con él. Pintarlo rojo enseña al
usuario que la app no entiende lo que está midiendo, y a partir de ahí deja de
creerle.

En Racha, un hábito semanal lleva dos números —`objetivo` y `minimo`— y **el
juicio ocurre al cerrar la semana**, no todos los días:

| Situación | Color | Efecto en la racha |
|---|---|---|
| `hechos >= objetivo` | verde | +1 |
| `minimo <= hechos < objetivo` | ámbar | +1, pero la semana queda marcada |
| `hechos < minimo` | rojo | racha a 0 |
| dos semanas ámbar seguidas | — | racha a 0 |

La regla de las dos ámbar es la que hace que el sistema no sea complaciente. El
ámbar solo perdona una vez: una mala semana cuesta una marca, dos malas semanas
seguidas cuestan la racha. Sin esa regla, alguien podría quedarse en el mínimo
indefinidamente con una racha de treinta semanas, que es exactamente el tipo de
mentira que la app trata de no decir.

Por la misma razón, junto a la racha **siempre** se muestra el porcentaje de
cumplimiento a 30 días. La racha motiva; el porcentaje es el número honesto. Una
semana ámbar salva la racha y baja el porcentaje, y eso es información, no ruido.

Y el porcentaje se mide sobre los días que el hábito vivió de verdad —desde su
alta, sin contar los que pasó archivado—, no sobre una ventana fija. Un hábito
de nueve días de vida se mide sobre nueve, no sobre treinta con veintiún fallas
inventadas.

Los veredictos semanales se calculan **una sola vez, al cerrar la semana, y se
guardan** con el objetivo y el mínimo congelados. Subirte la meta hoy no vuelve
ámbar el mes pasado.

### Los hábitos negativos se registran al revés

Un hábito positivo empieza el día **pendiente** y cuenta a favor cuando lo
marcas. Un hábito negativo empieza el día **limpio** y cuenta a favor **si no
haces nada**; solo se toca para registrar una recaída.

Parece un detalle y es la asimetría central de la app. Si «sin refresco» se
tuviera que marcar como cumplido cada noche, cinco hábitos negativos serían
cinco toques diarios de puro trámite, y a la semana el usuario estaría marcando
en automático sin leer. Invirtiendo el valor por omisión, la interacción diaria
real baja a tres toques: los negativos no piden nada.

De ahí salen dos consecuencias que el código respeta como regla:

- **Son dos componentes distintos**, `FilaHabitoPositivo` y
  `FilaHabitoNegativo`, y no se unifican en uno con una bandera. Se ven distinto
  a propósito: los positivos son una lista de pendientes con palomita, los
  negativos un contador de días limpios que sube solo, con un botón de
  «registrar recaída» deliberadamente poco llamativo. Unificarlos con un `if`
  habría producido un componente con dos modos que nadie entiende seis meses
  después.
- **Los negativos no admiten comodines.** El comodín congela una semana mala sin
  romper la racha —uno al mes, sin acumularse—, y tiene sentido para un objetivo
  de frecuencia. Una recaída es una recaída.

Al registrar una recaída se captura la hora (automática), el contexto (de un
toque, entre los que el usuario configuró) y una nota opcional. La pantalla **no
lleva lenguaje de juicio**: sin «qué lástima», sin caritas tristes. Se registra y
se sigue. A cambio, Estadísticas devuelve el patrón: *«71 % de tus recaídas son
viernes o sábado»*. Ese dato vale más que cualquier regaño.

### Modo discreto

Un hábito puede marcarse como **privado**. Entonces la app muestra su **alias**
en lugar del nombre real, y nada más cambia.

Ese «nada más cambia» es el punto entero. Un hábito privado lleva un emoji
normal, elegido por el usuario, igual que los demás. No lleva candado, ni punto
gris, ni cursiva. Cualquier marca distintiva delataría que ahí hay algo
escondido, que es justo lo contrario de lo que se busca: lo que se quiere es que
un hábito privado sea **indistinguible** de los otros en una mirada de reojo.

Está implementado con tres decisiones:

- Una sola función, `mostrarNombre(habito)`, decide qué texto se ve. Ninguna
  pantalla lee `habito.nombre` directo. Es una regla del proyecto, no una
  costumbre.
- El interruptor de «mostrar nombres reales» vive **en memoria y no se
  persiste**: cada vez que la app arranca, nace apagado. Nadie tiene que
  acordarse de volver a taparlo antes de cerrar.
- El interruptor es el **segundo parámetro opcional** de `mostrarNombre`, y vale
  «apagado» si no se pasa. Así, un descuido muestra el alias y nunca el nombre
  real. La pantalla de Estadísticas se aprovecha de eso: llama a
  `mostrarNombre(habito)` a secas y por construcción no puede filtrar nada.

**Esto es discreción, no seguridad.** No cifra nada y no protege contra nadie
que tenga el teléfono desbloqueado y ganas de buscar. Evita que un nombre se lea
de reojo, y eso es todo lo que promete. Al exportar un respaldo, la app avisa en
pantalla de que el archivo sí contiene los nombres reales.

### El peso de la noche no es el mismo peso

Una báscula da entre 0.5 y 1.5 kg más por la noche que en ayunas. Si una app
mezcla las dos mediciones en la misma curva, la gráfica se llena de dientes de
sierra que no corresponden a ningún cambio real del cuerpo, y la tendencia sale
torcida.

Racha guarda el momento de cada medición y hace tres cosas con él:

- Las mediciones nocturnas se dibujan con **punto hueco**, para que se distingan
  a simple vista de las de la mañana.
- Al calcular la tendencia se les resta **0.8 kg**.
- Y se **dice en pantalla**, con una línea de texto, que ese ajuste se está
  aplicando.

Lo tercero importa tanto como lo segundo. Un ajuste silencioso es una app
decidiendo por ti qué tan gordo estás; un ajuste anunciado es una herramienta
mostrando su método. La misma idea gobierna el porcentaje de grasa corporal
estimado —fórmula de la Marina de EE.UU. a partir de cuello, cintura y
estatura—, que se presenta siempre como **estimación** y nunca como medición: lo
que sirve de ese número es la tendencia, no el valor.

### El respaldo tiene tres botones, y eso también fue una decisión

Exportar un respaldo debería ser un botón de descarga. No lo es, por una razón
que cuesta descubrir: **dentro de una PWA instalada en la pantalla de inicio de
iOS, la descarga de archivos no es confiable**. A veces deja la app atorada en
una pantalla de descarga sin salida; a veces no hace absolutamente nada, sin un
solo mensaje de error. En Safari normal funciona, así que el problema no aparece
mientras desarrollas.

Un respaldo que falla en silencio es peor que no tener respaldo: crees que lo
tienes y no lo tienes. Así que Racha ofrece **tres caminos, siempre los tres
visibles**, en lugar de elegir uno por el usuario:

1. **Compartir** — la hoja de compartir de iOS, que sí funciona dentro de la app
   instalada y lleva a «Guardar en Archivos». Es el camino bueno en el teléfono,
   y además el sistema confirma si el archivo se guardó o si se canceló.
2. **Descargar** — lo normal en la computadora.
3. **Copiar el texto** — el JSON en pantalla, con un botón de copiar. No depende
   de nada del sistema operativo. Es el que no puede fallar.

De los tres, solo el primero apunta solo la fecha del último respaldo, porque es
el único del que el sistema devuelve una confirmación real. Los otros dos
preguntan «¿ya lo guardaste?». El recordatorio de «hace más de 30 días que no
respaldas» no serviría de nada si pudiera apagarse con un respaldo que nunca
ocurrió.

---

## El stack, y por qué

| Pieza | Elección | Por qué |
|---|---|---|
| Base | Vite + React + TypeScript | TypeScript estricto, sin `any`. La app tiene reglas de negocio con aristas —rachas, comodines, semanas cerradas— y el compilador es la primera línea de defensa contra un estado imposible. |
| Estilos | Tailwind CSS | Sin archivo de estilos que mantener aparte ni nombres de clase que inventar. Para una app de una sola persona, el costo de una convención propia no se paga. |
| Persistencia | `localStorage` | Un solo documento JSON bajo una llave. Es todo lo que hace falta para un usuario y unos miles de registros, y cumple el requisito duro: los datos no salen del teléfono. |
| Fechas | `date-fns` | Funciones sueltas, sin objetos envolventes ni mutación. Ver más abajo la regla de fechas, que es lo que de verdad importa aquí. |
| Gráficas | Recharts | Componentes de React, no un canvas imperativo. Se carga aparte, no en el arranque. |
| Pruebas | Vitest | Solo la lógica, nunca la interfaz. Corre en el mismo Vite, sin configuración aparte. |
| PWA | `vite-plugin-pwa` | Instalable en la pantalla de inicio y funcional sin conexión, que eran requisitos. |
| Hosting | GitHub Pages + Actions | Gratis, y basta: la app es estática y no tiene backend que desplegar. |

Cuatro reglas del proyecto valen más que la lista de dependencias:

- **Las fechas son cadenas `"YYYY-MM-DD"` en hora local.** Nunca UTC, nunca un
  timestamp para identificar un día. Un viaje a otro huso horario no debe mover
  ninguna racha. Las pruebas corren con `TZ=America/Mexico_City` a propósito: con
  un huso negativo, cualquier código que leyera un día en UTC se delata solo.
- **Todo acceso a datos pasa por `src/datos/repositorio/`.** Ningún componente
  toca `localStorage`.
- **Ningún archivo pasa de 200 líneas.** Si crece, se parte.
- **Toda lógica nueva lleva pruebas, con los nombres en español.** Son 389, y
  están escritas para poderse leer como especificación: *«es ámbar cuando se
  queda corto pero llega al mínimo: 4 de 5»*.

La interfaz no se prueba automáticamente. Es una decisión consciente: en una app
de este tamaño, las pruebas de interfaz habrían costado más de lo que valen, y lo
que de verdad puede salir mal —las rachas, el semáforo, el cierre de semanas, la
validación de un respaldo— es lógica pura y está cubierto.

---

## Correrlo localmente

Hace falta Node 20.19 o más nuevo, o cualquier 22.12 en adelante: es lo que pide
Vite 8.

```bash
git clone https://github.com/SergioVazquezArias/racha.git
cd racha
npm install
npm run dev
```

La app queda en <http://localhost:5173/racha/>. El `/racha/` del final no sobra:
es la base que necesita GitHub Pages para servirla desde una subcarpeta, y el
servidor de desarrollo usa la misma para que no haya sorpresas al publicar.

La primera vez que se abre, la app se siembra sola con ocho hábitos y dos metas
de ejemplo, con historial de relleno, para que ninguna pantalla se vea vacía. Son
datos inventados: se editan o se borran desde la propia app.

Otros comandos:

```bash
npm test         # las 389 pruebas
npm run test:mirar   # las pruebas en modo vigilancia
npm run lint
npm run build    # compila a dist/
```

Cada push a `main` corre las pruebas y, si pasan, publica. Si una falla no se
publica nada.

### Cómo está organizado

```
src/
  logica/      funciones puras: rachas, semáforo, tendencias, validaciones
  datos/       el repositorio (único acceso a localStorage) y los datos de ejemplo
  pantallas/   las cuatro pantallas, Ajustes y los proveedores de contexto
  componentes/ las piezas que las pantallas arman
  tipos/       los moldes de datos
docs/
  arquitectura.md   la especificación completa
```

`src/logica/` no importa nada de React y no toca el navegador. Ahí vive todo lo
que puede estar mal de verdad, y por eso es lo que está probado.

La especificación completa —el modelo de datos, las reglas del semáforo, los
comodines, el modo discreto y las diez fases en que se construyó— está en
[`docs/arquitectura.md`](docs/arquitectura.md).

---

## Lo que no hace, a propósito

- **No hay notificaciones push.** Requerirían un servidor, y eso rompe el costo
  cero y el «los datos no salen del teléfono». Se sustituyen con un Atajo de iOS.
- **No hay sincronización ni copia en la nube.** Los datos viven en un teléfono.
  El respaldo manual es la red de seguridad, y de ahí que el recordatorio de los
  30 días exista.
- **No hay cuentas ni multiusuario.** No es un producto.
- **El modo discreto no es seguridad.** Está dicho arriba y se repite aquí porque
  es la clase de cosa que conviene no malentender.
- **No hay gamificación**: ni insignias, ni niveles, ni puntos. La racha y el
  porcentaje de cumplimiento son los únicos números, y el segundo existe para
  contradecir al primero cuando haga falta.

---

Escrito en español de principio a fin —interfaz, comentarios, nombres de dominio,
pruebas y mensajes de commit— porque el usuario que lo dirige no programa, y
tenía que poder leer y auditar lo que se estaba construyendo para él.
