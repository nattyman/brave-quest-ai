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
import basicItems from '../story/items-basic.json'; // Import list of available items
import StatsBar from './components/StatsBar'; // Import the StatsBar component
import ActionButtons from './components/ActionButtons'; // Import the ActionButtons component
import InventoryPanel from './components/InventoryPanel'; // Import the InventoryPanel component
import StoryPane from './components/StoryPane'; // Import the StoryPane component
import InputBox from './components/InputBox'; // Import the InputBox component
import StatsPanel from './components/StatsPanel'; // Import the StatsPanel component

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
    Story Information:
    ${JSON.stringify(questData)}
    
    Available Items List:
    ${JSON.stringify(basicItems)}

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

    Player's Command: ${command}

    Dice Rules:
      - Determine level difficulty (1-20) for success or failure for whatever task player is attempting.
      - A 20-sided die (d20) will be rolled to determine the outcome of actions.
      - A roll of 1 is a critical failure-worst case scenario, and a roll of 20 is a critical success-best possible case.
      - Add relevent proficiency, weapon, and item stats to the dice roll to determine the outcome.
    Random d20 Dice Roll: ${diceRoll}

    Response Instructions: Respond with plus or minus changes to the game state in this JSON Object format:
      {

        "playerStats": { 
          "health": -x, 
          "maxHealth": x, 
          "stamina": -x, 
          "maxStamina": x, 
          "magic": -x, 
          "maxMagic": x, 
          "attack": x, 
          "defense": x, 
          "xp": x, 
          "level": x, 
          "skills": ["new skill"],
          "gold": x, 
          "strength": x, 
          "dexterity": x, 
          "intelligence": x, 
          "charisma": x, 
          "wisdom": x, 
          "constitution": x, 
          "stealth": x, 
          "perception": x }, 
        "inventory": { "add": ["item_id", "item_id"], "remove": ["item_id"] }, // Only add items from the available items list.
        "equippedItems": ["item_id", null],
        "story": "The story content goes here..."

      }
      Response Rules:
        - Only send changes to stats that need updated, whole numbers to add, x, and negative numbers to subtrack, -x. Don't use a + sign.
        - If a stat is not updated, don't include it in the JSON object.
        - Response instruction data are just examples only provide what fits in the context of the story.
        - Provide the updated game state as a plain JSON object without any formatting characters like \`\`\`
        - Nudge the player forward in the quest, but give them space to explore.
        - Don't directly quote story text, paraphrase and expand on it.
        - Always ask what the player wants to do next inside the story JSON.
        - Character must choose to purchase items, don't purchase for them.
        - Don't summarize combat, make player choose actions, step by step through combat
        - Remember to add and remove items from inventory as part of the story. Include item and stat changes in the story.
        - Only update character profeciencies when they level up, and it should be related to the story, and skills they used.
    `;

    addDebugMessage('\r\r###### Message Sent ######\r\r', prompt); // Add labeled message

    const aiResponse = await getAIResponse(prompt);

    addDebugMessage('\r\r###### Message Received ######\r\r', aiResponse); // Add labeled message

    try {
      const changes = JSON.parse(aiResponse);
      const newEquippedItems = changes.equippedItems?.map((name: string) => gameState.inventory.find(item => item.name === name) || null) ?? gameState.equippedItems;

      // Add new items to the inventory

      changes.inventory?.add?.forEach((itemId: string) => { // Check if the item exists in the basic items list
        const itemDetails = basicItems.itemsBasic.find(item => item.id === itemId);
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


      updateGameState({
        playerStats: {
          ...gameState.playerStats,
          health: Math.max(gameState.playerStats.health + (changes.playerStats.health || 0), 0),
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
            statsVisible={statsVisible}
            setStatsVisible={setStatsVisible}
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

