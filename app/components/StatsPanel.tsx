import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type

type StatsPanelProps = {
  gameState: GameState;
  setStatsVisible: (value: boolean) => void;
};

export default function StatsPanel({ gameState, setStatsVisible }: StatsPanelProps) {
  return (
    <View style={styles.statsPanel}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Player Stats</Text>
        <TouchableOpacity onPress={() => setStatsVisible(false)}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.stat}>Name: {gameState.playerStats.name}</Text>
      <Text style={styles.stat}>Health: {gameState.playerStats.health}/{gameState.playerStats.maxHealth}</Text>
      <Text style={styles.stat}>Stamina: {gameState.playerStats.stamina}/{gameState.playerStats.maxStamina}</Text>
      <Text style={styles.stat}>Magic: {gameState.playerStats.magic}/{gameState.playerStats.maxMagic}</Text>
      <Text style={styles.stat}>Attack: {gameState.playerStats.attack}</Text>
      <Text style={styles.stat}>Defense: {gameState.playerStats.defense}</Text>
      <Text style={styles.stat}>XP: {gameState.playerStats.xp}</Text>
      <Text style={styles.stat}>Level: {gameState.playerStats.level}</Text>
      <Text style={styles.stat}>Skills: {gameState.playerStats.skills.join(', ')}</Text>
      <Text style={styles.stat}>Gold: {gameState.playerStats.gold}</Text>
      <Text style={styles.stat}>Strength: {gameState.playerStats.strength}</Text>
      <Text style={styles.stat}>Dexterity: {gameState.playerStats.dexterity}</Text>
      <Text style={styles.stat}>Intelligence: {gameState.playerStats.intelligence}</Text>
      <Text style={styles.stat}>Charisma: {gameState.playerStats.charisma}</Text>
      <Text style={styles.stat}>Wisdom: {gameState.playerStats.wisdom}</Text>
      <Text style={styles.stat}>Constitution: {gameState.playerStats.constitution}</Text>
      <Text style={styles.stat}>Stealth: {gameState.playerStats.stealth}</Text>
      <Text style={styles.stat}>Perception: {gameState.playerStats.perception}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff8e1',
    borderTopWidth: 4,
    borderTopColor: '#4b2e05',
    padding: 10,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 16,
    color: 'red',
  },
  stat: {
    fontSize: 16,
    marginBottom: 5,
  },
});
