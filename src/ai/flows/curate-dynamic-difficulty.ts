'use server';
/**
 * @fileOverview An AI agent for dynamically adjusting game difficulty in 'Pop Block Blitz'.
 *
 * - curateDynamicDifficulty - A function that curates game difficulty based on player performance.
 * - CurateDynamicDifficultyInput - The input type for the curateDynamicDifficulty function.
 * - CurateDynamicDifficultyOutput - The return type for the curateDynamicDifficulty function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CurateDynamicDifficultyInputSchema = z.object({
  playerPerformance: z.object({
    lastGameScore: z.number().describe('The score the player achieved in their last game.'),
    averageScore: z
      .number()
      .describe('The player\u0027s average score across all games played.'),
    gamesPlayed: z.number().describe('The total number of games played by the player.'),
    difficultyLevelLastGame:
      z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the last game played.'),
    averageBlocksClearedPerMove:
      z.number().describe('The average number of blocks cleared per move in the last game.'),
    maxComboCleared: z
      .number()
      .describe('The maximum number of blocks cleared in a single move in the last game.'),
  }),
  gameConfiguration: z.object({
    currentBoardWidth: z.number().describe('The current width of the game board.'),
    currentBoardHeight: z.number().describe('The current height of the game board.'),
    currentNumColors: z.number().describe('The current number of distinct block colors on the board.'),
  }),
});
export type CurateDynamicDifficultyInput = z.infer<typeof CurateDynamicDifficultyInputSchema>;

const CurateDynamicDifficultyOutputSchema = z.object({
  recommendedBoardWidth: z.number().describe('The recommended width for the next game board (e.g., 8-15).'),
  recommendedBoardHeight: z.number().describe('The recommended height for the next game board (e.g., 8-15).'),
  recommendedNumColors: z.number().describe('The recommended number of distinct block colors for the next game (e.g., 4-7).'),
  recommendedDifficultyLevel: z.enum(['easy', 'medium', 'hard']).describe('The recommended overall difficulty level for the next game.'),
  difficultyAdjustmentFeedback:
    z.string().describe('A brief explanation of the AI\u0027s reasoning for the difficulty adjustment.'),
});
export type CurateDynamicDifficultyOutput = z.infer<typeof CurateDynamicDifficultyOutputSchema>;

export async function curateDynamicDifficulty(
  input: CurateDynamicDifficultyInput
): Promise<CurateDynamicDifficultyOutput> {
  return curateDynamicDifficultyFlow(input);
}

const curateDynamicDifficultyPrompt = ai.definePrompt({
  name: 'curateDynamicDifficultyPrompt',
  input: { schema: CurateDynamicDifficultyInputSchema },
  output: { schema: CurateDynamicDifficultyOutputSchema },
  prompt: `You are an AI game master for 'Pop Block Blitz'. Your task is to analyze a player's performance and recommend adjustments to the game's difficulty to keep it engaging and balanced.

Consider the player's recent and overall performance:
- Last Game Score: {{{playerPerformance.lastGameScore}}}
- Average Score: {{{playerPerformance.averageScore}}}
- Games Played: {{{playerPerformance.gamesPlayed}}}
- Difficulty Level Last Game: {{{playerPerformance.difficultyLevelLastGame}}}
- Average Blocks Cleared Per Move: {{{playerPerformance.averageBlocksClearedPerMove}}}
- Maximum Combo Cleared: {{{playerPerformance.maxComboCleared}}}

Current game configuration:
- Board Width: {{{gameConfiguration.currentBoardWidth}}}
- Board Height: {{{gameConfiguration.currentBoardHeight}}}
- Number of Colors: {{{gameConfiguration.currentNumColors}}}

Based on this data, provide recommendations for the next game's board width, board height, number of colors, and an overall difficulty level. Also, provide a brief explanation for your recommendations.

Guidelines:
- If the player is consistently scoring high (e.g., significantly above average) and clearing large combos, increase difficulty.
- To increase difficulty: increase board size (width/height), add more colors, or suggest a 'hard' level.
- If the player is struggling with low scores (e.g., significantly below average) and small combos, decrease difficulty.
- To decrease difficulty: reduce board size, fewer colors, or suggest an 'easy' level.
- Maintain a balanced approach; small adjustments are often better than drastic changes.
- Board width and height should be reasonable (e.g., between 8 and 15).
- Number of colors should be reasonable (e.g., between 4 and 7).`,
});

const curateDynamicDifficultyFlow = ai.defineFlow(
  {
    name: 'curateDynamicDifficultyFlow',
    inputSchema: CurateDynamicDifficultyInputSchema,
    outputSchema: CurateDynamicDifficultyOutputSchema,
  },
  async (input) => {
    const { output } = await curateDynamicDifficultyPrompt(input);
    return output!;
  }
);
