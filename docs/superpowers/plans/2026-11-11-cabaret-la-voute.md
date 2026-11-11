# Modo Cabaret «La Voûte» Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Habblaud pixel-art virtual office into the nocturnal cabaret **La Voûte** whenever `isVoute()` is active, implementing Barbie's full visual specification (`docs/superpowers/specs/2026-11-11-cabaret-barbie.md`) across room themes, surfaces, furniture sprites, exterior layout, lighting, and the topbar toggle button.

**Architecture:** All procedural pixel-art in `client/src/art/` and layout/rendering in `client/src/world/` remain pure and deterministic. A central state module (`client/src/art/voute.ts`) exposes `isVoute()`, `setVouteMode(on)`, the `VP` palette constants, and `vouteStyleOf(id)`. When `isVoute()` is true:
1. `roomTheme(seed, id)` returns one of the 5 cabaret themes (`VOUTE_THEMES`: Camarín, Mesa VIP, Barra, Salón, Cabina).
2. `renderFurniture` dispatches through `VOUTE_SWAP` (`client/src/art/furniture/cabaret.ts`), keeping identical footprints, anchors (`ax`, `ay`), `front` layers, and dynamic `rects` (`screen`, `board`, `glass`, `face`, `tv`, `sign`, `art`, `glow`) so pathfinding and simulation spots never break.
3. Surfaces (`floorChunk`, `renderRug`, `wallFaceTile`, `southWallTile`, `layoutCorridor`) render asphalt (`#1b1a20`/`#24232b`), crimson velvet rugs with gold borders and pink diamonds, gold wall trims with warm sconces, and corridor red carpets.
4. `layoutExterior`, `seasonal.ts`, `props.ts`, and `drawWindowView` suppress daytime vegetation and seasonal themes, replacing them with night asphalt, 4 street lamps, VIP rope posts, a «La Voûte» neon sign above the entrance, and a `#0d0a0c` starry sky.
5. `Lighting` applies a permanent nocturnal cabaret ambient (`#3a1a3a` 35% multiply), warm/pink/gold halos, neon flicker (every ~6s for 120ms), and booth LEDs (every 500ms), respecting `prefers-reduced-motion: reduce`.
6. The `.voute-toggle` button in `.ui-topbar .ui-btn-group` implements all 4 states, WCAG AAA contrast on active state, `aria-live="polite"` announcements, `<480px` short label (`LV`), and a `300 ms` canvas fade-to-black (`0 ms` with reduced motion) that rebuilds the world and invalidates caches cleanly.

**Tech Stack:** TypeScript, HTML5 Canvas 2D (`PixelBuf` procedural pixel art), CSS custom properties, Vitest.

---

## File Structure

- **Create:**
  - `client/src/art/furniture/cabaret.ts` — Cabaret pixel-art sprite generators and `VOUTE_SWAP` table for office/common/wall furniture kinds.
  - `client/src/art/voute-surfaces.test.ts` — Unit tests for `VOUTE_THEMES`, `roomTheme`, `asphalt` floor, cabaret velvet rug, gold wall trim + sconces, and corridor red carpet.
  - `client/src/art/voute-furniture.test.ts` — Unit tests verifying every `VOUTE_SWAP` sprite differs from office mode while preserving footprint, anchors, `front` layer, and dynamic `rects`.
  - `client/src/world/voute-world.test.ts` — Unit tests for cabaret `layoutExterior` (asphalt, no vegetation, neon sign, 4 lamps), seasonal suppression, and starry `#0d0a0c` window view.
  - `client/src/world/voute-lighting.test.ts` — Unit tests for cabaret night ambient (`#3a1a3a` 35% multiply), neon flicker, and reduced-motion compliance.
  - `client/src/ui/voute.test.ts` — Unit tests for `.voute-toggle` button DOM, ARIA attributes, live region announcements, and canvas fade transition.
