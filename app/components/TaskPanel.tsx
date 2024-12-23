import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type

type TaskPanelProps = {
  gameState: GameState;
  setTaskPanelVisible: (value: boolean) => void;
  updateGameState: (changes: Partial<GameState>) => void;
};

export default function TaskPanel({ gameState, setTaskPanelVisible, updateGameState }: TaskPanelProps) {
  const handleTaskClick = (taskId: string) => {
    updateGameState({ activeTask: taskId });
  };

  return (
    <View style={styles.taskPanel}>
      <ScrollView style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>Tasks</Text>
        </View>
        {gameState.tasks.map(task => (
          <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => handleTaskClick(task.id)}>
            <Text style={styles.taskName}>
              {task.status === 'active' ? '⬤' : task.status === 'completed' ? '✔' : '◯'} {task.name}
            </Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setTaskPanelVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  taskPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff8e1',
    borderTopWidth: 4,
    borderTopColor: '#4b2e05',
    padding: 0,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  taskTitle: {
    fontSize: 16,
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
  taskCard: {
    backgroundColor: '#fff8e1', // Light parchment background
    borderWidth: 2,
    borderColor: '#c2a772',
    borderRadius: 8,
    padding: 10,
    margin: 6,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  },
  taskName: {
    fontFamily: 'Uncial Antiqua, cursive',
    marginBottom: 3,
    color: '#4b2e05',
    fontSize: 15,
    fontWeight: 'bold',
  },
  taskDescription: {
    margin: 3,
    fontSize: 12,
  },
  taskContent: {
    paddingBottom: 0,
    marginBottom: 35,
    paddingLeft: 10,
    paddingRight: 10,
    maxHeight: '100%',
  },
});
