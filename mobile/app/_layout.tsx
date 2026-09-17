import '../global.css';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../src/providers/cart-provider';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    OpenSans: OpenSans_400Regular,
    'OpenSans-SemiBold': OpenSans_600SemiBold,
    'OpenSans-Bold': OpenSans_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CartProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.foreground,
              headerTitleStyle: { fontFamily: 'BebasNeue' },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
            <Stack.Screen name="orders/[id]" options={{ title: 'Track Order' }} />
            <Stack.Screen name="loyalty" options={{ title: 'CLUB घ्याम्पे' }} />
            <Stack.Screen name="pairings" options={{ title: 'Pairings' }} />
            <Stack.Screen name="support" options={{ title: 'Support' }} />
          </Stack>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
