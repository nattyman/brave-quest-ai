import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, Alert, Clipboard } from 'react-native';
import { useDebug } from '../src/DebugContext';
import { useRouter } from 'expo-router';

const DebugScreen: React.FC = () => {
  const { messages } = useDebug();
  const router = useRouter();

  const copyToClipboard = () => {
    const allMessages = messages.join('\n');
    Clipboard.setString(allMessages);
    Alert.alert('Copied to Clipboard', 'All debug messages have been copied to the clipboard.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
        <Text style={styles.copyButtonText}>Copy All</Text>
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
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#b28772',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#000',
  },
  copyButton: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#b28772',
    borderRadius: 5,
  },
  copyButtonText: {
    color: '#fff',
  },
  messageText: {
    marginBottom: 5,
  },
});

export default DebugScreen;