import React, { useState } from 'react';
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

  async function handleInput(command: string) {
    setLoading(true);

    const prompt = `
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
        "playerStats": { "health": -10, "gold": 20 },
        "inventory": ["Potion"],
        "story": "You took damage but found a potion."
      }
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
        inventory: [...gameState.inventory, ...(changes.inventory || [])],
        story: `${gameState.story}\n\n${changes.story}`,
      });
    } catch (error) {
      console.error('Failed to parse AI response:', error);
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
          <ScrollView style={styles.storyPane}>
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
              <Text style={styles.buttonText}>{debug ? 'Debug' : 'Camp'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>🔮 Abilities</Text>
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
});
