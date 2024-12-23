import React, { useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, Alert, Clipboard, View } from 'react-native';
import { useDebug } from '../src/DebugContext';
import { useRouter } from 'expo-router';

const DebugScreen: React.FC = () => {
  const { messages } = useDebug();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const copyToClipboard = () => {
    const allMessages = messages.join('\n');
    Clipboard.setString(allMessages);
    Alert.alert('Copied to Clipboard', 'All debug messages have been copied to the clipboard.');
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.stickyButtons}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Copy All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToBottom} style={styles.scrollButton}>
          <Text style={styles.scrollButtonText}>Go to Bottom</Text>
        </TouchableOpacity>
      </View>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContent}>
        {messages.map((message, index) => (
          <Text key={index} selectable style={styles.messageText}>
            {message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  stickyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    flex: 1,
    marginRight: 5,
    padding: 10,
    backgroundColor: '#b28772',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#000',
    textAlign: 'center',
  },
  copyButton: {
    flex: 1,
    marginLeft: 5,
    padding: 10,
    backgroundColor: '#b28772',
    borderRadius: 5,
  },
  copyButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  scrollButton: {
    flex: 1,
    marginLeft: 5,
    padding: 10,
    backgroundColor: '#b28772',
    borderRadius: 5,
  },
  scrollButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  messageText: {
    marginBottom: 5,
  },
});

export default DebugScreen;