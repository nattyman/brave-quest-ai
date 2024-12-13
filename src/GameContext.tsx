import React, { useState, createContext, useContext } from 'react';

// Define the shape of the game state
type GameState = {
  playerStats: {
    health: number;
    gold: number;
    food: number;
    wood: number;
  };
  inventory: { id: string; name: string; quantity: number }[];
  equippedItems: ({ id: string; name: string; quantity: number } | null)[]; // Add equippedItems
  story: string;
  initialQuestionAnswered: boolean;
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
    inventory: [
      { id: '1', name: 'Sword', quantity: 1 },
      { id: '2', name: 'Shield', quantity: 1 },
    ],
    equippedItems: [null, null], // Initialize equippedItems with two slots
    story: 'Welcome, brave adventurer! What is your name?',
    initialQuestionAnswered: false,
  });

  const updateGameState = (changes: Partial<GameState>) => {
    setGameState((prevState) => ({
      ...prevState,
      ...changes,
      playerStats: {
        ...prevState.playerStats,
        ...changes.playerStats,
      },
      inventory: changes.inventory ?? prevState.inventory, // Ensure inventory is always defined
      equippedItems: changes.equippedItems ?? prevState.equippedItems, // Update equippedItems
      story: changes.story ?? prevState.story,
      initialQuestionAnswered: changes.initialQuestionAnswered ?? prevState.initialQuestionAnswered,
    }));
  };

  const addItem = (item: { id: string; name: string; quantity: number }) => {
    setGameState((prevState) => {
      const existingItem = prevState.inventory.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        prevState.inventory.push(item);
      }
      return { ...prevState };
    });
  };

  const removeItem = (itemId: string) => {
    setGameState((prevState) => {
      const itemIndex = prevState.inventory.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        if (prevState.inventory[itemIndex].quantity > 1) {
          prevState.inventory[itemIndex].quantity--;
        } else {
          prevState.inventory.splice(itemIndex, 1);
        }
      }
      return { ...prevState };
    });
  };

  const useItem = (itemId: string) => {
    setGameState((prevState) => {
      const item = prevState.inventory.find(i => i.id === itemId);
      if (item && item.type === 'consumable') {
        prevState.playerStats.health += 10; // Example effect
        removeItem(itemId);
      }
      return { ...prevState };
    });
  };

  const equipItem = (itemId: string, slot: number) => {
    setGameState((prevState) => {
      if (prevState.equippedItems[slot]) {
        alert('Slot is already occupied. Unequip the current item first.');
        return prevState;
      }
      const item = prevState.inventory.find(i => i.id === itemId);
      if (item) {
        prevState.equippedItems[slot] = item;
      }
      return { ...prevState };
    });
  };

  const unequipItem = (slot: number) => {
    setGameState((prevState) => {
      prevState.equippedItems[slot] = null;
      return { ...prevState };
    });
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
