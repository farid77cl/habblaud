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
