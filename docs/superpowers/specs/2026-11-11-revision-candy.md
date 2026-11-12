# Revisión Candy Crush — rama `la-voute` vs `upstream/main` (11/11/2026)

**Veredicto: CAMBIOS.** Build verde (`npm run build`, dist 2f2f27e). Suite: `Test Files 10 failed | 156 passed (166) · Tests 19 failed | 1908 passed | 13 skipped (1940)`.

## Bloqueos
1. **El diseño vigente no se cumple (decisión Ama 11/11).** Siguen las 5 salas clonadas: `shared/voute-residentes.ts:11` (`VOUTE_SALAS` Camarín/Mesa VIP/Barra/Cabina/Salón), inyectadas en `server/model/office.ts` (~964) y en `client/src/net/voute-estado.ts:36-46`; el test `server/model/model.test.ts` las fija (`porSala.size === 5`). Falta: repartir por oficio en las 6 salas de siempre, botón «+ Agente» (no existe en `client/src/ui/voute.ts`), y que LV transforme esas 6 en cabaret (entrada, barra, maquillaje, privados, escenario, habitación de Anaïs).
2. **El nombre «Ele» es frágil:** `server/model/office.ts:989` lo decide por el basename del path de la sala == `lavoutedanais`. Un worktree, un clon con otro nombre o un cwd en una subcarpeta lo rompen. Mejor por cwd que contenga la raíz del repo o por config explícita.
3. **Aliasing:** `office.ts:991` `a.parts = ele.parts` comparte el objeto del roster (en `addSub` sí se copia). Además muta el agente real en cada `commit()`, y el nombre queda puesto aunque se apaguen los residentes. Copiar (`{ ...ele.parts }`) y aplicarlo en la vista, no en el estado.

## Observaciones (no bloquean)
- `server/index.ts:118` `residents: true` fijo: siempre encendido, sin opción.
- `voute-estado.ts:48` en demo, a las residentes les pega el estado de las principales por índice, al azar.
- `addSub` con rol fijo: dos Chanel reales se llaman igual (lo asume el test); confirmar que es lo deseado.
- `art/voute.ts`, `theme.ts` (WIP R3): compilan y sus tests pasan; no revisé el render visual.

## Las cuatro preguntas
- **¿Hace lo que dice el plan?** Hace el plan del 11/11 por la mañana, no las decisiones nuevas (bloqueo 1).
- **¿Usa lo que ya existía?** Sí: `NameStore`, `hash32` compartido en el cliente (aunque `voute-residentes.ts:29` duplica `hash32` en vez de importar `shared/hash`).
- **¿Rompe algo fuera?** No. Los 19 rojos están en archivos que el diff no toca (deliveries, http/remote, whisper, spawn, world/http|settings|uplink): permisos 600, openssl y docker en Windows. El diff del servidor solo toca `office.ts` e `index.ts`. No corrí upstream en worktree (costaba un npm install): la conclusión sale del diff.
- **¿Los tests prueban comportamiento?** Sí (residentes, asiento ocupado, look fijo, filtro de vista). Pero el test de las 5 salas fija el diseño que hay que cambiar.

## Seguridad y contenido
- Sin endpoints nuevos, sin `innerHTML`/`eval`/fetch en `ui/voute.ts`; el estado vive en localStorage. Sin riesgo nuevo.
- Sin desnudos ni texto explícito (el spec lo prohíbe). Sin credenciales ni rutas locales. Lo único personal: nombres internos del equipo y el usuario de GitHub del fork, que ya es público.

## Revisión 2: commits 2c0dcdd y 2f2f27e (11/11/2026)

Leído con `git show` línea a línea en lo que toca al modo normal (layout, iluminación, sim, seasonal, render, caches, estado). Suite: `npx vitest run client` → **68 archivos, 775 tests, todos verdes**. `npm run build` → verde (`dist/build.json e04ed36c04a6`).

**Veredicto: CAMBIOS.**

### Bloqueos
1. **Contradice la decisión de la Ama del 11/11.** Ella pidió que el botón transforme las 6 salas en entrada, barra, sala de maquillaje, privados, escenario y habitación de Anaïs. El diseño entrega 5 estilos de oficina-cabaret (`client/src/art/voute.ts:41`, `shared/voute-residentes.ts:12-16`: camarín, VIP, barra, cabina, salón). Faltan el escenario y la habitación de Anaïs, y la sala 6 sale por módulo (`client/src/world/layout/room.ts`, `VOUTE_SLOT_STYLES`). Además el test `voute-world.test.ts:62` deja amarradas las 5 salas.
2. **`roomTheme` dejó de depender del modo.** `client/src/art/theme.ts:50` (2f2f27e quitó `isVoute() &&`): en modo normal una sala con id `voute:*` toma `THEMES[fijo]` y no `THEMES[seed % n]`. Con las ids de siempre el upstream no cambia, pero nuestras salas en modo normal ya no se ven como el upstream las sortea. El test `voute-world.test.ts:126` no lo detecta porque solo mira `floors[0].kind` y descarta dos colores.

