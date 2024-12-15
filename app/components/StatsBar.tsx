import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type

type StatsBarProps = {
  gameState: GameState;
  debug: boolean;
  setDebug: (value: boolean) => void;
};

export default function StatsBar({ gameState, debug, setDebug }: StatsBarProps) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onLongPress={() => setDebug(!debug)}
    >
      <View style={styles.statsBar}>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>❤️ {gameState.playerStats.health}/{gameState.playerStats.maxHealth}</Text>
          <Text style={styles.stat}>⚡ {gameState.playerStats.stamina}/{gameState.playerStats.maxStamina}</Text>
          <Text style={styles.stat}>✨ {gameState.playerStats.magic}/{gameState.playerStats.maxMagic}</Text>
          <Text style={styles.stat}>💰 {gameState.playerStats.gold}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>⚔️ {gameState.playerStats.attack}</Text>
          <Text style={styles.stat}>🛡️ {gameState.playerStats.defense}</Text>
          <Text style={styles.stat}>⭐ XP: {gameState.playerStats.xp}</Text>
          <Text style={styles.stat}>🏅 Level: {gameState.playerStats.level}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'column',
    backgroundColor: '#c2a772',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4b2e05',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  stat: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
});
