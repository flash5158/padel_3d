# Grand Slam & Padel 3D Pro - Ultra Premium Edition

Un simulador y juego web 3D ultra premium de Tenis y Pádel creado con Three.js, WebGL, Web Audio API y Tailwind CSS.

## Características Principales

1. **Física 3D Realista**:
   - Integración Verlet de trayectorias balísticas con gravedad ($g = 14.5\text{ m/s}^2$).
   - Efecto Magnus aerodinámico: topspin con caída rápida y slice/dejada con sustentación flotante.
   - Rebotes en suelo dependientes de superficie (tierra batida, hierba, rápida y cristal).
   - Detección precisa de choque en red y cinta.
   - **Reglas y mecánicas oficiales de Pádel**: paredes de cristal templado rebotables en fondo y laterales, además de malla metálica.

2. **5 Pistas / Mapas de Élite con Texturizado Procedural de Alta Resolución**:
   - **Roland Garros (París)**: Tierra batida roja triturada, deslizamiento y partículas de polvo arcilloso.
   - **Monte Carlo Padel Club (Mónaco)**: Pista oficial de cristal templado transparente, césped azul sintético y postes metálicos.
   - **Wimbledon Centre Court (Londres)**: Césped natural con franjas de corte y bajo bote rápido.
   - **US Open Flushing Meadows (Nueva York)**: DecoTurf rápido azul/verde con iluminación nocturna por focos de estadio.
   - **Neo Tokyo 2099 (Cyber Arena)**: Superficie de fibra de carbono reflectante, líneas de neón cian y red holográfica.

3. **Modelos Articulados y Animaciones Procedurales**:
   - Jugadores 3D humanoides con indumentaria deportiva completa y raquetas de carbono.
   - Ciclos cinemáticos de carrera, postura de espera con balanceo, saque con lanzamiento de bola, drive plano, topspin, cortado y remate / smash en el aire.

4. **Sonido Sintetizado Espacial (Web Audio API)**:
   - Impacto de cordaje y raqueta dinámico según la potencia del tiro.
   - Explosión sonora en remates.
   - Bote percusivo afinado por superficie.
   - Resonancia de impacto en pared de cristal en pádel.
   - Ovación y murmullo de público dinámico en puntos épicos.
   - Canto de tanteo arbitral por voz (SpeechSynthesis).

5. **IA Táctica Adaptativa**:
   - 3 dificultades: Aficionado, Profesional y Leyenda Grand Slam.
   - Cobertura de ángulos, anticipación y variedad de golpes.

6. **Interfaz de Retransmisión TV**:
   - Marcador oficial con sets, juegos, puntos y tiebreak.
   - Radar cinemático de velocidad en km/h.
   - Minimapa radar táctico en tiempo real.
   - Conmutador de 4 cámaras: Tercera persona (Chase), TV Broadcast lateral, Cámara de Acción y Vista Aérea Top-Down.
