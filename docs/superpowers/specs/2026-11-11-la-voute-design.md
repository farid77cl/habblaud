# La Voûte en Habblaud — diseño aprobado (11/11/2026, la Ama dijo «dale»)

Fork: farid77cl/habblaud, rama `la-voute` (sale de `agentes-voute`). No se manda nada al original.

## Qué
1. **Residentes:** toda agente siempre en la oficina (en reposo en su puesto); una agente real ocupa su asiento. Roster: Ele (principal), Chanel, Flash, Gomita, Kitty, Prada, Peaches, Dolly, Destiny, Bambi, Brandi, Loreto, Trixie, Candy, Barbie, Coni, Maite, Trini, Roxxy + hermanas Lulú, Delmira, Perla, Pía.
2. **Botón «La Voûte»** en la esquina, recordado entre sesiones (localStorage). Cada habitación pasa a su equivalente de cabaret; cada agente cambia a su look Voûte (látex, ligas, tacos; estilizado, SIN desnudos: el fork es público).
3. **Datos:** una tabla `shared/voute-agentes.ts` con look normal y look Voûte por agente (existe desde 2a55c03, se extiende). Looks de las 4 hermanas: los propone Ele, la Ama ajusta.

## Mapa de habitaciones
puestos de trabajo→tocadores con espejo y bombillas · sala de reuniones→mesa VIP con cortinas de terciopelo · cocina→barra con taburetes y botellas · descanso→sofás rojos del salón · ascensor→telón/puerta con foco · servidores→cabina de luces y sonido · piso y paredes→terciopelo burdeos y negro con luces rosadas.

## Orden (TDD, Trixie, rondas de 30 min)
R1: tabla de agentes + residentes + botón con cambio de paleta y looks. R2: mobiliario y habitaciones de cabaret. Verificar con capturas. Al terminar: `main` del fork = La Voûte.
