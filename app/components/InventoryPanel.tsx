import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { GameState } from '../../src/GameContext'; // Import the GameState type
import itemsData from '../../story/items.json'; // Import the combined items list

type InventoryPanelProps = {
  gameState: GameState;
  handleUse: (itemId: string) => void;
  handleEquip: (itemId: string) => void;
  setInventoryVisible: (value: boolean) => void;
};

export default function InventoryPanel({ gameState, handleUse, handleEquip, setInventoryVisible }: InventoryPanelProps) {
  return (
    <View style={styles.inventoryPanel}>
      <View style={styles.inventoryHeader}>
        <Text style={styles.inventoryTitle}>Inventory</Text>
      </View>
      <ScrollView style={styles.inventoryContent}>
        {gameState.inventory.length === 0 ? (
          <Text style={styles.emptyMessage}>Empty - So sad :(</Text>
        ) : (
          gameState.inventory.map((item, index) => {
            const isEquipped = gameState.equippedItems.some(equippedItem => equippedItem?.id === item.id);
            const itemDetails = itemsData.items.find(i => i.id === item.id);
            const isConsumable = itemDetails?.type === 'consumable';

            return (
              <View
                key={index}
                style={[
                  styles.inventoryItem,
                  isEquipped && styles.equippedItem,
                ]}
              >
                <Text style={styles.itemName}>{item.name} {isEquipped && '✔️'}</Text>
                <Text style={styles.itemQuantity}>({item.quantity})</Text>
                <View style={styles.inventoryActions}>
                  {isConsumable ? (
                    <TouchableOpacity
                      style={styles.inventoryButton}
                      onPress={() => handleUse(item.id)}
                    >
                      <Text>Use</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.inventoryButton}
                      onPress={() => handleEquip(item.id)}
                    >
                      <Text>{isEquipped ? 'Stow' : 'Equip'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setInventoryVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inventoryPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff8e1',
    borderTopWidth: 4,
    borderTopColor: '#4b2e05',
    padding: 0,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  inventoryTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#4b2e05',
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 4,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    backgroundColor: '#e6ddc9',
    borderWidth: 2,
    borderColor: '#4b2e05',
    borderRadius: 4,
    marginBottom: 5,
  },
  equippedItem: {
    backgroundColor: '#d4e157', // Highlight color for equipped items
  },
  itemQuantity: {
    marginRight: 10,
  },
  itemName: {
    flex: 1,
    textAlign: 'left',
  },
  inventoryActions: {
    flexDirection: 'row',
  },
  inventoryButton: {
    marginLeft: 5,
    padding: 5,
    backgroundColor: '#f8f4ec',
    borderWidth: 1,
    borderColor: '#4b2e05',
    borderRadius: 4,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  inventoryContent: {
    padding: 10,
    maxHeight: '80%',
  },
});
