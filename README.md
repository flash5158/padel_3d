# Tennis Master 3D - Grand Slam Edition 🎾

Simulador profesional de tenis en 3D con pista abierta DecoTurf, raquetas encordadas con físicas de sweet-spot, 1er y 2do servicio reglamentario, acústica tridimensional con Web Audio API, y multijugador P2P en tiempo real sin servidores centrales.

![Tennis Master 3D](https://img.shields.io/badge/Three.js-3D%20Engine-00f0ff?style=for-the-badge)
![PeerJS](https://img.shields.io/badge/WebRTC-P2P%20Multiplayer-ff2a55?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-e5c07b?style=for-the-badge)

---

## ✨ Características Principales

- **Físicas y Reglas Oficiales de Tenis**:
  - Pista abierta reglamentaria sin paredes con líneas oficiales de individuales ($8.23\,\text{m}$) y dobles ($10.97\,\text{m}$).
  - Sistema reglamentario de **1er y 2do Servicio**: si el primer saque no entra en el cuadro diagonal de saque, el jugador dispone de un segundo servicio. Dos fallos consecutivos penalizan con **Doble Falta**.
  - Detección precisa de pelotas fuera de las líneas (`OUT`) con aviso de juez de línea.
  - Reglas oficiales de red con Continuous Collision Detection (CCD) para evitar tunneling de pelotas rápidas.
  - Puntuación oficial de tenis: 0, 15, 30, 40, Deuce (Iguales), Ventaja y Juego.
- **Sistema de Golpeo Avanzado**:
  - Raquetas con cordaje tensado PBR y detección continua de colisión con cálculo de *Sweet Spot*.
  - Desvío angular dinámico según el timing y dirección de carrera.
  - Tipos de golpe de tenis: Drive plano, Golpe cortado / Slice (`C`), Globo defensivo (`L`), Smash de potencia (`E`) y servicio reglamentario.
- **Modos de Juego**:
  - 🏆 **Modo Individual**: Partido completo contra IA táctica que cubre la pista, calcula intercepciones y ataca en la red.
  - 🌐 **Multijugador Online (P2P)**: Conexión directa mediante WebRTC (PeerJS) sin necesidad de servidores dedicados. Solo comparte el código de sala o el enlace con tu amigo.
  - 👥 **2 Jugadores Local**: Pantalla compartida en el mismo teclado con controles independientes.
- **Acústica Sintética y Efectos Visuales**:
  - Sonido nítido de impacto en cuerdas de tripa/poliéster, bote en pista rápida, aplausos del estadio y avisos de juez de silla.
  - Partículas de impacto, sombras proyectadas y marcador de aterrizaje predictivo.
  - Sistema de 3 cámaras dinámicas: Cámara en 3ª persona de jugador (`1`), Cámara de retransmisión televisiva (`2`) y Cámara cenital táctica (`3`).

---

## 🎮 Controles

### Jugador 1 / Modo Individual:
| Acción | Teclas |
| :--- | :--- |
| **Moverse** | `W` `A` `S` `D` |
| **Esprintar** | `SHIFT` |
| **Cargar / Golpear** | `ESPACIO` o `Clic Izquierdo` |
| **Golpe Cortado (Slice)** | `C` |
| **Globo (Lob)** | `L` |
| **Smash (Remate)** | `E` |
| **Cambiar Cámara** | `1`, `2`, `3` |

### Jugador 2 (Modo Local):
| Acción | Teclas |
| :--- | :--- |
| **Moverse** | Flechas de dirección (`↑`, `←`, `↓`, `→`) |
| **Servicio / Golpe** | `ENTER` |
| **Globo** | `O` |
| **Smash** | `P` |

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Servidor Local Rápido (Recomendado)
Puedes servir los archivos con cualquier servidor HTTP estático (por ejemplo Python):

```bash
# Entra en la carpeta del proyecto y ejecuta:
python3 -m http.server 8080
```
Luego abre tu navegador en `http://localhost:8080/`.

### Opción 2: Despliegue en GitHub Pages (Para jugar online con amigos en cualquier red)
1. En tu repositorio de GitHub, ve a **Settings** -> **Pages**.
2. En **Branch**, selecciona `main` y la carpeta `/(root)`.
3. Haz clic en **Save**.
4. ¡Listo! Obtendrás una URL pública segura (con HTTPS) accesible desde cualquier lugar del mundo.
