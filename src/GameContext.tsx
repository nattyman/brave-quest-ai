import React, { useState, createContext, useContext } from 'react';
import itemsDetail from '../story/items-detail-list.json'; // Import the detailed items list
import itemsBasic from '../story/items-basic-list.json'; // Import the basic items list

// Define the shape of the game state
export type GameState = { // Export the GameState type
  playerStats: {
    name: string;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    magic: number;
    maxMagic: number;
    attack: number;
    defense: number;
    xp: number;
    level: number;
    skills: string[];
    gold: number;
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
    playerStats: {
      name: '',
      health: 100,
      maxHealth: 100,
      stamina: 50,
      maxStamina: 50,
      magic: 30,
      maxMagic: 30,
      attack: 10,
      defense: 5,
      xp: 0,
      level: 1,
      skills: [],
      gold: 50,
    },
    inventory: [], // Initialize with an empty inventory
    equippedItems: [null, null], // Initialize equippedItems with two slots
    story: 'Welcome, brave adventurer! What is your name?',
    initialQuestionAnswered: false,
  });

  const xpThresholds = [0, 100, 250, 500]; // Example thresholds for leveling up

  const updateGameState = (changes: Partial<GameState>) => {
    setGameState((prevState) => {
      const newPlayerStats = {
        ...prevState.playerStats,
        ...changes.playerStats,
        health: Math.min(prevState.playerStats.maxHealth, (changes.playerStats?.health ?? prevState.playerStats.health)),
        stamina: Math.min(prevState.playerStats.maxStamina, (changes.playerStats?.stamina ?? prevState.playerStats.stamina)),
        magic: Math.min(prevState.playerStats.maxMagic, (changes.playerStats?.magic ?? prevState.playerStats.magic)),
      };

      // Check for level up
      if (newPlayerStats.xp >= xpThresholds[newPlayerStats.level]) {
        newPlayerStats.level += 1;
        switch (newPlayerStats.level) {
          case 2:
            newPlayerStats.maxHealth += 10;
            newPlayerStats.maxStamina += 5;
            newPlayerStats.maxMagic += 5;
            newPlayerStats.skills.push('Strong Attack');
            break;
          case 3:
            newPlayerStats.attack += 5;
            newPlayerStats.skills.push('Shield Block');
            break;
          case 4:
            newPlayerStats.defense += 5;
            newPlayerStats.maxMagic += 5;
            newPlayerStats.skills.push('Fireball');
            break;
          default:
            break;
        }
      }

      return {
        ...prevState,
        ...changes,
        playerStats: newPlayerStats,
        inventory: changes.inventory ?? prevState.inventory, // Ensure inventory is always defined
        equippedItems: changes.equippedItems ?? prevState.equippedItems, // Update equippedItems
        story: changes.story ?? prevState.story,
        initialQuestionAnswered: changes.initialQuestionAnswered ?? prevState.initialQuestionAnswered,
      };
    });
  };

  const addItem = (item: { id: string; quantity: number }) => {
    setGameState((prevState) => {
      const itemBasic = itemsBasic.itemsBasic.find(basic => basic.id === item.id);
      if (!itemBasic) {
        console.error(`Item with ID ${item.id} not found in items list.`);
        return prevState;
      }

      const existingItem = prevState.inventory.find(i => i.id === itemBasic.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        prevState.inventory.push({
          id: itemBasic.id,
          name: itemBasic.name,
          quantity: item.quantity,
        });
      }

      // Log the updated inventory for debugging
      console.log('Updated Inventory:', prevState.inventory);

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
      if (item) {
        const itemDetail = itemsDetail.itemsDetail.find(detail => detail.id === itemId);
        if (itemDetail && itemDetail.effects) {
          const newPlayerStats = { ...prevState.playerStats };
          Object.keys(itemDetail.effects).forEach(effect => {
            if (effect in newPlayerStats) {
              (newPlayerStats as any)[effect] += itemDetail.effects[effect as keyof typeof itemDetail.effects];
            }
          });
          const newInventory = prevState.inventory.map(i => 
            i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
          ).filter(i => i.quantity > 0);
          const newStory = `${prevState.story}\nYou used a ${item.name}. ${itemDetail.description}`;
          return { ...prevState, playerStats: newPlayerStats, inventory: newInventory, story: newStory };
        }
      }
      return prevState;
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
