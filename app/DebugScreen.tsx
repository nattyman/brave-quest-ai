import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDebug } from '../src/DebugContext';
import { useRouter } from 'expo-router';

const DebugScreen: React.FC = () => {
  const { messages } = useDebug();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      {messages.map((message, index) => (
        <Text key={index} selectable style={styles.messageText}>
          {message}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: 'blue',
    fontSize: 18,
  },
  messageText: {
    marginBottom: 10,
    fontSize: 16,
  },
});

export default DebugScreen;
