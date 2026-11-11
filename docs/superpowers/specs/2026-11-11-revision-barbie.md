# Revisión de Barbie: cabaret La Voûte (commits 2c0dcdd y 2f2f27e)

11/11/2026. Mirado en vivo en http://127.0.0.1:4747, rama `la-voute`, escritorio 1440 × 900 y móvil 420 × 860, con Playwright (Python). Medidas tomadas del DOM con `getBoundingClientRect` y `getComputedStyle`. No se corrió `ver_pantalla.py` (la página es un canvas vivo con WebSocket; el contraste de los textos del canvas no se puede medir así y queda a ojo, dicho como tal).

Capturas (en `capturas/`):
- `rev_normal.png`: modo normal, escritorio.
- `rev_lv.png`: botón LV encendido, escritorio.
- `rev_lv_movil.png`: botón LV encendido, 420 px.

Medida contra: el spec `2026-11-11-cabaret-barbie.md` y la decisión de la Ama del 11/11 (modo normal = oficina de siempre con nuestras agentes en 6 salas + botón «+ Agente»; LV = esas 6 salas pasan a entrada con cordón VIP, barra, sala de maquillaje, privados, escenario con piano y mesas, habitación de Anaïs; exterior de noche con neón; sin desnudos).

## Veredicto: RETENIDA

El cambio de mundo sí existe y se nota de un vistazo (de pasto verde de día a asfalto negro, burdeos y dorado). Pero no es el mapa que pidió la Ama y el botón no cumple el spec.

## Lo que se mantiene (pasa)

- **Se nota de un vistazo:** normal y LV son dos mundos distintos, no solo una paleta. Se apagan el pasto y los árboles, aparecen faroles y alfombras rojas (`rev_normal.png` vs `rev_lv.png`).
- **Modo normal limpio:** la oficina de siempre, con las 6 salas de agentes (LaVouteDAnais, Mesa VIP, Cabina, Camarín, Barra, Salón) y las comunes de siempre.
- **El botón no se tapa:** el punto central del botón devuelve el propio botón con `elementFromPoint`, en normal y en LV, en escritorio y en móvil. Está en la barra superior, a la izquierda de zoom/ajustes, como pide el spec.
- **Contraste del botón:** texto `#d8c8b8` sobre fondo casi negro (apagado) y `#f3e6d0` sobre burdeos `rgba(110,26,48,.82)` (encendido): ambos sobre 7:1 a ojo de cálculo.
- **Sin desnudos** en lo que se ve a este zoom.
- Las etiquetas de sala (texto blanco sobre negro) se leen bien en los dos modos.

## Reparos críticos

1. **Las 6 salas no son los 6 espacios de la Ama (LV, escritorio).** Las salas de agentes conservan sus nombres (LaVouteDAnais, Mesa VIP, Cabina, Camarín, Barra, Salón) y lo que cambió de nombre son las comunes (Vestíbulo, Petit Bar, Tocadores, Foyer Rouge). No se reconoce: entrada con cordón VIP (no hay cordón ni postes en ninguna sala), sala de maquillaje (LaVouteDAnais y Camarín se ven iguales, burdeos con espejos), escenario con piano y mesas (el piano parece estar en Foyer Rouge, una sala común, no en una de las 6), ni habitación de Anaïs (no hay cama ni nada que la nombre). Sí se reconocen barra (Barra, botellas) y privados (Cabina, reservados). Resultado: 2 de 6.
2. **Falta el botón «+ Agente» en modo normal.** No existe ningún botón con ese texto en el DOM.
3. **Botón LV bajo la medida del spec.** Mide 43 × 26 px (apagado) y 52 × 26 px (encendido), con letra 11,5 px. El spec pide alto 36 px, área táctil ≥ 44 × 44 y letra 0,875 rem (14 px). Y en escritorio dice «LV»: el texto «La Voûte» solo debía acortarse bajo 480 px.
4. **Encendido vs apagado casi no se distingue en el botón.** El cambio es de fondo oscuro a burdeos oscuro más un punto diminuto; con el canvas también oscuro, el estado se adivina por el mundo, no por el botón. El color no debe ser la única señal: falta palabra o forma clara (por ejemplo «La Voûte ✓» o el texto del estado).
5. **Exterior: noche sí, neón apenas.** El letrero «LA VOÛTE» es de unos 50 × 12 px, rosa sobre negro, en dos puntos; a zoom por defecto casi no se lee. La calle, la vereda y el pasto se funden en un solo negro: el edificio flota sin suelo.
6. **El globo de estado de un agente se pierde en LV.** «Ejecutando pruebas» (claro y legible en normal) queda gris translúcido sobre burdeos en LaVouteDAnais: ilegible a ojo.
7. **Interiores muy oscuros y parecidos entre sí.** Cinco de las seis salas comparten el mismo damero burdeos con detalles dorados; a zoom por defecto los muebles no se reconocen ni las agentes destacan. En móvil (420 px) el mapa queda diminuto en un mar negro.

## Lo que necesita Trixie (sin adivinar)

- Mapear las 6 salas de agentes a los 6 espacios de la Ama, cada uno con su mueble que lo nombra: cordón VIP con postes dorados (entrada), barra con taburetes, tocadores con espejos de bombillas (maquillaje), reservados con cortina (privados), tarima con piano y mesas redondas (escenario), cama con dosel (habitación de Anaïs). Rotular la sala con el nombre del espacio en LV.
- Agregar «+ Agente» en modo normal.
- Botón: alto 36, área táctil 44 × 44, letra 14 px, «La Voûte» en escritorio, estado encendido con palabra o forma además del color.
- Neón del exterior al menos 3 veces más grande, con halo; suelo de la calle con un tono distinto del pasto nocturno.
- Globos de estado con fondo opaco claro también en LV.
- Subir la luz de los interiores (más contraste de muebles y agentes contra el piso).

Prueba de 5 segundos (hipótesis cualitativa): ¿qué es? un club de noche, sí. ¿es para mí? sí. ¿qué hago ahora? no se sabe cómo volver: el botón encendido no lo dice.