- **Modify:**
  - `client/src/art/voute.ts` — Verify/complete palette `VP`, `isVoute()`, `setVouteMode()`, `vouteStyleOf()`.
  - `client/src/art/theme.ts` — Verify/complete `VOUTE_THEMES` and `roomTheme(seed, id)`.
  - `client/src/art/api.ts` & `client/src/art/index.ts` — Accept optional `id?: string` in `roomTheme(seed, id)` and include `isVoute()` in sprite/tile/floor/rug cache keys.
  - `client/src/world/sim/sim.ts` — Pass `r.id` to `this.art.roomTheme(r.seed, r.id)`.
  - `client/src/art/surfaces/floor.ts` — Add `asphalt` procedural chunk (`#1b1a20` base + `#24232b` dither) and map `grass` → `asphalt` when `isVoute()` is true.
  - `client/src/art/surfaces/rug.ts` — Render cabaret velvet rug (`#8c2240` center, `#d4a64a` 1px border, `#3a0f1e` inner line, `#ff3fa4` diamonds every 4px) when `isVoute()` is true.
  - `client/src/art/surfaces/walls.ts` — Force `#d4a64a` gold baseboard (`1px` with `#ffe08a` highlight) and warm sconce every 3 tiles (`col`/variant) when `isVoute()` is true.
  - `client/src/world/layout/corridor.ts` — Continuous red carpet (`#8c2240` with `#d4a64a` borders) along the corridor and `#12090e` floor in Voûte mode.
  - `client/src/art/furniture/index.ts` — Dispatch `renderFurniture` to `VOUTE_SWAP[kind]` when `isVoute()` is true.
  - `client/src/world/layout/types.ts`, `client/src/world/layout/exterior.ts`, `client/src/world/render/props.ts` — In Voûte mode, replace `grass` with `asphalt`, omit `tree`/`pine`/`bush`/`flowers`/`hedge`/`rock`/`parasol`, place 4 `lamp` props + `neon_sign` («La Voûte») + VIP entrance carpet.
  - `client/src/world/render/seasonal.ts` & `client/src/art/dynamic.ts` — Suppress all seasonal decorations/costumes in Voûte mode; render starry `#0d0a0c` night sky with 8–10 `#f3e6d0` stars in `drawWindowView`.
  - `client/src/world/render/renderer.ts` & `client/src/world/render/lighting.ts` — Dark exterior clear/vignette and red entrance carpet in `Renderer`; cabaret nocturnal ambient (`#3a1a3a` 35% multiply), warm/pink/gold halos, neon flicker, and booth LEDs in `Lighting`.
  - `client/src/ui/voute.ts`, `client/src/ui/styles.css`, `client/src/world/api.ts`, `client/src/world/index.ts`, `client/src/app.ts` — Complete button states, ARIA live region, `<480px` `LV` label, `300 ms` canvas fade, and in-place `world.rebuild()` on toggle.

---

### Task 1: Cabaret Room Themes (`VOUTE_THEMES` & `roomTheme`)

**Files:**
- Modify: `client/src/art/voute.ts`
- Modify: `client/src/art/theme.ts`
- Modify: `client/src/art/api.ts`
- Modify: `client/src/art/index.ts`
- Modify: `client/src/world/sim/sim.ts`
- Create: `client/src/art/voute-surfaces.test.ts`

- [ ] **Step 1: Write the failing test for `VOUTE_THEMES` and `roomTheme(seed, id)`**

Create `client/src/art/voute-surfaces.test.ts` testing `isVoute()`, `setVouteMode()`, `vouteStyleOf()`, and `roomTheme(seed, id)` for all 5 cabaret rooms (`voute:camarin`, `voute:vip`, `voute:barra`, `voute:salon`, `voute:cabina`).

- [ ] **Step 2: Run test to verify behavior**

Run: `npx.cmd vitest run client/src/art/voute-surfaces.test.ts`

