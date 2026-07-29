# Pop Block Blitz - Game Mechanics Guide

Welcome to the internal guide for **Pop Block Blitz**. This document explains the core systems that make the game satisfying, strategic, and balanced.

## 1. Core Gameplay: The Match-2 Loop
The game uses a "Match-2" or "Collapse" mechanic. 
- **Identifying Groups**: A group consists of two or more blocks of the same color that are adjacent horizontally or vertically.
- **The Pop**: Clicking a group "pops" the blocks, removing them from the board and triggering a cascade.
- **Cascading Gravity**: When blocks are removed, the blocks above them fall down to fill the empty spaces.
- **Column Consolidation**: If an entire column becomes empty, all columns to its right shift left to keep the board compact.

## 2. Advanced Scoring Formula
The game rewards players for creating large clusters rather than clearing small ones quickly.
- **Formula**: `Score = n * (n - 1) * 2` (where `n` is the number of blocks cleared).
- **Impact**:
  - 2 blocks: 4 points
  - 5 blocks: 40 points
  - 10 blocks: 180 points
  - 20 blocks: 760 points
- **Strategy**: It is often better to wait and set up a massive cluster than to clear small groups immediately.

## 3. Perfect Clear Bonus
If you manage to clear every single block from the board by the time the game ends, you achieve a **Perfect Clear**.
- **Reward**: Your total score for that round is multiplied by **5**.
- **Strategy**: Aiming for a Perfect Clear is the ultimate high-risk, high-reward strategy.

## 4. Board Rotation Strategy
Unique to Pop Block Blitz is the ability to rotate the board 90 degrees.
- **Mechanic**: Rotating shifts the physical position of all blocks.
- **Gravity Re-application**: After rotation, gravity is reapplied to the new "down" direction.
- **Tactical Use**: Use rotation to bring blocks of the same color together that were previously separated by different columns.

## 5. Adaptive AI Game Master
The game features a Genkit-powered AI agent that adjusts difficulty between sessions.
- **Tracking**: The AI monitors your score, average clear size (combo), and total moves.
- **Adjustment**: 
  - If you are performing exceptionally well, the AI increases board dimensions and the number of colors.
  - If you are struggling, it simplifies the grid to ensure a fun, "zen" experience.
- **Levels**: Difficulty scales from `Very Easy` to `Insane`.

## 6. Visual and Auditory Feedback
- **Floating Points**: Every move displays a floating score indicator at the point of impact.
- **Targeting**: Hovering over or clicking a group highlights the entire cluster to help players visualize their move.
- **Procedural Sound**: The pitch of the "pop" sound increases slightly based on the size of the cluster, providing auditory satisfaction for big combos.

---
© 2024 Pop Block Blitz Studios