### Lo que está bien (con evidencia)
- **El modo normal es idéntico al upstream** en layout del núcleo, corredor, exterior, paredes, render, seasonal y luz: todo cambio queda detrás de `isVoute()` con la rama `else` byte a byte igual (`world/layout/core.ts`, `corridor.ts`, `exterior.ts:35-59`, `render/seasonal.ts:23-53`, `render/lighting.ts`, `render/renderer.ts`, `art/surfaces/walls.ts`). Las cachés de sprites llevan el prefijo `v|` (`art/index.ts`) y `coreAreas` se recalcula al cambiar el modo (`layout/building.ts`), así que no quedan restos.
- **`sim.ts`:** el único cambio pasa el id a `roomTheme` (`sim/sim.ts:256`). La sim y los caminos no cambian. En modo LV las salas se reemplazan por `layoutVouteRoom`, con asientos propios, y el test :62 verifica que se puedan recorrer.
- **Rendimiento:** `isVoute()` es una lectura de bandera. Lo único nuevo por frame es un `drawImage` de brillo por planta o mueble en `lighting.ts`, y solo en modo LV. Es aceptable.
- **Sin desnudos:** los looks LV de `shared/voute-agentes.ts` son chaqueta, blusa, falda o short.

### Menores (no bloquean)
- `VOUTE_THEMES = Object.assign(array, {camarin…})` (`art/theme.ts`) mezcla un arreglo con claves, cuando bastaba un objeto con nombre.
- `getSeason` en `render/seasonal.ts:23` repite la guarda de `world/api.ts` (`seasonalThemeFor` ya devuelve `'none'` en LV). Una de las dos sobra.
- `cabaret.ts` tiene 1043 líneas y 2c0dcdd trae 31 archivos sin un plan revisado: está sobredimensionado para un tema visual.
- La inyección de salas demo en `net/voute-estado.ts` (2f2f27e) solo corre con el botón encendido. Está bien, pero sus tests no la cubren.
- Los tests de muebles (`art/voute-furniture.test.ts:61,132`) prueban que existen y que son distintos, no cómo se comportan. Los de layout y temporada sí prueban comportamiento.

## Revisión 3: commits 91af482, 0488112, f088eab y 7ee47d6 (12/11/2026)

Leído `git diff 0bdfe35..7ee47d6` (39 archivos). `npm run typecheck` → verde. `npm run build` → verde (`dist/build.json 7ee47d655438`). `npx vitest run` → `Test Files 2 failed | 165 passed (167) · Tests 2 failed | 1951 passed | 2 skipped (1955)`. Los dos rojos (`server/test/statusline.test.ts:314`, `server/world/uplink.test.ts:410`) también fallan en `origin/main` (`faa1a01`, corrido en un worktree aparte: `2 failed | 47 passed`), y el diff no toca esos archivos.

**Veredicto: PASA.**

### Datos verdaderos hacia el World (lo primero)
- **El servidor ya no inventa nada.** `server/model/office.ts:993` arma `agents: [...real, ...demoAgents]`: salieron `residentesAusentes`, `VOUTE_SALAS`, el nombre de Ele y el nombre o look fijo en `addSub`. `server/index.ts` ya no pasa `residents: true`. `server/model/model.test.ts` lo prueba: sin agentes reales el snapshot sale vacío, y una principal en `LaVouteDAnais` no se renombra ni trae nada `voute:*`.
- **Nada del servidor ni de `shared/world/` importa los módulos voute** (`server/voute-aislada.test.ts`, verde; lo confirmé con grep).
- **`shared/timeline.ts:234` solo restringe.** `isDemoId` ahora devuelve `true` para más ids, y todos sus llamadores lo usan para sacar algo: la proyección (`shared/world/projection.ts:138-141`), el uplink (`server/world/uplink.ts:704`), el historial (`server/history/timeline.ts:88`), `server/index.ts:371` y, en el cliente, la terminal, renombrar sala, spawn y el editor de personaje. Ninguno usa `isDemoId` para agregar o inflar datos. Un id real no puede empezar con `voute:`, porque las salas son rutas o alias y los agentes son `acc:`/sesión. Los tests `shared/world/projection.test.ts` (La Voûte nunca entra) y `shared/timeline.test.ts` fallarían sin el cambio, así que prueban comportamiento.
- **La vista no sube nada.** `aplicarVoute` corre solo en `OfficeStore.setSnapshot` (`client/src/net/store.ts:397`). Las llamadas del cliente al World (`client/src/net/world.ts:368-439`) no llevan agentes ni salas, y la visita usa un store propio sin vista (`client/src/world/visit/index.ts:81`).

