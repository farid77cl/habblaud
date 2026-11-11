# La Voûte: la oficina se vuelve cabaret (spec de diseño, Barbie, 11/11/2026)

Sale del spec aprobado `2026-11-11-la-voute-design.md` (mapa de habitaciones). Reclamo de la Ama: «no veo grandes cambios en la decoración». Hoy el botón solo cambia la paleta del CSS; el mundo (canvas) no cambia.

## Contrato de pantalla
- **Quién y para qué:** la Ama mira la oficina y con un toque la convierte en el cabaret.
- **Primera mirada:** el exterior oscuro con el letrero neón rosado «La Voûte»; luego, salas burdeos con brillos.
- **Acción principal:** un toque al botón «La Voûte» (arriba, junto a zoom/ajustes).
- **Prohibidos:** solo recolorear (lo de hoy); pasto o árboles verdes de noche; muebles de oficina con otro tinte (un escritorio blanco teñido de rosa no es un tocador); botón tapado por el panel izquierdo; cualquier desnudo (el fork es público).
- **Prueba de terminado:** dos capturas de la oficina completa (normal y Voûte) a zoom por defecto, una por sala en Voûte y el botón en sus 4 estados.

## Regla de implementación (para Trixie)
Un flag `voute` llega al render (`world/render`, `art/theme.ts`, `art/furniture/*`). Con `voute=true`:
1. `roomTheme(seed)` devuelve `VOUTE_THEMES` según el tipo de sala (tabla abajo) en vez de `THEMES`.
2. Cada `kind` de mueble se traduce por `VOUTE_SWAP` (abajo) a un sprite nuevo en `art/furniture/cabaret.ts`. **Mismo footprint en tiles y mismo punto de asiento/uso** que el original: no se toca `layout/` ni `path/`, y las agentes siguen caminando y sentándose igual.
3. `layout/exterior.ts`: con `voute`, `grass` pasa a `asphalt`, se omiten las props `tree`, `pine`, `bush` y `flowers` y lo estacional (`seasonal.ts`: tree, gift, wreath, pumpkin...), y se agregan `neonSign` sobre la puerta, 4 `streetLamp` y el cordón VIP.
4. `render/lighting.ts`: tinte nocturno global y luces puntuales rosadas y doradas (abajo).

## Paleta Voûte (tokens)
| Token | Hex | Uso |
|---|---|---|
| `burdeos-900` | `#2a0a12` | sombra de piso, contorno |
| `burdeos-700` | `#5a1426` | piso terciopelo (carpet) |
| `burdeos-600` | `#6e1a30` | piso alternado (carpet2) |
| `burdeos-500` | `#8c2240` | tapizado, cortinas, alfombras |
| `negro-900` | `#0d0a0c` | paredes base, cielo de noche |
| `negro-700` | `#1e1619` | paneles, muebles lacados |
| `rosa-neon` | `#ff3fa4` | neón, letrero, bordes de luz |
| `rosa-glow` | `#ff8fcf` | halo del neón, reflejos |
| `dorado` | `#d4a64a` | molduras, metales, marcos |
| `dorado-luz` | `#ffe08a` | bombillas, brillos puntuales |
| `crema` | `#f3e6d0` | letra sobre oscuro, estrellas |
| `asfalto` | `#1b1a20` + `#24232b` | calle y explanada (dither) |
| `vereda` | `#2a2830` | vereda |
| `linea-calle` | `#c9a447` | líneas de la calle (sin brillo) |

Contraste calculado con la fórmula WCAG (no medido en pantalla): `rosa-neon` sobre `negro-900` ≈ 6,3:1; `dorado-luz` sobre `burdeos-700` ≈ 11:1; `crema` sobre `negro-700` ≈ 15:1; `negro-900` sobre `rosa-neon` (botón encendido) ≈ 6,3:1.

## Superficies por sala (`VOUTE_THEMES`, reemplaza a `THEMES`)
| Sala (hoy → cabaret) | carpet / carpet2 | wall.base / trim | pattern | accent |
|---|---|---|---|---|
| Puestos → Camerino de tocadores | `#5a1426` / `#6e1a30` | `#1e1619` / `#d4a64a` | stripes | `#ffe08a` |
| Reuniones → Reservado VIP | `#2a0a12` / `#5a1426` | `#0d0a0c` / `#d4a64a` | wood_panel (lacado negro) | `#d4a64a` |
| Cocina → Barra | `#1e1619` / `#2a0a12` (damero) | `#0d0a0c` / `#ff3fa4` | brick (ladrillo oscuro) | `#ff3fa4` |
| Salón → Salón de sofás | `#6e1a30` / `#8c2240` | `#1e1619` / `#d4a64a` | stripes | `#ff3fa4` |
| Recepción → Vestíbulo con telón | `#5a1426` / `#2a0a12` | `#0d0a0c` / `#d4a64a` | plain | `#ffe08a` |
| Baños → Camerinos privados | `#2a0a12` / `#1e1619` | `#1e1619` / `#ff8fcf` | plain | `#ff8fcf` |
| La Voûte (sala propia) | `#5a1426` / `#8c2240` | `#0d0a0c` / `#ff3fa4` | stripes | `#ff3fa4` |

