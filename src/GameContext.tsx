import React, { useState, createContext, useContext } from 'react';
import itemsData from '../story/items.json'; // Import the combined items list

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
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
    wisdom: number;
    constitution: number;
    stealth: number;
    perception: number;
  };
  inventory: { id: string; name: string; quantity: number }[];
  equippedItems: ({ id: string; name: string; quantity: number } | null)[]; // Add equippedItems
  magicSpells: { name: string }[]; // Add magicSpells
  story: string;
  initialQuestionAnswered: boolean;
  tasks: { id: string; name: string; description: string; status: 'open' | 'active' | 'completed' }[];
  achievements: { id: string; name: string; description: string; reward: { xp: number; gold: number; items: string[] } }[];
  activeTask: string | null;
};

type GameContextType = { // Export the GameContext type
  gameState: GameState; // The current state of the game.
  updateGameState: (changes: Partial<GameState>) => void; //Function to update the game state with partial changes.
};

// Create the context for the game state
const GameContext = createContext<GameContextType | undefined>(undefined);


// addItem as a function factory
const createAddItem = (setGameState: React.Dispatch<React.SetStateAction<GameState>>) => 
  (item: { id: string; name: string; quantity: number }) => {
    const itemDetails = itemsData.items.find(i => i.id === item.id); // Find the item in the combined items list
    if (!itemDetails) { // Check if the item exists
      console.error(`Item with id ${item.id} does not exist in the available items list.`);
      return;
    }


    setGameState((prevState) => { // Update the game state with the new item
      const existingItem = prevState.inventory.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        prevState.inventory.push({
          ...itemDetails,
          quantity: item.quantity,
        });
      }
      console.log('Updated Inventory:', prevState.inventory);
      return { ...prevState };
    });
  };


  // Define the GameProvider component to manage the game state and provide it to the app components 
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
      strength: 1,
      dexterity: 1,
      intelligence: 1,
      charisma: 1,
      wisdom: 1,
      constitution: 1,
      stealth: 1,
      perception: 1,
    },
    inventory: [], // Initialize inventory as empty
    equippedItems: [null, null], // Initialize equippedItems with two slots
    magicSpells: [ // Initialize spells as empty
    ],
    story: 'Welcome, brave adventurer! What is your name?',
    initialQuestionAnswered: false,
    tasks: [],
    achievements: [],
    activeTask: null,
  });

  const xpThresholds = [0, 100, 250, 500]; // thresholds for leveling up 10 is low for testing

  // Function to update the game state with partial changes and handle level up logic

  const updateGameState = (changes: Partial<GameState>) => {
    setGameState((prevState) => {
      const newPlayerStats = {
        ...prevState.playerStats,
        ...changes.playerStats,
        health: Math.min(prevState.playerStats.maxHealth, (changes.playerStats?.health ?? prevState.playerStats.health)),
        stamina: Math.min(prevState.playerStats.maxStamina, (changes.playerStats?.stamina ?? prevState.playerStats.stamina)),
        magic: Math.min(prevState.playerStats.maxMagic, (changes.playerStats?.magic ?? prevState.playerStats.magic)),
      };

      let levelUpMessage = '\nTest level up message\n'; // Initialize level up message

      // Check for level up
      if (newPlayerStats.xp >= xpThresholds[newPlayerStats.level]) {
        newPlayerStats.level += 1;
        switch (newPlayerStats.level) {
          case 2:
            newPlayerStats.maxHealth += 10;
            newPlayerStats.maxStamina += 5;
            newPlayerStats.maxMagic += 5;
            newPlayerStats.skills.push('Strong Attack');
            levelUpMessage = 'Congratulations! You have reached level 2. Your max health, stamina, and magic have increased, and you have learned a new skill: Strong Attack.';
            break;
          case 3:
            newPlayerStats.attack += 5;
            newPlayerStats.skills.push('Shield Block');
            levelUpMessage = 'Congratulations! You have reached level 3. Your attack has increased, and you have learned a new skill: Shield Block.';
            break;
          case 4:
            newPlayerStats.defense += 5;
            newPlayerStats.maxMagic += 5;
            newPlayerStats.skills.push('Fireball');
            levelUpMessage = 'Congratulations! You have reached level 4. Your defense and max magic have increased, and you have learned a new skill: Fireball.';
            break;
          default:
            break;
        }
        changes.story = `${changes.story ?? ''}\n\n${levelUpMessage}`;
      }

      // Handle tasks
      const newTasks = [...prevState.tasks];
      changes.tasks?.add?.forEach(task => {
        newTasks.push({ ...task, status: 'open' });
      });
      changes.tasks?.complete?.forEach(taskId => {
        const task = newTasks.find(t => t.id === taskId);
        if (task) task.status = 'completed';
      });

      // Set the first task as active if no active task is set
      const activeTask = prevState.activeTask ?? (newTasks.length > 0 ? newTasks[0].id : null);

      // Handle achievements
      const newAchievements = [...prevState.achievements];
      changes.achievements?.add?.forEach(achievement => {
        newAchievements.push(achievement);
      });
      changes.achievements?.complete?.forEach(achievementId => {
        const achievement = newAchievements.find(a => a.id === achievementId);
        if (achievement) achievement.status = 'completed';
      });

      return {
        ...prevState,
        ...changes,
        playerStats: newPlayerStats,
        tasks: newTasks,
        achievements: newAchievements,
        activeTask: changes.activeTask ?? activeTask,
        inventory: changes.inventory ?? prevState.inventory, // Ensure inventory is always defined
        equippedItems: changes.equippedItems ?? prevState.equippedItems, // Update equippedItems
        story: changes.story ?? prevState.story,
        //story: `${prevState.story}${levelUpMessage ? `\n\n${levelUpMessage}` : ''}${changes.story ? `\n\n${changes.story}` : ''}`,
        initialQuestionAnswered: changes.initialQuestionAnswered ?? prevState.initialQuestionAnswered,
      };
    });
  };

  const addItem = createAddItem(setGameState);

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
    <GameContext.Provider value={{ gameState, updateGameState, addItem }}>
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
