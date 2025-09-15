import React, { useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppStore, initializeConnectivityMonitoring, stopConnectivityMonitoring } from '../store';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const hydrate = useAppStore((state) => state.hydrate);
  const sync = useAppStore((state) => state.sync);
  const connectivity = useAppStore((state) => state.connectivity);

  useEffect(() => {
    // Initialize store
    const initializeStore = async () => {
      try {
        console.log('🚀 Initializing Zustand store...');

        // Hydrate store from storage
        await hydrate();

        // Initialize connectivity monitoring
        initializeConnectivityMonitoring();

        // Sync data if online and authenticated
        if (connectivity.canSync) {
          setTimeout(() => sync(), 2000);
        }

        console.log('✅ Store initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize store:', error);
      }
    };

    initializeStore();

    // Cleanup on unmount
    return () => {
      stopConnectivityMonitoring();
    };
  }, [hydrate, sync, connectivity.canSync]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed to:', nextAppState);

      if (nextAppState === 'active') {
        // App became active, sync data
        if (connectivity.canSync) {
          setTimeout(() => sync(), 500);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [sync, connectivity.canSync]);

  return <>{children}</>;
}

export default StoreProvider;