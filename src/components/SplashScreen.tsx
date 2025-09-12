import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../providers/LanguageProvider';

interface SplashScreenProps {
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { t } = useLanguage();
  const [showContent, setShowContent] = useState(false);
  
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowContent(true);
    }, 200);

    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );

    const textTimer = setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600 });
    }, 800);

    const completeTimer = setTimeout(() => {
      backgroundOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onComplete)();
      });
    }, 3500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, logoOpacity, logoScale, textOpacity, backgroundOpacity]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  if (!showContent) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
          style={styles.gradient}
        />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🔨</Text>
            </View>
          </Animated.View>
          
          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.title}>{t('splash.title')}</Text>
            <Text style={styles.subtitle}>{t('splash.subtitle')}</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
});