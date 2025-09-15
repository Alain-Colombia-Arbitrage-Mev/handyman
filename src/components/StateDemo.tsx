import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAuth,
  useJobs,
  useNotifications,
  useSettings,
  useLocation,
  useUI,
  useConnectivity,
} from '../store';

export function StateDemo() {
  const [showDemo, setShowDemo] = useState(false);

  // Only show in development mode
  if (__DEV__ === false) {
    return null;
  }

  // All store hooks
  const auth = useAuth();
  const jobs = useJobs();
  const notifications = useNotifications();
  const settings = useSettings();
  const location = useLocation();
  const ui = useUI();
  const connectivity = useConnectivity();

  const handleDemoAction = async (action: string) => {
    try {
      switch (action) {
        case 'login':
          await auth.login({ email: 'demo@parkiing.com', password: 'demo123' });
          Alert.alert('Success', 'Login successful!');
          break;

        case 'fetchJobs':
          await jobs.fetchJobs();
          Alert.alert('Success', `Fetched ${jobs.jobs.length} jobs!`);
          break;

        case 'addNotification':
          notifications.addNotification({
            userId: auth.user?.id || 'demo',
            type: 'system',
            title: 'Demo Notification',
            message: 'This is a demo notification from the new state management system!',
            isRead: false,
          });
          Alert.alert('Success', 'Notification added!');
          break;

        case 'toggleLanguage':
          const newLang = settings.settings.language === 'es' ? 'en' : 'es';
          settings.setLanguage(newLang);
          Alert.alert('Success', `Language changed to ${newLang}!`);
          break;

        case 'getCurrentLocation':
          const currentLocation = await location.getCurrentLocation(true);
          if (currentLocation) {
            Alert.alert('Success', `Location: ${currentLocation.lat}, ${currentLocation.lng}`);
          }
          break;

        case 'openModal':
          ui.openModal('settings');
          Alert.alert('Success', 'Settings modal opened!');
          break;

        case 'sync':
          await connectivity.sync();
          Alert.alert('Success', 'Data synchronized!');
          break;

        case 'logout':
          await auth.logout();
          Alert.alert('Success', 'Logout successful!');
          break;

        default:
          Alert.alert('Info', `Action "${action}" not implemented`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to execute action: ${error}`);
    }
  };

  const DemoButton = ({ title, action }: { title: string; action: string }) => (
    <TouchableOpacity
      style={styles.demoButton}
      onPress={() => handleDemoAction(action)}
    >
      <Text style={styles.demoButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  const StatItem = ({ label, value }: { label: string; value: any }) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}:</Text>
      <Text style={styles.statValue}>{JSON.stringify(value, null, 2)}</Text>
    </View>
  );

  if (!showDemo) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowDemo(true)}
        accessibilityRole="button"
        accessibilityLabel="Mostrar demo de estado"
        accessibilityHint="Abrir panel de depuración del estado de la aplicación"
      >
        <Ionicons name="bug-outline" size={20} color="#ffffff" />
        <Text style={styles.toggleText}>Show State Demo</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Zustand State Management Demo</Text>
        <TouchableOpacity
          onPress={() => setShowDemo(false)}
          accessibilityRole="button"
          accessibilityLabel="Cerrar demo"
          style={{ padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Action Buttons */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsGrid}>
          <DemoButton title="Login" action="login" />
          <DemoButton title="Fetch Jobs" action="fetchJobs" />
          <DemoButton title="Add Notification" action="addNotification" />
          <DemoButton title="Toggle Language" action="toggleLanguage" />
          <DemoButton title="Get Location" action="getCurrentLocation" />
          <DemoButton title="Open Modal" action="openModal" />
          <DemoButton title="Sync Data" action="sync" />
          <DemoButton title="Logout" action="logout" />
        </View>

        {/* Current State */}
        <Text style={styles.sectionTitle}>Current State</Text>

        <Text style={styles.subsectionTitle}>Auth</Text>
        <StatItem label="Is Authenticated" value={auth.isAuthenticated} />
        <StatItem label="User Name" value={auth.user?.name || 'Not logged in'} />
        <StatItem label="Loading" value={auth.isLoading} />

        <Text style={styles.subsectionTitle}>Jobs</Text>
        <StatItem label="Jobs Count" value={jobs.jobs.length} />
        <StatItem label="Favorites Count" value={jobs.favorites.length} />
        <StatItem label="Recent Job Titles" value={jobs.jobs.slice(0, 3).map(j => j.title)} />

        <Text style={styles.subsectionTitle}>Notifications</Text>
        <StatItem label="Total Notifications" value={notifications.notifications.length} />
        <StatItem label="Unread Count" value={notifications.unreadCount} />

        <Text style={styles.subsectionTitle}>Settings</Text>
        <StatItem label="Language" value={settings.settings.language} />
        <StatItem label="Currency" value={settings.settings.currency} />
        <StatItem label="Theme" value={settings.settings.theme} />
        <StatItem label="Push Notifications" value={settings.settings.notifications.push} />

        <Text style={styles.subsectionTitle}>Location</Text>
        <StatItem label="Has Permission" value={location.hasLocationPermission} />
        <StatItem label="Loading" value={location.locationLoading} />
        <StatItem label="Current Location" value={location.currentLocation ?
          `${location.currentLocation.lat.toFixed(4)}, ${location.currentLocation.lng.toFixed(4)}` :
          'Not available'
        } />

        <Text style={styles.subsectionTitle}>UI</Text>
        <StatItem label="Is Loading" value={ui.ui.isLoading} />
        <StatItem label="Error" value={ui.ui.error} />
        <StatItem label="Active Modals" value={Object.entries(ui.ui.modals).filter(([_, isOpen]) => isOpen).map(([modal]) => modal)} />

        <Text style={styles.subsectionTitle}>Connectivity</Text>
        <StatItem label="Is Online" value={connectivity.connectivity.isOnline} />
        <StatItem label="Connection Type" value={connectivity.connectivity.connectionType} />
        <StatItem label="Can Sync" value={connectivity.connectivity.canSync} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    maxHeight: '75%',
    zIndex: 9999,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  toggleButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
    minHeight: 44,
    minWidth: 44,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 12,
    marginBottom: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  demoButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
  statItem: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  statValue: {
    fontSize: 10,
    color: '#111827',
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 4,
    marginTop: 2,
  },
});