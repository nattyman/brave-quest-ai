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
      ${gameState.inventory.join(', ')}

      Story So Far:
      ${gameState.story}

      Player's Command: ${command}

      Instructions: Respond with changes to the game state in this format:
      {
        "playerStats": { "health": -x, "gold": +x, "food": 0 }, // only + or - responses, 0 for no change
        "inventory": ["Potion", "Sword of fire", "Guantlets of power"], // add or remove items
        "story": "You took damage but found a potion."
      }
        // These are just examples, be creative!
    `;

    const aiResponse = await getAIResponse(prompt, addMessage);

    try {
      const changes = JSON.parse(aiResponse);
      updateGameState({
        playerStats: {
          ...gameState.playerStats,
          health: Math.max(gameState.playerStats.health + (changes.playerStats.health || 0), 0),
          gold: gameState.playerStats.gold + (changes.playerStats.gold || 0),
          food: gameState.playerStats.food + (changes.playerStats.food || 0),
          wood: gameState.playerStats.wood + (changes.playerStats.wood || 0),
        },
        inventory: changes.inventory || [],
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
              <Text style={styles.stat}>🌲 {gameState.playerStats.wood}</Text>
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
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>📦 Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>🗺 Map</Text>
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
  inventoryTitle: {
    fontSize: 18,
    marginBottom: 10,
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
});
