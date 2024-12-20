import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import itemsData from '../../story/items.json'; // Import the combined items list
import { useGame } from '../../src/GameContext';

interface StoreProps {
  storeItems: string[]; // Define storeItems as an array of strings
  onClose: () => void; // Define onClose as a function
}

const Store: React.FC<StoreProps> = ({ storeItems, onClose }) => {
  const { gameState, updateGameState } = useGame();
  const scrollViewRef = useRef<ScrollView>(null); // Add a ref for the ScrollView

  useEffect(() => {
    console.log('Store Items:', storeItems);
    // Scroll to the top when storeItems change
    if (scrollViewRef.current) { 
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
      console.log('Scrolled to top');
    }
  }, [storeItems]);

  const handleBuy = (itemId: string) => {
    const item = itemsData.items.find(i => i.id === itemId);
    if (!item) {
      console.error(`Item with id ${itemId} not found`);
      return;
    }

    if (gameState.playerStats.gold >= item.value) {
      updateGameState({
        playerStats: { ...gameState.playerStats, gold: gameState.playerStats.gold - item.value },
        inventory: [...gameState.inventory, { id: item.id, name: item.name, quantity: 1 }]
      });
      console.log(`Bought item: ${item.name}`);
    } else {
      alert('Not enough gold!');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <Text style={styles.title}>Store</Text>
        {storeItems.length === 0 ? (
          <Text style={styles.noItemsText}>No items available in the store.</Text>
        ) : (
          storeItems.map(itemId => {
            const item = itemsData.items.find(i => i.id === itemId);
            if (!item) {
              console.error(`Item with id ${itemId} not found in itemsData`);
              return null;
            }
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCost}>💰 {item.value} Gold</Text>
                </View>
                <Text style={styles.itemDescription}>{item.type}</Text>
                <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item.id)}>
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff8e1',
    borderTopWidth: 4,
    borderTopColor: '#4b2e05',
    padding: 0,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
  },
  itemCard: {
    backgroundColor: '#fdf7e3',
    borderColor: '#c2a772',
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    marginBottom: 7,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    color: '#4b2e05',
  },
  itemCost: {
    fontSize: 14,
    color: '#888',
  },
  itemDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: '#4b2e05',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#4b2e05',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },
});

export default Store;
