import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SplashScreen } from '../src/components/SplashScreen';

export default function Index() {
  const router = useRouter();
  
  const handleSplashComplete = () => {
    router.replace('/(tabs)');
  };

  return <SplashScreen onComplete={handleSplashComplete} />;
}