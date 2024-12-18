import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type ActionButtonsProps = {
  inventoryVisible: boolean;
  setInventoryVisible: (value: boolean) => void;
  debug: boolean;
  router: ReturnType<typeof useRouter>;
  statsVisible: boolean;
  setStatsVisible: (value: boolean) => void;
  magicVisible: boolean;
  setMagicVisible: (value: boolean) => void;
};

export default function ActionButtons({ inventoryVisible, setInventoryVisible, debug, router, statsVisible, setStatsVisible, magicVisible, setMagicVisible }: ActionButtonsProps) {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setInventoryVisible(!inventoryVisible)} // Toggle inventory visibility
      >
        <Text style={styles.buttonText}>📦 Inventory</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setStatsVisible(!statsVisible)} // Toggle stats visibility
      >
        <Text style={styles.buttonText}>📊 Stats</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setMagicVisible(!magicVisible)} // Toggle magic visibility
      >
        <Text style={styles.buttonText}>✨ Magic</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          if (debug) {
            router.push('/DebugScreen');  // Use leading slash and match case
          } else {
            router.push('/MenuScreen');
            console.log('MenuScreen pushed');
          }
        }}
      >
        <Text style={styles.buttonText}>{debug ? '🐞 Debug' : '📋 Menu'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#c2a772',
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: '#4b2e05',
  },
  actionButton: {
    backgroundColor: '#f8f4ec',
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    padding: 5,
  },
  buttonText: {
    fontSize: 12,
  },
});
