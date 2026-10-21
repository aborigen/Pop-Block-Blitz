# Genkit in Pop Block Blitz

Genkit is the AI orchestration framework used in this project to power the **Dynamic Difficulty Adjustment (DDA)** system.

## How it Works

1.  **Flows**: Located in `src/ai/flows/`, Genkit "flows" define the logic for AI tasks. Our primary flow is `curateDynamicDifficulty`.
2.  **Prompts**: We use `ai.definePrompt` to create structured instructions for the LLM. It takes player stats (score, combos, moves) and returns a JSON object with recommended game settings.
3.  **Model**: The project is configured to use `googleai/gemini-2.5-flash` via the `@genkit-ai/google-genai` plugin.
4.  **Integration**: The `GameController.tsx` calls this flow at the end of every game to decide if the next round should be harder or easier based on the AI's "curation."

## Key Files
- `src/ai/genkit.ts`: Central initialization of the Genkit instance and plugins.
- `src/ai/flows/curate-dynamic-difficulty.ts`: The specific AI logic for game balancing.
- `src/ai/dev.ts`: Entry point for the Genkit Developer UI (`npm run genkit:dev`).

---
© 2024 Pop Block Blitz Studios