En todas: `deskVariant: 'vanity'`, `chairVariant: 'velvet'`.

- **Alfombras** (`surfaces/rug.ts`): fondo `#8c2240`, borde dorado `#d4a64a` de 1 px y una fila de rombos `#ff3fa4` cada 4 px.
- **Pasillos** (`layout/corridor.ts`): alfombra roja `#8c2240` con dos bordes `#d4a64a`.
- **Zócalo de pared:** 1 px `#d4a64a` en el trim y, cada 8 px, un aplique de pared con bombilla (ver Luces).

## Tabla mueble → mueble de cabaret (`VOUTE_SWAP`)
| Original | Cabaret | Cómo se dibuja (pixel art) |
|---|---|---|
| `desk` / `deskBack` | **Tocador con espejo** | Cubierta `#1e1619` con canto `#d4a64a`; espejo `#3a2a40` con reflejo diagonal `#ff8fcf` de 1 px; marco con 5 bombillas `#ffe08a` (ver Luces); frascos de 1×2 px rosa y dorado. El monitor desaparece. |
| `officeChair` / `officeChairFront` | **Taburete de tocador** | Asiento redondo `#8c2240`, pata `#d4a64a` |
| `meetingTable` | **Mesa VIP** | Mantel `#2a0a12` con borde `#d4a64a`, cubeta dorada con botella, 2 velas `#ffe08a`; detrás, cortina de terciopelo `#8c2240` con pliegues `#5a1426` cada 3 px y cordón dorado |
| `counter` / `counterSink` | **Barra** | Frente `#1e1619` con riel dorado; tope `#5a1426` lacado con brillo de 1 px `#ff8fcf` |
| `coffeeMachine` / `microwave` | **Botellero** | Repisa negra con 4-5 botellas (`#1f4a3a`, `#b0662a`, `#ff3fa4`) y brillo blanco de 1 px |
| `fridge` / `vendingMachine` | **Rocola** | Caja `#1e1619` con arco de neón `#ff3fa4` (2 cuadros de animación) |
| `cafeTable` | **Mesa de cóctel** | Tope redondo dorado, copa rosa |
| `cafeChair` / `stool` | **Taburete de barra** | Asiento `#8c2240`, pata dorada alta |
| `sofa` / `armchair` / `beanbag` | **Sofá capitoné rojo** | `#8c2240` con botones `#5a1426` en damero de 3 px, patas doradas |
| `coffeeTable` | **Mesa baja con champaña** | Vidrio `#1e1619`, 2 copas `#ffe08a` |
| `pingpongTable` / `arcade` | **Piano de cola negro** (recomendado) o **escenario** | Piano `#0d0a0c` con brillo `#ff8fcf`; o tarima `#1e1619` con fila de focos `#ffe08a`. Sin pole: el fork es público. |
| `receptionDesk` | **Taquilla y guardarropa** | Mostrador `#1e1619`, ventanilla dorada, campana `#ffe08a` |
| Ascensor / puerta principal | **Telón con foco** | Telón `#8c2240` de 2 hojas, cenefa dorada, cono de luz `#ffe08a` al 20 % sobre el piso |
| Servidores / `printer` / `filingCabinet` | **Cabina de luces y sonido** | Consola negra con 6 leds alternando `#ff3fa4` y `#ffe08a`; parlante con cono `#d4a64a` |
| `toiletStall` | **Camerino con biombo** | Biombo de 3 hojas `#5a1426` con marco dorado; mismo estado puerta abierta/cerrada que el cubículo |
| `sink` | **Espejo de camerino** | Espejo vertical con 6 bombillas alrededor |
| `bookshelf` / `binderShelf` | **Perchero de vestuario** | Barra dorada con 3 prendas colgadas (boa rosa, capa burdeos, sombrero de copa); sin cuerpos |
| `plantSmall` / `plantTall` | **Pedestal con boa / candelabro** | Pedestal dorado con boa `#ff3fa4`, o candelabro de 3 velas |
| `floorLamp` | **Lámpara de flecos** | Pantalla `#8c2240` con flecos dorados y halo `#ffe08a` |
| `waterCooler` / `trashBin` | **Hielera dorada / cenicero de pie** | Cilindro `#d4a64a` |
| `glassPartition` | **Cortina de cuentas** | Hilos verticales cada 2 px, cuentas `#ff8fcf` y `#d4a64a` |
| `bench` (exterior) | **Poste de cordón VIP** | Dos postes dorados con cordón `#8c2240` |

