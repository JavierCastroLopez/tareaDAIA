# Street Fighter V2

Clon del clásico juego de lucha arcade desarrollado totalmente en tecnologías web: HTML5 Canvas, JavaScript puro (vanilla ES6) y CSS3. Sin motores de juegos externos — todo el motor de juego, renderizado, física de colisiones y sistema de audio está escrito desde cero.

## Características

- **Personajes:** RYU (P1) vs KEN (P2)
- **HUD:** Barras de vida, rondas, temporizador, banners de estado (INTRO, FIGHT, KO, FIN)
- **Sistema de combate:** Bucle a 60 FPS con `requestAnimationFrame`, hitboxes/hurtboxes, buffer de entradas de 500ms, bloqueo, proyectiles
- **Movimientos especiales:** Hadouken, Tatsumaki, Shoryuken con combinaciones de teclas
- **Controles:**
  - P1: WASD (mover) + UIJK (atacar)
  - P2: Flechas (mover) + Numpad 4 5 1 2 (atacar)
  - ENTER: empezar / reiniciar
  - H: mostrar hitboxes (debug)
- **Audio:** Música de fondo con fallback a sintetizador procedural; efectos de sonido vía Web Audio API

## Archivos

- `index.html` — estructura y pantalla de inicio
- `style.css` — estilos y diseño tipo arcade
- `script.js` — motor de juego completo

## Ejecución

Abre `index.html` en un navegador. Si el audio falla, sirve el proyecto mediante HTTP local:

```bash
python -m http.server
```

Luego abre `http://localhost:8000`.

## Desarrollo

- Desarrollado con OpenCode usando API key de NVIDIA
- Probado y corregido por Hermes Agent (Capri)
- Inspirado en Street Fighter II (Capcom)