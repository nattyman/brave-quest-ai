import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type

type TaskBarProps = {
  gameState: GameState;
  setTaskPanelVisible: (value: boolean) => void;
};

export default function TaskBar({ gameState, setTaskPanelVisible }: TaskBarProps) {
  const activeTask = gameState.tasks.find(task => task.id === gameState.activeTask);

  return (
    <TouchableOpacity style={styles.taskBar} onPress={() => setTaskPanelVisible(true)}>
      <Text style={styles.taskBarText}>
        {activeTask ? `Current Task: ${activeTask.name}` : 'No Active Task'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskBar: {
    backgroundColor: '#c2a772',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4b2e05',
  },
  taskBarText: {
    fontSize: 14,
    color: '#4b2e05',
  },
});
