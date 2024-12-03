import React, { useState, createContext, useContext } from 'react';

// Define the shape of the game state
type GameState = {
  playerStats: {
    health: number;
    gold: number;
    food: number;
    wood: number;
  };
  inventory: string[];
  story: string;
};

type GameContextType = {
  gameState: GameState;
  updateGameState: (changes: Partial<GameState>) => void;
};

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    playerStats: { health: 100, gold: 50, food: 30, wood: 20 },
    inventory: ['Sword', 'Shield'],
    story: 'Welcome, brave adventurer!',
  });

  const updateGameState = (changes: Partial<GameState>) => {
    setGameState((prevState) => ({
      ...prevState,
      ...changes,
      playerStats: {
        ...prevState.playerStats,
        ...changes.playerStats,
      },
      inventory: changes.inventory || prevState.inventory,
      story: changes.story || prevState.story,
    }));
  };

  return (
    <GameContext.Provider value={{ gameState, updateGameState }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
