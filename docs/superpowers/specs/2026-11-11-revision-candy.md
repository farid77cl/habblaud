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
