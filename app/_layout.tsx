import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { GameProvider } from '../src/GameContext';
import { DebugProvider } from '../src/DebugContext';
import SplashScreen from './SplashScreen';
import HomeScreen from './home';
import DebugScreen from './DebugScreen';
import MenuScreen from './MenuScreen';

const Stack = createNativeStackNavigator();

export default function AppLayout() {
  return (
    <GameProvider>
      <DebugProvider>
        <SafeAreaView style={styles.safeArea}>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="home" component={HomeScreen} />
            <Stack.Screen name="MenuScreen" component={MenuScreen} />
            <Stack.Screen name="DebugScreen" component={DebugScreen} />
          </Stack.Navigator>
        </SafeAreaView>
      </DebugProvider>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c2a772',
  },
});