- [ ] **Step 3: Wire `roomTheme(seed, id)` through `api.ts`, `index.ts`, and `sim.ts`, and prefix caches in `art/index.ts` with `isVoute()`**

Update `ArtModule.roomTheme(seed: number, id?: string): RoomTheme` in `client/src/art/api.ts` and `client/src/art/index.ts`, pass `r.id` in `client/src/world/sim/sim.ts`, and include `${isVoute() ? 'v|' : ''}` in `furnCache`, `tileCache`, `floorCache`, and `rugCache` keys in `client/src/art/index.ts`.

---

### Task 2: Cabaret Surfaces (Velvet Rugs, Asphalt Floor, Gold Wall Trim & Sconces, Corridor Red Carpet)

**Files:**
- Modify: `client/src/art/surfaces/floor.ts`
- Modify: `client/src/art/surfaces/rug.ts`
- Modify: `client/src/art/surfaces/walls.ts`
- Modify: `client/src/world/layout/corridor.ts`
- Modify: `client/src/world/layout/core.ts`
- Modify: `client/src/art/voute-surfaces.test.ts`

- [ ] **Step 1: Add failing surface tests to `client/src/art/voute-surfaces.test.ts`**

Test that when `setVouteMode(true)`:
1. `floorChunk('grass', 0, 0, { seed: 1 })` and `floorChunk('asphalt', 0, 0, { seed: 1 })` render dark asphalt (`#1b1a20` / `#24232b`) with zero green grass pixels.
2. `renderRug(32, 24, '#3f7fd8', 1)` renders crimson `#8c2240` center, `#d4a64a` gold border, `#3a0f1e` inner line, and `#ff3fa4` diamonds every 4px.
3. `wallFaceTile(style, variant, col)` renders `#d4a64a` gold baseboard with `#ffe08a` top highlight and warm sconce pixels (`#ffe08a`).
4. `layoutCorridor(5)` uses dark `#12090e` floor and continuous red carpet rugs (`#8c2240`).

- [ ] **Step 2: Run `npx.cmd vitest run client/src/art/voute-surfaces.test.ts` and watch it fail**

- [ ] **Step 3: Implement surface transformations in `floor.ts`, `rug.ts`, `walls.ts`, `corridor.ts`, and `core.ts`**

- In `client/src/art/api.ts`: add `'asphalt'` to `FloorKind`.
- In `client/src/art/surfaces/floor.ts`: when `isVoute()` and `kind === 'grass'`, treat as `'asphalt'`. Implement `asphalt(b, tx0, ty0, seed)` with `#1b1a20` base and `#24232b` sparse dither.
- In `client/src/art/surfaces/rug.ts`: when `isVoute()`, draw `#8c2240` body, `1px` `#d4a64a` outer border (after fringes), `1px` `#3a0f1e` inner border, and `#ff3fa4` diamonds every 4px inside.
- In `client/src/art/surfaces/walls.ts`: when `isVoute()`, use `#d4a64a` baseboard with `1px` `#ffe08a` highlight, and on `variant === 0 && col === 0` draw a warm wall sconce (`#d4a64a` bracket + `#ffe08a` bulb with soft halo).
- In `client/src/world/layout/corridor.ts` & `core.ts`: when `isVoute()`, use cabaret wall styles, `#12090e` floor, and continuous `#8c2240` red carpet runners.

- [ ] **Step 4: Run `npx.cmd vitest run client/src/art/voute-surfaces.test.ts` and verify all tests pass**

---

### Task 3: Cabaret Furniture Sprites (`VOUTE_SWAP`)

**Files:**
- Create: `client/src/art/furniture/cabaret.ts`
- Modify: `client/src/art/furniture/index.ts`
- Create: `client/src/art/voute-furniture.test.ts`

- [ ] **Step 1: Write failing tests in `client/src/art/voute-furniture.test.ts`**

