import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.replace('home')}>
      <Image source={require('../assets/images/BQ-splash-max.png')} style={styles.image} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c2a772', // Background color to match the splash screen
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
