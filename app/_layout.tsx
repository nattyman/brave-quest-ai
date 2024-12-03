import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import { GameProvider } from '../src/GameContext';
import { Stack } from 'expo-router';
import { DebugProvider } from '../src/DebugContext';

export default function Layout() {
  return (
    <GameProvider>
      <DebugProvider>
        <SafeAreaView style={styles.safeArea}>
          <Stack screenOptions={{ headerShown: false }}>
            <Slot /> {/* Renders the current screen */}
          </Stack>
        </SafeAreaView>
      </DebugProvider>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c2a772', // Match the stats bar background
  },
  container: {
    flex: 1,
    backgroundColor: '#fef9e7', // Main app background
    padding: 10, // Move padding inside the container style
  },
});