## Luces y brillos (pixel art, sin desenfoque)
- **Tinte nocturno:** capa multiplicativa `#3a1a3a` al 35 % sobre el mundo; las fuentes de luz se dibujan encima y no se tiñen.
- **Bombilla:** 1 px `#ffe08a` + cruz de 4 px `#ffe08a` al 40 %.
- **Neón:** trazo 1 px `#ff3fa4`, halo 1 px `#ff8fcf` al 50 % y segundo halo 1 px al 20 %. Parpadeo: cada ~6 s se apaga 120 ms.
- **Foco del telón:** trapecio `#ffe08a` al 20 %, fijo.
- **Leds de cabina:** alternan cada 500 ms.
- **Reducir movimiento** (`prefers-reduced-motion`): sin parpadeo ni alternancia; todo fijo encendido.

## Exterior de noche
- `grass` pasa a `asphalt` (`#1b1a20` con dither `#24232b` cada 3 px); vereda `#2a2830`; calle igual, con líneas `#c9a447`.
- **Se quitan:** `tree`, `pine`, `bush`, `flowers` y todo lo estacional (árbol de navidad, regalos, guirnaldas, calabazas). También sus luces en `lighting.ts:611`.
- **Se agregan:** letrero neón **«La Voûte»** sobre la fachada, centrado en la puerta, con `pixelfont` a 2× en `#ff3fa4` con halo y una estrella dorada; 4 faroles (`streetLamp`: poste `#1e1619`, luz `#ffe08a`, cono al 15 %); alfombra roja de la vereda a la puerta entre dos postes de cordón VIP.
- **Cielo:** `#0d0a0c`, 8-10 estrellas fijas de 1 px `#f3e6d0`.

## Botón «La Voûte»
- **Posición:** en la barra superior derecha, en el mismo grupo que zoom y ajustes, a su izquierda. Nunca sobre el canvas ni donde lo tape el panel izquierdo. Bajo 480 px de ancho, el texto se acorta a «LV» y el botón se queda.
- **Tamaño:** alto 36 px con área táctil ≥ 44 × 44 px (padding invisible), letra 0,875 rem, el mismo radio que los otros botones de la barra.

| Estado | Fondo | Texto y borde | Contenido |
|---|---|---|---|
| Apagado (oficina) | `#1e1619` | texto `#f3e6d0`, borde 1 px `#d4a64a` | ✦ dorado + «La Voûte» |
| Hover / foco | `#2a0a12` | borde 2 px `#ff3fa4`, anillo de foco 2 px `#ff8fcf` | igual |
| Encendido (cabaret) | `#ff3fa4` | texto `#0d0a0c`, borde `#ffe08a` | ✦ + «La Voûte» + punto ● (el estado no lo dice solo el color: también el punto y `aria-pressed="true"`) |
| Cambiando | el del destino | — | fundido a negro del canvas de 300 ms y vuelta (0 ms con reducir movimiento); botón deshabilitado durante el fundido |

- **Título:** apagado «Entrar a La Voûte»; encendido «Volver a la oficina».
- **Lector de pantalla:** `aria-live="polite"` anuncia «La Voûte activada» / «Oficina de vuelta».
- **Memoria:** sigue en localStorage (`net/voute-estado.ts`, ya existe).

## Hoy → propuesto
| Archivo | Hoy | Propuesto |
|---|---|---|
| `client/src/ui/voute.ts` | botón fijo en esquina; solo pone una clase CSS | montarlo dentro del grupo zoom/ajustes; estados de la tabla; fundido |
| `client/src/art/theme.ts` | `THEMES` (10 temas claros) | + `VOUTE_THEMES`; `roomTheme(seed, voute)` |
| `client/src/art/furniture/cabaret.ts` | no existe | los sprites de `VOUTE_SWAP` |
| `client/src/art/furniture/index.ts` | despacho por `kind` | con `voute`: `VOUTE_SWAP[kind] ?? kind` |
| `client/src/art/surfaces/rug.ts`, `floor.ts` | paleta de oficina | variantes `velvet` y `asphalt` |
| `client/src/world/layout/exterior.ts` | pasto y árboles | con `voute`: asfalto, sin vegetación, neón, faroles, cordón |
| `client/src/art/seasonal.ts` | navidad y halloween | apagado con `voute` |
| `client/src/world/render/lighting.ts` | luces de día | tinte nocturno + fuentes rosadas y doradas |

## Prueba de los 5 segundos (hipótesis cualitativa, no estadística)
¿Qué es? Un club de noche: asfalto, neón y burdeos. ¿Es para mí? Sí, el letrero dice «La Voûte». ¿Qué hago ahora? El botón encendido con su punto dice cómo volver.

## Prototipo y medición
- Prototipo: `cabaret-prototipo.html` (camerino de tocadores, barra y exterior, más el botón en sus estados).
- No corrí `ver_pantalla.py` (vive en otro repo); los contrastes de arriba son calculados. La medición queda para cuando compare la captura real de Trixie contra este spec (veredicto PASA / RETENIDA).
- Falta la aprobación de la Ama antes de programar.
