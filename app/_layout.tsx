import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from '../src/providers/LanguageProvider';
import { ConvexProvider } from '../src/providers/ConvexProvider';
import { StoreProvider } from '../src/providers/StoreProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <ConvexProvider>
          <SafeAreaProvider>
            <LanguageProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="splash" options={{ headerShown: false }} />
                <Stack.Screen name="job-details" options={{ headerShown: false }} />
                <Stack.Screen name="handyman-profile" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </LanguageProvider>
          </SafeAreaProvider>
        </ConvexProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}