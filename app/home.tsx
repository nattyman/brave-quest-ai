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

export default function HomeScreen() {
  const { gameState, updateGameState } = useGame();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { debug, addMessage, setDebug } = useDebug(); // Get setDebug from useDebug
  const scrollViewRef = useRef<ScrollView>(null); // Add a ref for the ScrollView
  const [inventoryVisible, setInventoryVisible] = useState(false); // Add state for inventory visibility

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
    const playerResponse = `Player: ${command}`;
    updateGameState({
      story: `${gameState.story}\n\n${playerResponse}`,
    });

    const initialPrompt = gameState.initialQuestionAnswered
      ? ''
      : 'Welcome, brave adventurer! What is your name?\n';

    const prompt = `
      ${initialPrompt}
      Game State:
      Player Stats:
      - Health: ${gameState.playerStats.health}
      - Gold: ${gameState.playerStats.gold}
      - Food: ${gameState.playerStats.food}
      - Wood: ${gameState.playerStats.wood}

      Inventory:
      ${gameState.inventory.map(item => `${item.name} (${item.quantity})`).join(', ')}

      Equipped Items:
      ${gameState.equippedItems.map(item => item ? item.name : 'None').join(', ')}

      Story So Far:
      ${gameState.story}

      // Use of unequipped items is slower and may be less effective, like drawing sword in combat or blocking a blow with shield.
      Player's Command: ${command} 

      Instructions: Respond with changes to the game state in this format:
      {
        "playerStats": { "health": -x, "gold": +x, "food": 0 }, // x = a number, only + or - responses, 0 for no change
        "inventory": { "add": ["Health Potion", "Sword of fire"], "remove": ["Old Sword"] }, // specify items to add or remove
        "equippedItems": ["Sword of fire", null], // specify equipped items, null for empty slots. Only 2 slots available
        "story": "You took damage but found a health potion."
      }
        // These are just examples, be creative!
    `;

    const aiResponse = await getAIResponse(prompt, addMessage);

    try {
      const changes = JSON.parse(aiResponse);
      const newEquippedItems = changes.equippedItems?.map(name => gameState.inventory.find(item => item.name === name) || null) ?? gameState.equippedItems;

      updateGameState({
        playerStats: {
          ...gameState.playerStats,
          health: Math.max(gameState.playerStats.health + (changes.playerStats.health || 0), 0),
          gold: gameState.playerStats.gold + (changes.playerStats.gold || 0),
          food: gameState.playerStats.food + (changes.playerStats.food || 0),
          wood: gameState.playerStats.wood + (changes.playerStats.wood || 0),
        },
        inventory: changes.inventory ? [
          ...gameState.inventory.filter(item => !changes.inventory.remove?.includes(item.name)),
          ...changes.inventory.add?.map((name: string) => ({ id: `${Date.now()}`, name, quantity: 1 })) || []
        ] : gameState.inventory,
        equippedItems: newEquippedItems, // Ensure equippedItems is always defined
        story: `${gameState.story}\n\n${playerResponse}\n\n${changes.story}`,
        initialQuestionAnswered: true, // Set to true after the first response
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
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={() => setDebug(!debug)}
          >
            <View style={styles.statsBar}>
              <Text style={styles.stat}>❤️ {gameState.playerStats.health}</Text>
              <Text style={styles.stat}>💰 {gameState.playerStats.gold}</Text>
              <Text style={styles.stat}>🍗 {gameState.playerStats.food}</Text>
              <Text style={styles.stat}>���� {gameState.playerStats.wood}</Text>
            </View>
          </TouchableOpacity>

          {/* Story Pane */}
          <ScrollView
            style={styles.storyPane}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <Text style={styles.storyText}>{gameState.story}</Text>
            {loading && <Text style={styles.loadingText}>Thinking...</Text>}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setInventoryVisible(!inventoryVisible)} // Toggle inventory visibility
            >
              <Text style={styles.buttonText}>📦 Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>�� Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (debug) {
                  router.push('/DebugScreen');  // Use leading slash and match case
                } else {
                  // Existing Camp action
                }
              }}
            >
              <Text style={styles.buttonText}>{debug ? '🐞 Debug' : '🔥 Camp'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                router.push('/MenuScreen');
                console.log('MenuScreen pushed');
              }}
            >
              <Text style={styles.buttonText}>📋 Menu</Text>
            </TouchableOpacity>
          </View>

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your command here..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                if (input.trim()) {
                  handleInput(input.trim());
                  setInput('');
                }
              }}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>

          {/* Inventory Panel */}
          {inventoryVisible && (
            <View style={styles.inventoryPanel}>
              <View style={styles.inventoryHeader}>
                <Text style={styles.inventoryTitle}>Inventory</Text>
                <TouchableOpacity onPress={() => setInventoryVisible(false)}>
                  <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
              </View>
              {gameState.inventory.map((item, index) => {
                const isEquipped = gameState.equippedItems.some(equippedItem => equippedItem?.id === item.id);
                return (
                  <View
                    key={index}
                    style={[
                      styles.inventoryItem,
                      isEquipped && styles.equippedItem,
                    ]}
                  >
                    <Text style={styles.itemName}>{item.name} {isEquipped && '✔️'}</Text>
                    <Text style={styles.itemQuantity}>({item.quantity})</Text>
                    <View style={styles.inventoryActions}>
                      <TouchableOpacity
                        style={styles.inventoryButton}
                        onPress={() => handleUse(item.id)}
                      >
                        <Text>Use</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inventoryButton}
                        onPress={() => handleEquip(item.id)}
                      >
                        <Text>{isEquipped ? 'Stow' : 'Equip'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#c2a772',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4b2e05',
  },
  statsLeft: { flexDirection: 'row' },
  stat: {
    marginHorizontal: 5,
    fontSize: 12,
  },
  statsRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap', // Ensure wrapping if text overflows
  },
  equipped: {
    marginHorizontal: 5,
    fontSize: 12, 
  },
  storyPane: {
    flex: 1,
    backgroundColor: '#fff8e1',
    marginVertical: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: '#4b2e05',
  },
  storyText: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingText: {
    fontStyle: 'italic',
    color: 'gray',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#c2a772',
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: '#4b2e05',
  },
  actionButton: {
    backgroundColor: '#f8f4ec',
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    padding: 5,
  },
  buttonText: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f4ec',
    borderTopColor: '#4b2e05',
    borderTopWidth: 2,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
    marginRight: 2,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#4b2e05',
    borderRadius: 4,
    marginLeft: 2,

  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
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