Test every mapped `FurnitureKind` in `VOUTE_SWAP`:
- `desk`, `desk_back` (vanity tocador `#1c0b14` with `#d4a64a` framed mirror, 6 `#ffe08a` bulbs, `#ff3fa4` perfume bottle; preserves `rects.screen`)
- `office_chair`, `office_chair_front`, `stool`, `cafe_chair` (round tufted `#8c2240` / `#ff3fa4` stools with `#d4a64a` legs; preserves `front` where expected)
- `meeting_table` (VIP table `3x2` with `#6d0f2a` tablecloth, `#d4a64a` border, `#ffe08a` candelabra and champagne glasses)
- `counter`, `counter_sink` (`#1c0b14` bar counter with `#ff3fa4` neon strip and `#d4a64a` rail)
- `coffee_machine`, `microwave` (illuminated bottle rack with `#ff3fa4`, `#ffe08a`, `#b8e04a` bottles)
- `fridge`, `vending_machine` (classic jukebox `#2a0a12` with `#ff3fa4`/`#ffe08a` neon arch)
- `cafe_table` (round cocktail table `#1c0b14` with `#d4a64a` rim and `#ffe08a` candle)
- `sofa`, `armchair`, `beanbag` (red `#8c2240` capitoné booth/armchair/pouf with `#d4a64a` buttons)
- `coffee_table` (low `#1c0b14` table with `#d4a64a` champagne bucket)
- `pingpong_table`, `arcade` (`#0d0a0c` grand piano with `#f3e6d0` keys & `#d4a64a` candelabra / neon cabaret stage machine)
- `reception_desk` (velvet `#6d0f2a` & gold `#d4a64a` box office taquilla)
- `elevator`, `door_frame` (heavy `#6d0f2a` velvet curtains with `#d4a64a` tiebacks and `#ffe08a` top spotlight)
- `printer`, `filing_cabinet` (sound/light console `#1b1a20` with `#ff3fa4`/`#ffe08a`/`#5fd07a` faders & LEDs)
- `toilet_stall`, `sink` (burgundy/gold dressing screen biombo with `front` panel; vanity washbasin with gold hardware)
- `bookshelf`, `binder_shelf` (costume rack with `#ff3fa4`, `#8c2240`, `#ffe08a` gowns & feather boas)
- `plant_small`, `plant_tall` (feather boa pedestal / 3-arm gold `#d4a64a` candelabra with `#ffe08a` flames)
- `floor_lamp` (cabaret lamp with `#8c2240` shade, `#d4a64a` fringe, and `rects.glow`)
- `water_cooler`, `trash_bin` (gold `#d4a64a` ice bucket on stand / gold standing ashtray)
- `glass_partition` (crimson `#8c2240` & gold `#d4a64a` beaded curtain)
- `bench` (gold `#d4a64a` VIP stanchion posts with `#8c2240` velvet rope)
- Wall items: `whiteboard` (chalkboard menu with gold frame, `rects.board`), `window` (velvet-draped cabaret window, `rects.glass`), `painting` & `poster` (burlesque art in gold frame, `rects.art`), `sign` (dark gold-framed plaque, `rects.sign`), `mirror` (gold-bulb mirror, `rects.glass`).

- [ ] **Step 2: Run `npx.cmd vitest run client/src/art/voute-furniture.test.ts` to verify it fails**

- [ ] **Step 3: Implement `client/src/art/furniture/cabaret.ts` and wire `VOUTE_SWAP` in `client/src/art/furniture/index.ts`**

- [ ] **Step 4: Run `npx.cmd vitest run client/src/art/voute-furniture.test.ts` and `client/src/art/art.test.ts` to verify all pass**

---

### Task 4: Night Exterior, Neon Sign & Seasonal Suppression

