import React, { useState, useRef, useEffect } from 'react';
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
import { getAIResponse } from '../utils/ai';

export default function HomeScreen() {
  const [story, setStory] = useState(
    'Welcome, brave adventurer! The journey ahead is perilous. Type your command to begin...'
  );
  const [loading, setLoading] = useState(false);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [input, setInput] = useState('');

  // Ref for auto-scrolling
  const storyScrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to the bottom when the story updates
  useEffect(() => {
    storyScrollViewRef.current?.scrollToEnd({ animated: true });
  }, [story]);

  async function handleInput(command: string) {
    setLoading(true);

    // Prepare the game state to include in the prompt
    const gameState = `
    Player Stats:
    - Health: 100
    - Gold: 50
    - Food: 30
    - Wood: 20

    Inventory:
    - Sword
    - Shield

    Story So Far:
    ${story}
    `;

    // Create the prompt combining game state and player input
    const prompt = `
    ${gameState}

    Player's Command: ${command}

    Continue the story based on the player's command.
    `;

    const aiResponse = await getAIResponse(prompt);

    setStory((prevStory) => `${prevStory}\n\n${aiResponse}`);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Adjust for the height of the header
      enabled={Platform.OS === 'ios'} // Only enable on iOS
    >
      {/* Dismiss keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statsLeft}>
              <Text style={styles.stat}>❤️ 100</Text>
              <Text style={styles.stat}>💰 50</Text>
              <Text style={styles.stat}>🍗 30</Text>
              <Text style={styles.stat}>🌲 20</Text>
            </View>
            <View style={styles.statsRight}>
              <Text style={styles.equipped}>🗡️ Sword</Text>
              <Text style={styles.equipped}>🛡️ Shield</Text>
            </View>
          </View>

          {/* Story Pane */}
          <ScrollView
            ref={storyScrollViewRef}
            style={styles.storyPane}
            contentContainerStyle={{ flexGrow: 1 }} // Ensures proper scrolling behavior
            keyboardShouldPersistTaps="handled" // Allows taps to propagate when keyboard is dismissed
            >
            <Text style={styles.storyText}>{story}</Text>
            {loading && <Text style={styles.loadingText}>Thinking...</Text>}
            </ScrollView>


          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => setInventoryVisible(!inventoryVisible)} style={styles.actionButton}>
              <Text style={styles.buttonText}>📦 Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>🗺 Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>🔥 Camp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>🔮 Abilities</Text>
            </TouchableOpacity>
          </View>

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="Type your command here..."
                value={input}
                onChangeText={setInput} // Updates the input value on every change
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  if (input.trim()) {
                    handleInput(input.trim());
                    setInput(''); // Clear the input field after sending
                  }
                }}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Inventory Panel */}
          {inventoryVisible && (
            <View style={styles.inventoryPanel}>
              <Text style={styles.inventoryTitle}>Inventory</Text>
              <View style={styles.inventoryItem}>
                <Text>🗡️ Sword</Text>
                <TouchableOpacity>
                  <Text style={styles.actionButtonText}>Equip</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inventoryItem}>
                <Text>🛡️ Shield</Text>
                <TouchableOpacity>
                  <Text style={styles.actionButtonText}>Equip</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inventoryItem}>
                <Text>🍗 Food</Text>
                <TouchableOpacity>
                  <Text style={styles.actionButtonText}>Use</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setInventoryVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
    justifyContent: 'flex-end', // Ensures the input field stays at the bottom
  },
  inputBox: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f4ec',
    borderTopWidth: 2,
    borderTopColor: '#4b2e05',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    padding: 5,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#4b2e05',
    borderRadius: 4,
    padding: 10,
    marginLeft: 5,
  },
  sendButtonText: {
    color: '#fff',
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
  actionButtonText: {
    color: '#4b2e05',
    fontWeight: 'bold',
  },  
});
