# Pop Block Blitz

A satisfying, hyper-casual block popping game built with Next.js, featuring AI-driven dynamic difficulty adjustment and a modern, playful UI.

## Features

- **Satisfying Gameplay**: Classic "pop" mechanics with smooth animations and floating point effects.
- **Adaptive AI**: Integrated with Genkit to dynamically adjust board size and color complexity based on player performance (with a heuristic fallback for static exports).
- **Fully Localized**: Support for English and Russian, including UI and AI-generated feedback.
- **Responsive Design**: Optimized for both desktop and smartphone screens with a mobile-first approach.
- **Visual Feedback**: High-impact animations, including floating scores, pulsing UI elements, and "pop-in" block effects.
- **Static Export Ready**: Configured for `next export`, making it easy to host on any static web provider.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Poppins](https://fonts.google.com/specimen/Poppins) (Optimized via `next/font`)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository (if applicable)
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### Building for Production

To create a static export of the project:
```bash
npm run build
```
The output will be located in the `out/` directory.

## Game Logic

The game uses a "Match-2" or "Collapse" mechanic. 
- Click groups of 2 or more adjacent blocks of the same color to pop them.
- Gravity pulls blocks down to fill empty spaces.
- Empty columns are shifted left to consolidate the board.
- The game ends when no more valid moves are possible.

## AI Difficulty Adjustment

At the end of each game, the player's performance (score, moves, max combo) is analyzed to recommend a configuration for the next round. This ensures the game remains challenging for experts and accessible for beginners.

---
© 2024 Pop Block Blitz Studios
