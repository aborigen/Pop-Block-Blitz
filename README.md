# Pop Block Blitz

A satisfying, hyper-casual block popping game built with Next.js, featuring AI-driven dynamic difficulty adjustment and a modern, playful UI.

## Features

- **Satisfying Gameplay**: Classic "pop" mechanics with smooth animations and floating point effects.
- **Adaptive AI**: Integrated with Genkit to dynamically adjust board size and color complexity based on player performance.
- **Fully Localized**: Support for English and Russian, with automatic Yandex Games SDK environment synchronization.
- **Responsive Design**: Optimized for both desktop and smartphone screens with a mobile-first approach.
- **Visual Feedback**: High-impact animations, including floating scores, pulsing UI elements, and "pop-in" block effects.
- **Static Export Ready**: Configured for `next export`, making it easy to host on any static web provider.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Poppins](https://fonts.google.com/specimen/Poppins)

## Localization Sync

The game automatically synchronizes its language with the Yandex Games platform:
1. **Detection**: Uses the Yandex SDK `environment.i18n.lang` parameter.
2. **Synchronization**: On startup, the game checks for a local override in `localStorage`. If absent, it applies the platform language.
3. **Persistence**: Player language choices are saved locally and respect Yandex settings on fresh starts.

For more details, see `src/docs/localization-sync.md`.

## Game Logic

The game uses a "Match-2" or "Collapse" mechanic. 
- Click groups of 2 or more adjacent blocks of the same color to pop them.
- Gravity pulls blocks down to fill empty spaces.
- Empty columns are shifted left to consolidate the board.
- The game ends when no more valid moves are possible.

### Scoring
Scores are calculated per move using a quadratic formula to reward larger combos:
**`Score = n * (n - 1) * 2`**
Where `n` is the number of blocks popped in a single move.

## AI Difficulty Adjustment

At the end of each game, the player's performance (score, moves, max combo) is analyzed to recommend a configuration for the next round. This ensures the game remains challenging for experts and accessible for beginners.

---
© 2024 Pop Block Blitz Studios
