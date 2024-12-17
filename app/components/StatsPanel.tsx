import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type

type StatsPanelProps = {
  gameState: GameState;
  setStatsVisible: (value: boolean) => void;
};

export default function StatsPanel({ gameState, setStatsVisible }: StatsPanelProps) {
  return (
    <View style={styles.statsPanel}>
      <ScrollView style={styles.statsContent}>
        <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Player Stats</Text>
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
      </ScrollView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setStatsVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
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
    padding: 0,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 0,
  },
  closeButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4b2e05',
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 4,
    marginTop: 0,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  stat: {
    fontSize: 16,
    marginBottom: 5,
  },
  statsContent: {
    paddingBottom: 0,
    marginBottom: 0,
    paddingLeft: 10,
    maxHeight: '100%',
  },
});
