import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGame } from '../src/GameContext';
import { router } from 'expo-router';

export default function MenuScreen() {
  const navigation = useNavigation();
  const { updateGameState } = useGame();

  const handleRestart = () => {
    // Reset the game state to its initial state
    updateGameState({
      playerStats: { health: 100, gold: 50, food: 30, wood: 20 },
      inventory: [
        { id: '1', name: 'Sword', quantity: 1 },
        { id: '2', name: 'Shield', quantity: 1 },
      ],
      equippedItems: [null, null], // Reset equippedItems
      story: 'Welcome, brave adventurer! The journey ahead is perilous. What is your name?',
      initialQuestionAnswered: false,
    });
    // navigation.navigate('home'); // Navigate back to the game
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Menu</Text>

      <TouchableOpacity style={styles.menuButton} onPress={handleRestart}>
        <Text style={styles.menuButtonText}>Restart Game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => { router.push('/home') }}
      >
        <Text style={styles.menuButtonText}>Return to Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5dc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  menuButton: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#b28772',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
