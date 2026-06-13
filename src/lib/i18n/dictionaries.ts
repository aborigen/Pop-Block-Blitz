export const dictionaries = {
  en: {
    title: "POP BLOCK",
    subtitle: "BLITZ",
    aiPowered: "Powered by Adaptive AI",
    instruction: "Pop adjacent same-color blocks to win! Larger groups = More points.",
    copyright: "© 2024 Pop Block Blitz Studios",
    score: "Score",
    best: "Best",
    moves: "Moves",
    level: "Level",
    gameOver: "Game Over!",
    finalScore: "Final Score",
    playAgain: "Play Again",
    resetSession: "Reset Session",
    aiMaster: "AI Master",
    leaders: "Leaders",
    rank: "Rank",
    name: "Name",
    loading: "Loading...",
    noData: "No data available",
    difficulty: {
      very_easy: "Very Easy",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      expert: "Expert",
      insane: "Insane"
    }
  },
  ru: {
    title: "ПОП БЛОК",
    subtitle: "БЛИЦ",
    aiPowered: "На базе адаптивного ИИ",
    instruction: "Лопайте соседние блоки одного цвета! Большие группы = Больше очков.",
    copyright: "© 2024 Студия Поп Блок Блиц",
    score: "Счет",
    best: "Рекорд",
    moves: "Ходы",
    level: "Уровень",
    gameOver: "Игра окончена!",
    finalScore: "Финальный счет",
    playAgain: "Играть снова",
    resetSession: "Сбросить сессию",
    aiMaster: "Мастер ИИ",
    leaders: "Лидеры",
    rank: "Место",
    name: "Имя",
    loading: "Загрузка...",
    noData: "Данных нет",
    difficulty: {
      very_easy: "Очень Легко",
      easy: "Легко",
      medium: "Средне",
      hard: "Сложно",
      expert: "Эксперт",
      insane: "Безумие"
    }
  }
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof dictionaries.en;
