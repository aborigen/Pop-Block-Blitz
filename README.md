# Pop Block Blitz

A satisfying, hyper-casual block popping game built with Next.js, featuring AI-driven dynamic difficulty adjustment and a modern, playful UI.

## Features

- **Satisfying Gameplay**: Classic "pop" mechanics with smooth animations and floating point effects.
- **Adaptive AI**: Integrated with Genkit to dynamically adjust board size and color complexity based on player performance.
- **Visual Feedback**: High-impact animations, including floating scores, pulsing UI elements, and "pop-in" block effects.
- **Static Export Ready**: Configured for `next export`, making it easy to host on any static web provider.
- **Persistence**: Automatic progress and high score saving via local storage.

## Game Logic

The game uses a "Match-2" or "Collapse" mechanic. 
- Click groups of 2 or more adjacent blocks of the same color to pop them.
- Gravity pulls blocks down to fill empty spaces.
- Empty columns are shifted left to consolidate the board.
- The game ends when no more valid moves are possible.

### Scoring
Scores are calculated per move using a quadratic formula:
**`Score = n * (n - 1) * 2`**

## Platform Integration
While the game is currently standalone, instructions for re-integrating with the Yandex Games SDK can be found in `src/docs/restore-yandex-sdk.md`.

---
© 2024 Pop Block Blitz Studios
