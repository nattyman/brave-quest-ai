import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type

type StoryPaneProps = {
  gameState: GameState;
  loading: boolean;
  scrollViewRef: React.RefObject<ScrollView>;
};

export default function StoryPane({ gameState, loading, scrollViewRef }: StoryPaneProps) {
  return (
    <ScrollView
      style={styles.storyPane}
      ref={scrollViewRef}
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
    >
      <View>
        <Text style={styles.storyText}>{gameState.story}</Text>
        {loading && <Text style={styles.loadingText}>Thinking...</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