### ¿Puede una sala real quedar tapada o corrida? Tapada no. Corrida, sí, en la carga inicial.
Trixie lo dijo al revés: ninguna sala real pierde su lugar frente a una inventada. `aplicarVoute` (`client/src/net/voute-estado.ts:111`) le da a las salas `voute:*` solo los slots que no usa ninguna real, y el test `voute-estado.test.ts:60` prueba que no se repiten. Además el Sim asigna su propia vaga en el edificio: el slot del servidor solo da el orden (`client/src/world/sim/sim.ts:177-178, 260-274`). Hay un efecto que no bloquea: en la carga inicial las seis salas del cabaret se intercalan en los huecos entre las reales (una real con slot 2 cae en la vaga 2 y no en la 1), y un proyecto nuevo se abre después de las seis. No hay solape.

### Reconocimiento de Ele
`esDeEle` (`voute-estado.ts:91`) busca el tramo `lavoutedanais` en cualquier parte de la ruta o un prefijo configurado en `habblaud:voute-ele`. Toma solo la primera principal que calce. Cubre worktrees y subcarpetas, y rechaza `lavoutedanais-viejo` (test `voute-estado.test.ts:103`). El look es una copia, porque `vouteAgente` devuelve `copia` (`shared/voute-agentes.ts:72`), y no se toca el estado del servidor. Los bloqueos 2 y 3 de la revisión 1 quedan cerrados.

### Bloqueos anteriores
- R2-1 (diseño del 11/11): cerrado. Hay seis salas por oficio (`shared/voute-residentes.ts:15`) con nombre de oficina en modo normal y nombre de cabaret con LV. Las seis tienen layout propio: entrada con cordón (`stanchion`), barra, maquillaje, privados, escenario con `stage_piano` y habitación de Anaïs con `canopy_bed` (`client/src/world/layout/voute-rooms.ts`). El botón «+ Agente» está en `client/src/ui/voute-agregar.ts`, y `voute-world.test.ts:74` prueba que los seis espacios existen, son distintos y se pueden recorrer.
- R2-2 (`roomTheme`): cerrado. Volvió a depender del modo (`client/src/art/theme.ts:47`), y en modo normal `roomTheme(1,'voute:maquillaje')` es igual a `roomTheme(1)` (test `voute-surfaces.test.ts`).
- Botón LV pequeño (orden del 12/11): se cumple. `client/src/ui/voute.ts` y su CSS no cambian; «+ Agente» es igual de discreto (26 px, `styles.css`).

### Las cuatro preguntas
- **¿Hace lo que dice el plan?** Sí. Todo lo de fuera del estado (luz, neón ×3, calle, globos, pisos más claros) viene de la revisión de Barbie y queda detrás de `isVoute()`. En modo normal, `overlay.ts` y `lighting.ts` dan lo mismo que antes, y `SO_VOUTE` en `art/furniture/index.ts` solo dibuja muebles que las salas de oficina no usan.
- **¿Usa lo que ya existía?** Sí. Usa `hash32` de `shared/hash` (ya no lo duplica), `parseCharacterName` y `NAME_MAX` para el nombre de «+ Agente», y el `isDemoId` que ya existía en vez de un filtro nuevo.
- **¿Rompe algo fuera?** No. Typecheck y build pasan, y los dos rojos son de `origin/main`.
- **¿Los tests prueban comportamiento?** Sí. Hay que ajustar dos tests, pero lo hicieron siguiendo el diseño y no para que pasaran: el de las 5 salas pasó a 6, y el del nombre fijo en el servidor ahora prueba que el servidor no los pone.

### Menores (no bloquean)
- El orden de las salas en la carga inicial (ver arriba). Si se quiere que las reales queden igual que en upstream, las salas `voute:*` pueden ir después del slot real más alto.
- La vista también se aplica a los cuadros del timelapse (`store.ts:397`), así que en la repetición se ven residentes que el historial no tiene. Es solo de la pantalla.
- Una sub con role del equipo cambia de nombre solo en la vista. El feed o el historial que salen del servidor pueden mostrar el nombre sorteado.
- `habblaud:voute-ele` no tiene interfaz: hoy se configura a mano desde la consola.
- Con LV, una sala real toma un estilo de cabaret según su slot (`client/src/world/layout/room.ts:76`) y puede repetir uno de los seis espacios.
- `server/voute-aislada.test.ts` no detecta un import con extensión (`voute-residentes.js`). Hoy no hay ninguno.