**Files:**
- Modify: `client/src/world/layout/types.ts`
- Modify: `client/src/world/layout/exterior.ts`
- Modify: `client/src/world/render/props.ts`
- Modify: `client/src/world/render/seasonal.ts`
- Modify: `client/src/world/render/renderer.ts`
- Modify: `client/src/art/dynamic.ts`
- Create: `client/src/world/voute-world.test.ts`

- [ ] **Step 1: Write failing tests in `client/src/world/voute-world.test.ts`**

Test that when `setVouteMode(true)`:
1. `layoutExterior(5)` uses `'asphalt'` instead of `'grass'`, contains zero `'tree' | 'pine' | 'bush' | 'flowers' | 'hedge' | 'parasol' | 'rock'` props, places exactly 4 `'lamp'` props and 1 `'neon_sign'` prop above the entrance.
2. `slotShell(0, false)` uses `'asphalt'` and has no daytime garden props.
3. `seasonalCostume`, `seasonalFurniture`, `seasonalRugColor`, `seasonalWallStyle` return no-ops when `isVoute()` is true even if `theme` is `'christmas'` or `'halloween'`.
4. `drawWindowView` in Voûte mode paints `#0d0a0c` night sky with `#f3e6d0` stars regardless of the daytime `hour` parameter.

- [ ] **Step 2: Run `npx.cmd vitest run client/src/world/voute-world.test.ts` to watch it fail**

- [ ] **Step 3: Implement exterior, props, seasonal suppression, and window view**

- Add `'neon_sign'` and `'vip_rope'` to `ExteriorProp['kind']` in `client/src/world/layout/types.ts`.
- Update `layoutExterior` and `slotShell` in `client/src/world/layout/exterior.ts` for `isVoute()`.
- Add `neonSignSprite()`, `vipRopeSprite()`, and cabaret `lampSprite()` in `client/src/world/render/props.ts` (keyed by `isVoute()`).
- Short-circuit all exports in `client/src/world/render/seasonal.ts` when `isVoute()` is true.
- Update `drawWindowView` in `client/src/art/dynamic.ts` when `isVoute()` is true to draw `#0d0a0c` night sky and 9 deterministic `#f3e6d0` stars.
- Update `Renderer.buildBase` and `Renderer.finishBase` in `client/src/world/render/renderer.ts` so in Voûte mode the outer vignette/clearColor is dark night (`#0d0a0c` / `rgba(13,10,12,0.35)`) and the entrance doormat is a crimson & gold red carpet (`#8c2240` with `#d4a64a` trim).

- [ ] **Step 4: Run `npx.cmd vitest run client/src/world/voute-world.test.ts` and verify it passes**

---

### Task 5: Cabaret Night Lighting, Halos, Flicker & Booth LEDs

**Files:**
- Modify: `client/src/world/render/lighting.ts`
- Create: `client/src/world/voute-lighting.test.ts`

- [ ] **Step 1: Write failing tests in `client/src/world/voute-lighting.test.ts`**

Test:
1. `ambientFor(12)` when `isVoute()` is true returns `night = 1` (permanent nocturnal ambient) with cabaret multiply tint derived from `#3a1a3a` at 35% opacity (`rgb(187, 175, 187)`), regardless of daytime hour.
2. `neonFlickerAlpha(now, reduced)` dims to `0.7` during a `120 ms` window every `6000 ms` when `reduced === false`, and stays `1` when `reduced === true`.
3. `boothLedColor(now, index, reduced)` alternates `#ff3fa4` and `#ffe08a` every `500 ms` when `reduced === false`, and is static when `reduced === true`.

- [ ] **Step 2: Run `npx.cmd vitest run client/src/world/voute-lighting.test.ts` to watch it fail**

- [ ] **Step 3: Implement cabaret lighting in `client/src/world/render/lighting.ts`**

