import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

type InputBoxProps = {
  input: string;
  setInput: (value: string) => void;
  handleInput: (command: string) => void;
};

export default function InputBox({ input, setInput, handleInput }: InputBoxProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Type your command here..."
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => {
          if (input.trim()) {
            handleInput(input.trim());
            setInput('');
          }
        }}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f4ec',
    borderTopColor: '#4b2e05',
    borderTopWidth: 2,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
    marginRight: 2,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#4b2e05',
    borderRadius: 4,
    marginLeft: 2,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
