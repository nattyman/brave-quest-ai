import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type

type MagicPanelProps = {
  gameState: GameState;
  setMagicVisible: (value: boolean) => void;
  handleInput: (command: string) => void; // Add handleInput to props
};

export default function MagicPanel({ gameState, setMagicVisible, handleInput }: MagicPanelProps) {
  return (
    <View style={styles.magicPanel}>
      <View style={styles.magicHeader}>
        <Text style={styles.magicTitle}>Magic Spells</Text>
      </View>
      <ScrollView style={styles.magicContent}>
        {gameState.magicSpells.length === 0 ? (
          <Text style={styles.emptyMessage}>No spells available.</Text>
        ) : (
          gameState.magicSpells.map((spell, index) => (
            <View key={index} style={styles.magicItem}>
              <Text style={styles.spellName}>{spell.name}</Text>
              <TouchableOpacity
                style={styles.magicButton}
                onPress={() => handleInput(`Cast ${spell.name}`)} // Use handleInput to send spell name
              >
                <Text>Cast</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setMagicVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  magicPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff8e1',
    borderTopWidth: 4,
    borderTopColor: '#4b2e05',
    padding: 0,
  },
  magicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  magicTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#4b2e05',
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 4,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  magicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    backgroundColor: '#e6ddc9',
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    marginBottom: 5,
  },
  spellName: {
    flex: 1,
    textAlign: 'left',
  },
  magicButton: {
    marginLeft: 5,
    padding: 5,
    backgroundColor: '#f8f4ec',
    borderWidth: 1,
    borderColor: '#4b2e05',
    borderRadius: 4,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  magicContent: {
    padding: 10,
    maxHeight: '80%',
  },
});
