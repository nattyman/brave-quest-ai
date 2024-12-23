import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { getAIResponse } from '../utils/ai'; // Import the AI function
import { useGame } from '../src/GameContext'; // Remove addItem from import
import { useRouter } from 'expo-router';
import { useDebug } from '../src/DebugContext';
import questData from '../story/quest1-milestone1.json'; // Import the quest data
import itemsData from '../story/items.json'; // Import the combined items list
import magicSystem from '../story/spells.json'; // Import the magic system
import StatsBar from './components/StatsBar'; // Import the StatsBar component
import ActionButtons from './components/ActionButtons'; // Import the ActionButtons component
import InventoryPanel from './components/InventoryPanel'; // Import the InventoryPanel component
import StoryPane from './components/StoryPane'; // Import the StoryPane component
import InputBox from './components/InputBox'; // Import the InputBox component
import StatsPanel from './components/StatsPanel'; // Import the StatsPanel component
import MagicPanel from './components/MagicPanel'; // Import the MagicPanel component
import Store from './components/store'; // Import the Store component
import TaskBar from './components/TaskBar'; // Import the TaskBar component
import TaskPanel from './components/TaskPanel'; // Import the TaskPanel component

export default function HomeScreen() {
  const { gameState, updateGameState, addItem } = useGame(); // Get addItem from context
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { debug, addMessage, setDebug, addDebugMessage } = useDebug(); // Get addDebugMessage from useDebug
  const scrollViewRef = useRef<ScrollView>(null); // Add a ref for the ScrollView
  const [inventoryVisible, setInventoryVisible] = useState(false); // Add state for inventory visibility
  const [initialQuestionAnswered, setInitialQuestionAnswered] = useState(false); // Add state for initial question
  const [statsVisible, setStatsVisible] = useState(false); // Add state for stats visibility
  const [magicVisible, setMagicVisible] = useState(false); // Add state for magic visibility
  const [storeVisible, setStoreVisible] = useState(false); // Add state for store visibility
  const [storeItems, setStoreItems] = useState([]); // Add state for store items
  const [atStore, setAtStore] = useState(false); // Add state for AtStore
  const [taskPanelVisible, setTaskPanelVisible] = useState(false); // Add state for task panel visibility

  // Function to roll a d20
  const rollDice = () => Math.floor(Math.random() * 20) + 1;

  // Handle equipping an item
  const handleEquip = (itemId: string) => {
    const item = gameState.inventory.find(i => i.id === itemId);
    if (!item) return;

    // Check if the item is already equipped
    const isAlreadyEquipped = gameState.equippedItems.some(equippedItem => equippedItem?.id === itemId);
    if (isAlreadyEquipped) {
      // Unequip the item
      const newEquippedItems = gameState.equippedItems.map(equippedItem =>
        equippedItem?.id === itemId ? null : equippedItem
      );
      updateGameState({ equippedItems: newEquippedItems });
      return;
    }

    // Find the first available slot
    const slotIndex = gameState.equippedItems.findIndex(equippedItem => !equippedItem);
    if (slotIndex === -1) {
      alert('No available slots to equip this item.');
      return;
    }

    // Equip the item
    const newEquippedItems = [...gameState.equippedItems];
    newEquippedItems[slotIndex] = item;

    updateGameState({ equippedItems: newEquippedItems });
  };

  // Handle using an item
  const handleUse = (itemId: string) => {
    // Implement use logic here
  };

  // Handle input from the player
  async function handleInput(command: string) {
    setLoading(true);
    const playerResponse = `Player: ${command}` ;// Could replace Player with the player's name
    updateGameState({
      story: `${gameState.story}\n\n${playerResponse}`,
    });

    if (!initialQuestionAnswered) {
      // Store the player's name and update the game state
      updateGameState({
        playerStats: { ...gameState.playerStats, name: command },
        story: `${gameState.story}\n\nHello, ${command}, you find yourself entering the small village of Wyrdwell. You have heard many strange tales and rumors about Wyrdwell and you wanted to see if they were true. What would you like to do first?`,
      });
      setInitialQuestionAnswered(true);
      setLoading(false);
      return;
    }

    const diceRoll = rollDice(); // Roll a d20
    console.log('Dice Roll:', diceRoll);

  const prompt = `
  Story So Far:
  ${gameState.story}    

  Game State:
  Player Stats:
  - Name: ${gameState.playerStats.name}
  - Health: ${gameState.playerStats.health}/${gameState.playerStats.maxHealth}
  - Stamina: ${gameState.playerStats.stamina}/${gameState.playerStats.maxStamina}
  - Magic: ${gameState.playerStats.magic}/${gameState.playerStats.maxMagic}
  - Attack: ${gameState.playerStats.attack}
  - Defense: ${gameState.playerStats.defense}
  - XP: ${gameState.playerStats.xp}
  - Level: ${gameState.playerStats.level}
  - Skills: ${gameState.playerStats.skills.join(', ')}
  - Gold: ${gameState.playerStats.gold}
  - Strength: ${gameState.playerStats.strength}
  - Dexterity: ${gameState.playerStats.dexterity}
  - Intelligence: ${gameState.playerStats.intelligence}
  - Charisma: ${gameState.playerStats.charisma}
  - Wisdom: ${gameState.playerStats.wisdom}
  - Constitution: ${gameState.playerStats.constitution}
  - Stealth: ${gameState.playerStats.stealth}
  - Perception: ${gameState.playerStats.perception}

  Inventory:
  ${gameState.inventory.map(item => `${item.name} (${item.quantity})`).join(', ')}

  Equipped Items:
  ${gameState.equippedItems.map(item => item ? item.name : 'None').join(', ')}

  Magic Spells:
  ${gameState.magicSpells.map(spell => spell.name).join(', ')}

  Player's Command: ${command}

  Random d20 Dice Roll: ${diceRoll}

  Active Task: ${gameState.activeTask ? gameState.tasks.find(task => task.id === gameState.activeTask)?.name : 'None'}

  `;

    addDebugMessage('\r\r###### Message Sent ######\r\r', prompt); // Add labeled message

    const aiResponse = await getAIResponse(prompt);

    addDebugMessage('\r\r###### Message Received ######\r\r', aiResponse); // Add labeled message

    try {
      const changes = JSON.parse(aiResponse);
      const newEquippedItems = changes.equippedItems?.map((name: string) => gameState.inventory.find(item => item.name === name) || null) ?? gameState.equippedItems;

      // Add new items to the inventory
      changes.inventory?.add?.forEach((itemId: string) => { // Check if the item exists in the combined items list
        const itemDetails = itemsData.items.find(item => item.id === itemId);
        if (itemDetails) {
          addItem({ id: itemDetails.id, name: itemDetails.name, quantity: 1 });
        } else {
          console.error(`Item with id ${itemId} does not exist in the available items list.`);
        }
      });

      // Remove items from the inventory
      const updatedInventory = gameState.inventory.map(item => {
        if (changes.inventory?.remove?.includes(item.id)) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);

      // Add new spells to the magicSpells array
      const newSpells = changes.spells?.add?.filter((spellName: string) => {
        return magicSystem.magicSystem.spells.some(spell => spell.name === spellName);
      }).map(spellName => ({ name: spellName })) ?? [];

      // Update store items if provided
      if (changes.store) {
        const storeItemIds = changes.store.map((itemId: string) => itemId);
        setStoreItems(storeItemIds);
      }

      // Update AtStore state if provided
      if (changes.AtStore !== undefined) {
        setAtStore(changes.AtStore);
      }

      updateGameState({
        playerStats: {
          ...gameState.playerStats,
          health: Math.max(gameState.playerStats.health + (changes.playerStats.health || 0), 0),
          magic: Math.max(gameState.playerStats.magic + (changes.playerStats.magic || 0), 0), 
          gold: gameState.playerStats.gold + (changes.playerStats.gold || 0),
          xp: gameState.playerStats.xp + (changes.playerStats.xp || 0),
          strength: gameState.playerStats.strength + (changes.playerStats.strength || 0),
          dexterity: gameState.playerStats.dexterity + (changes.playerStats.dexterity || 0),
          intelligence: gameState.playerStats.intelligence + (changes.playerStats.intelligence || 0),
          charisma: gameState.playerStats.charisma + (changes.playerStats.charisma || 0),
          wisdom: gameState.playerStats.wisdom + (changes.playerStats.wisdom || 0),
          constitution: gameState.playerStats.constitution + (changes.playerStats.constitution || 0),
          stealth: gameState.playerStats.stealth + (changes.playerStats.stealth || 0),
          perception: gameState.playerStats.perception + (changes.playerStats.perception || 0),
        },
        inventory: updatedInventory,
        equippedItems: newEquippedItems,
        magicSpells: [...gameState.magicSpells, ...newSpells],
        story: `${gameState.story}\n\n${playerResponse}\n\n${changes.story}`,
        initialQuestionAnswered: true, // Set to true after the first response where player gives their name
        tasks: {
          add: changes.tasks?.add ?? [],
          complete: changes.tasks?.complete ?? [],
        },
        achievements: {
          add: changes.achievements?.add ?? [],
          complete: changes.achievements?.complete ?? [],
        },
        activeTask: changes.activeTask ?? gameState.activeTask,
      });
      console.log('Magic:', gameState.playerStats.magic + (changes.playerStats.magic || 0));
    } catch (error) {
      console.error('Failed to parse AI response:', aiResponse, error);
      updateGameState({
        story: `${gameState.story}\n\n${playerResponse}\n\n"Sorry, what's that? Mumbling won't get you anywhere." -The game master is very old, hard of hearing, and grumpy. Please try again.`,
      });
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Task Bar */}
          <TaskBar gameState={gameState} setTaskPanelVisible={setTaskPanelVisible} />
          {/* Stats Bar */}
          <StatsBar gameState={gameState} debug={debug} setDebug={setDebug} />
          {/* Story Pane */}
          <StoryPane gameState={gameState} loading={loading} scrollViewRef={scrollViewRef} />
          {/* Action Buttons */}
          <ActionButtons
            inventoryVisible={inventoryVisible}
            setInventoryVisible={setInventoryVisible}
            debug={debug}
            router={router}
            statsVisible={statsVisible}
            setStatsVisible={setStatsVisible}
            magicVisible={magicVisible} // Pass magicVisible state
            setMagicVisible={setMagicVisible} // Pass setMagicVisible function
          />
          {/* Input Box */}
          <InputBox input={input} setInput={setInput} handleInput={handleInput} />
          {/* Inventory Panel */}
          {inventoryVisible && (
            <InventoryPanel
              gameState={gameState}
              handleUse={handleUse}
              handleEquip={handleEquip}
              setInventoryVisible={setInventoryVisible}
            />
          )}
          {/* Stats Panel */}
          {statsVisible && (
            <StatsPanel
              gameState={gameState}
              setStatsVisible={setStatsVisible}
            />
          )}
          {/* Magic Panel */}
          {magicVisible && (
            <MagicPanel
              gameState={gameState}
              setMagicVisible={setMagicVisible}
              handleInput={handleInput} // Pass handleInput function
            />
          )}
          {/* Task Panel */}
          {taskPanelVisible && (
            <TaskPanel
              gameState={gameState}
              setTaskPanelVisible={setTaskPanelVisible}
              updateGameState={updateGameState}
            />
          )}
          {/* Store Panel */}
          {storeVisible && (
            <Store
              storeItems={storeItems}
              onClose={() => setStoreVisible(false)}
            />
          )}
          {/* Store Button */}
          {atStore && (
            <TouchableOpacity
              style={styles.storeButton}
              onPress={() => setStoreVisible(true)}
            >
              <Text style={styles.storeButtonText}>S{"\n"}h{"\n"}o{"\n"}p</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9e7',
  },
  storeButton: {
    position: 'absolute',
    top: 70,
    right: 0,
    backgroundColor: '#4b2e05',
    padding: 10,
    borderRadius: 4,
    // add transparency to the button
    opacity: 0.8,
    // make text vertical
    //transform: [{ rotate: '90deg' }],
  },
  storeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  taskBar: {
    backgroundColor: '#c2a772',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4b2e05',
  },
  taskBarText: {
    fontSize: 14,
    color: '#4b2e05',
  },
});

