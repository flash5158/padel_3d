# Padel Master 3D - World Tour Edition 🎾

Simulador profesional de pádel en 3D con físicas realistas, rebotes en paredes de cristal, efectos de rotación de pelota, acústica tridimensional con Web Audio API, y multijugador P2P en tiempo real sin servidores centrales.

![Padel Master 3D](https://img.shields.io/badge/Three.js-3D%20Engine-00f0ff?style=for-the-badge)
![PeerJS](https://img.shields.io/badge/WebRTC-P2P%20Multiplayer-ff2a55?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-e5c07b?style=for-the-badge)

---

## ✨ Características Principales

- **Físicas y Reglas Oficiales de Pádel**:
  - Detección precisa de rebotes en moqueta y cristales templados.
  - Regla reglamentaria de cristal: si la pelota impacta el cristal antes de botar en la pista, es bola fuera (`OUT`). Si bota primero en pista, la bola continúa viva para bajadas de pared.
  - Penalización automática por bote en campo propio antes de cruzar la red.
  - Detección de doble bote y pelota atrapada en la red.
- **Sistema de Golpeo Avanzado**:
  - Detección continua de colisión de raqueta con cálculo de *Sweet Spot*.
  - Desvío angular dinámico según el timing y dirección de carrera.
  - Diferentes tipos de golpe: Drive plano, Globo defensivo (`L`), Smash de potencia (`E`) y servicio reglamentario.
- **Modos de Juego**:
  - 🏆 **Modo Individual**: Partido completo contra IA táctica que lee trayectorias, cubre la red y defiende cristales de fondo.
  - 🌐 **Multijugador Online (P2P)**: Conexión directa mediante WebRTC (PeerJS) sin necesidad de configurar servidores de juego dedicados. Solo comparte el código de sala con tu amigo.
  - 👥 **2 Jugadores Local**: Pantalla compartida en el mismo teclado con controles independientes.
- **Acústica Sintética y Efectos Visuales**:
  - Audio sintetizado en tiempo real (impacto de pala, rebote en césped, cristal templado, aplausos y silbato de juez).
  - Partículas de polvo e impacto, sombras proyectadas y marcador de aterrizaje predictivo.
  - Sistema de 3 cámaras dinámicas: Cámara en 3ª persona de jugador (`1`), Cámara de retransmisión televisiva (`2`) y Cámara cenital táctica (`3`).

---

## 🎮 Controles

### Jugador 1 / Modo Individual:
| Acción | Teclas |
| :--- | :--- |
| **Moverse** | `W` `A` `S` `D` |
| **Esprintar** | `SHIFT` |
| **Cargar / Golpear** | `ESPACIO` o `Clic Izquierdo` |
| **Globo Defensivo** | `L` |
| **Smash de Potencia** | `E` |
| **Cambiar Cámara** | `1`, `2`, `3` |

### Jugador 2 (Modo Local):
| Acción | Teclas |
| :--- | :--- |
| **Moverse** | Flechas de dirección (`↑`, `←`, `↓`, `→`) |
| **Servicio / Golpe** | `ENTER` |
| **Globo Defensivo** | `O` |
| **Smash** | `P` |

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Servidor Local Rápido (Recomendado)
Puedes servir los archivos con cualquier servidor HTTP estático (por ejemplo Python):

```bash
# Con Python 3:
python3 -m http.server 8080

# Luego abre en tu navegador:
http://localhost:8080
```

### Opción 2: Extensión Live Server / Node.js
Si utilizas VS Code, puedes hacer clic derecho en `index.html` y seleccionar **"Open with Live Server"**, o usar `npx serve .`.

---

## 📁 Estructura del Repositorio

```
padel_3d/
├── index.html         # Estructura del juego, interfaz de broadcast y modal de inicio
├── style.css          # Sistema de diseño de lujo (Frosted Glassmorphism, CSS Tokens)
├── game.js            # Motor 3D Three.js, físicas continuas, reglas oficiales y WebRTC
├── lib/
│   ├── three.min.js   # Librería Three.js local
│   └── peerjs.min.js  # Librería PeerJS para multijugador P2P
└── README.md          # Documentación del proyecto
```

---

## 📜 Licencia
Distribuido bajo la Licencia MIT. ¡Siéntete libre de modificarlo, jugar y disfrutar del pádel virtual!
