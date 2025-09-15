import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../src/providers/LanguageProvider';
import { PublishOptionsModal } from '../../src/components/PublishOptionsModal';

export default function TabLayout() {
  const { t } = useLanguage();
  const router = useRouter();
  const [publishModalVisible, setPublishModalVisible] = useState(false);

  const handlePublishPress = () => {
    setPublishModalVisible(true);
  };

  const handlePublishOptionSelect = (option: 'opportunities' | 'flashJobs' | 'offers') => {
    // Navigate to appropriate posting screen based on option
    switch (option) {
      case 'opportunities':
        router.push('/post');
        break;
      case 'flashJobs':
        // Navigate to flash jobs posting screen (to be created)
        router.push('/post?type=flash');
        break;
      case 'offers':
        // Navigate to offers posting screen (to be created)
        router.push('/post?type=offers');
        break;
    }
  };
  
  return (
    <>
      <PublishOptionsModal
        visible={publishModalVisible}
        onClose={() => setPublishModalVisible(false)}
        onOptionSelect={handlePublishOptionSelect}
      />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#21ABF6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 76,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="radar"
        options={{
          title: t('tabs.radar'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Publicar',
          tabBarIcon: ({ color, focused }) => (
            <TouchableOpacity
              style={[
                styles.publishButtonContainer,
                { backgroundColor: '#21ABF6' }
              ]}
              onPress={handlePublishPress}
              accessibilityRole="button"
              accessibilityLabel="Publicar"
              accessibilityHint="Abrir opciones para publicar trabajo o servicio"
            >
              <Ionicons 
                name="add" 
                size={32} 
                color="#ffffff" 
              />
            </TouchableOpacity>
          ),
          tabBarIconStyle: {
            marginTop: -15,
          },
          tabBarLabelStyle: {
            marginTop: -5,
          },
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handlePublishPress();
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  publishButtonContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#21ABF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
});