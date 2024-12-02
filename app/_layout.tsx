import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Slot /> {/* This renders your nested screens */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c2a772', // Match the stats bar background to make it seamless
  },
  container: {
    flex: 1,
    backgroundColor: '#fef9e7', // Main app background
    padding: 10,
  },
});
