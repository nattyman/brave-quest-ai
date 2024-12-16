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
import { useGame } from '../src/GameContext'; // Import your context
import { useRouter } from 'expo-router';
import { useDebug } from '../src/DebugContext';
import questData from '../story/quest1-milestone1.json'; // Import the quest data
import itemsBasic from '../story/items-basic-list.json'; // Import the basic items data
import StatsBar from './components/StatsBar'; // Import the StatsBar component
import ActionButtons from './components/ActionButtons'; // Import the ActionButtons component
import InventoryPanel from './components/InventoryPanel'; // Import the InventoryPanel component
import StoryPane from './components/StoryPane'; // Import the StoryPane component
import InputBox from './components/InputBox'; // Import the InputBox component

export default function HomeScreen() {
  const { gameState, updateGameState } = useGame();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { debug, addMessage, setDebug, addDebugMessage } = useDebug(); // Get addDebugMessage from useDebug
  const scrollViewRef = useRef<ScrollView>(null); // Add a ref for the ScrollView
  const [inventoryVisible, setInventoryVisible] = useState(false); // Add state for inventory visibility
  const [initialQuestionAnswered, setInitialQuestionAnswered] = useState(false); // Add state for initial question

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
    const playerResponse = `Player: ${command}`;// Could replace Player with the player's name
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

    const prompt = `
    Story Information:
    ${JSON.stringify(questData)}

    Items Available to find or buy:
    ${JSON.stringify(itemsBasic)}

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

      Inventory:
      ${gameState.inventory.map(item => `${item.name} (${item.quantity})`).join(', ')}

      Equipped Items:
      ${gameState.equippedItems.map(item => item ? item.name : 'None').join(', ')}

    Player's Command: ${command}

    Response Instructions: Respond with changes to the game state in this JSON Object format:
      {
        "playerStats": { "health": -x, "maxHealth": +x, "stamina": -x, "maxStamina": +x, "magic": -x, "maxMagic": +x, "attack": +x, "defense": +x, "xp": +x, "level": +x, "skills": ["new skill"], "gold": +x }, //Only send changes to stats and maxStats, 0 if no change
        "inventory": { "add": ["leather_shield", "health_potion"], "remove": ["stamina_potion] },
        "equippedItems": ["wooden_staff", null], // List of item IDs, null if slot is empty
        "story": "You drank your Stamina Potion and restored some Stamina. You found a Leather Shield and Health Potion."
      }
      Response instruction data are just examples, be creative!
      Provide the updated game state as a plain JSON object without any formatting characters like \`\`\`
      Always ask what the player wants to do next inside the story JSON..
    `;

    addDebugMessage('\r\r###### Message Sent ######\r\r', prompt); // Add labeled message

    const aiResponse = await getAIResponse(prompt);

    addDebugMessage('\r\r###### Message Received ######\r\r', aiResponse); // Add labeled message

    try {
      const changes = JSON.parse(aiResponse);
      const newEquippedItems = changes.equippedItems?.map((name: string) => gameState.inventory.find(item => item.name === name) || null) ?? gameState.equippedItems;

      updateGameState({
        playerStats: {
          ...gameState.playerStats,
          health: Math.max(gameState.playerStats.health + (changes.playerStats.health || 0), 0),
          gold: gameState.playerStats.gold + (changes.playerStats.gold || 0),
          xp: gameState.playerStats.xp + (changes.playerStats.xp || 0),
        },
        inventory: changes.inventory ? [
          ...gameState.inventory.filter(item => !changes.inventory.remove?.includes(item.name)),
          ...changes.inventory.add?.map((name: string) => ({ id: `${Date.now()}`, name, quantity: 1 })) || []
        ] : gameState.inventory,
        equippedItems: newEquippedItems, // Ensure equippedItems is always defined
        story: `${gameState.story}\n\n${playerResponse}\n\n${changes.story}`,
        initialQuestionAnswered: true, // Set to true after the first response where player gives their name
      });
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
  inventoryPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff8e1',
    borderTopWidth: 4,
    borderTopColor: '#4b2e05',
    padding: 10,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inventoryTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 16,
    color: 'red',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    backgroundColor: '#e6ddc9',
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    marginBottom: 5,
  },
  equippedItem: {
    backgroundColor: '#d4e157', // Highlight color for equipped items
  },
  itemQuantity: {
    marginRight: 10,
  },
  itemName: {
    flex: 1,
    textAlign: 'left',
  },
  inventoryActions: {
    flexDirection: 'row',
  },
  inventoryButton: {
    marginLeft: 5,
    padding: 5,
    backgroundColor: '#f8f4ec',
    borderWidth: 1,
    borderColor: '#4b2e05',
    borderRadius: 4,
  },
});