- Export pure helpers `vouteAmbient()`, `neonFlickerAlpha(now: number, reduced: boolean)`, and `boothLedColor(now: number, idx: number, reduced: boolean)`.
- In `Lighting.update`, when `isVoute()` is true, force cabaret nocturnal ambient (`night: 1`, multiply color matching `#3a1a3a` at 35% -> `[187, 175, 187]`).
- In `Lighting.paintMap` and `Lighting.drawGlows`, when `isVoute()` is true:
  - Skip daytime sunbeams and garden fireflies.
  - Add warm `#ffe08a` halos on vanity desks (`desk`/`desk_back`), floor lamps, candelabra (`plant_tall`), and street lamps (`lamp`, radius 40px).
  - Add neon pink `#ff3fa4` / `#ff8fcf` halos on `counter`, `coffee_machine`, `fridge`, `vending_machine`, `neon_sign`, and `sign`, modulated by `neonFlickerAlpha(now, this.reduced)`.
  - Add gold `#ffe08a` spotlight halo (20% alpha) on grand piano / stage (`pingpong_table`, `arcade`, `elevator`).
  - Draw alternating 1px LEDs (`#ff3fa4` / `#ffe08a` every 500ms) on sound consoles (`printer`, `filing_cabinet`).

- [ ] **Step 4: Run `npx.cmd vitest run client/src/world/voute-lighting.test.ts` and verify it passes**

---

### Task 6: Topbar Button «✦ La Voûte», Accessibility & 300ms Canvas Fade

**Files:**
- Modify: `client/src/ui/voute.ts`
- Modify: `client/src/ui/styles.css`
- Modify: `client/src/world/api.ts`
- Modify: `client/src/world/index.ts`
- Modify: `client/src/app.ts`
- Create: `client/src/ui/voute.test.ts`

- [ ] **Step 1: Write failing tests in `client/src/ui/voute.test.ts`**

Test:
1. Button mounts in `.ui-topbar .ui-btn-group` with `type="button"`, `aria-label="La Voûte"`, `aria-pressed="false"`, `title="Entrar a La Voûte"`, icon `✦`, text `La Voûte` and short text `LV`.
2. When active (`aria-pressed="true"`), `title` is `"Volver a la oficina"`, indicator dot `●` is visible, `html.voute` and `isVoute()` are `true`, and `aria-live="polite"` region announces `"La Voûte activada"`.
3. When toggled off, `aria-live="polite"` announces `"Oficina de vuelta"`.
4. With `prefers-reduced-motion: reduce`, toggle executes synchronously (`0 ms`); with motion enabled, button is disabled during the `300 ms` canvas fade and re-enabled after.

- [ ] **Step 2: Run `npx.cmd vitest run client/src/ui/voute.test.ts` to watch it fail**

- [ ] **Step 3: Implement `client/src/ui/voute.ts`, `client/src/ui/styles.css`, `world.rebuild()`, and `client/src/app.ts`**

- Expose `rebuild?(): void` on `WorldApi` (`client/src/world/api.ts` and `client/src/world/index.ts`) that rebuilds `Sim` and `Renderer` and reapplies the current snapshot.
- In `client/src/app.ts`, initialize `setVouteMode(leerVoute(safeLocalStorage()))` before `createWorld` so initial boot renders directly in the saved mode, and connect `montarBotonVoute` to update `store.setView` and call `world.rebuild?.()`.
- Update `client/src/ui/voute.ts` and `client/src/ui/styles.css` to match Barbie's exact specification (36px height, ≥44×44px touch target via `::after`, `#1e1619`/`#f3e6d0`/`#d4a64a` off state, `#2a0a12`/`#ff3fa4`/`#ff8fcf` hover state, `#ff3fa4`/`#0d0a0c`/`#ffe08a` active state with `●` dot, `:focus-visible` `2px solid #ffe08a`, `<480px` `LV` text, `aria-live="polite"` announcement, and `300 ms` canvas fade).

- [ ] **Step 4: Run `npx.cmd vitest run client/src/ui/voute.test.ts`, `npm.cmd run typecheck`, and `npm.cmd run build`**
