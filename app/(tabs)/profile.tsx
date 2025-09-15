import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';
import { useAuth, useSettings, useNotifications } from '../../src/store';
// StateDemo removed for production - only use in development
import { router } from 'expo-router';

const profileMenuItems = [
  {
    section: 'account',
    items: [
      { id: 'edit-profile', title: 'Editar Perfil', icon: 'person-outline', hasArrow: true },
      { id: 'professional-profile', title: 'Perfil Profesional', icon: 'briefcase-outline', hasArrow: true, badge: 'Nuevo' },
      { id: 'verification', title: 'Verificación de Cuenta', icon: 'shield-checkmark-outline', hasArrow: true },
      { id: 'payment-methods', title: 'Métodos de Pago', icon: 'card-outline', hasArrow: true },
    ]
  },
  {
    section: 'activity',
    items: [
      { id: 'my-jobs', title: 'Mis Trabajos', icon: 'hammer-outline', hasArrow: true, badge: '3' },
      { id: 'job-history', title: 'Historial de Trabajos', icon: 'time-outline', hasArrow: true },
      { id: 'reviews', title: 'Reseñas y Calificaciones', icon: 'star-outline', hasArrow: true },
      { id: 'favorites', title: 'Favoritos', icon: 'heart-outline', hasArrow: true },
    ]
  },
  {
    section: 'settings',
    items: [
      { id: 'notifications', title: 'Notificaciones', icon: 'notifications-outline', hasArrow: false, hasSwitch: true },
      { id: 'language', title: 'Idioma', icon: 'language-outline', hasArrow: true, subtitle: 'Español' },
      { id: 'privacy', title: 'Privacidad y Seguridad', icon: 'lock-closed-outline', hasArrow: true },
      { id: 'help', title: 'Ayuda y Soporte', icon: 'help-circle-outline', hasArrow: true },
    ]
  },
  {
    section: 'legal',
    items: [
      { id: 'terms', title: 'Términos y Condiciones', icon: 'document-text-outline', hasArrow: true },
      { id: 'privacy-policy', title: 'Política de Privacidad', icon: 'shield-outline', hasArrow: true },
      { id: 'about', title: 'Acerca de la App', icon: 'information-circle-outline', hasArrow: true },
    ]
  }
];

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { settings, toggleNotification } = useSettings();
  const { unreadCount } = useNotifications();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const notificationsEnabled = settings.notifications.push;

  const handleMenuItemPress = (itemId: string) => {
    switch (itemId) {
      case 'edit-profile':
        router.push('/profile/edit');
        break;
      case 'professional-profile':
        router.push('/profile/professional');
        break;
      case 'verification':
        router.push('/profile/verification');
        break;
      case 'payment-methods':
        router.push('/profile/payment-methods');
        break;
      case 'my-jobs':
        router.push('/profile/my-jobs');
        break;
      case 'job-history':
        router.push('/profile/job-history');
        break;
      case 'reviews':
        router.push('/profile/reviews');
        break;
      case 'favorites':
        router.push('/profile/favorites');
        break;
      case 'notifications':
        toggleNotification('push');
        break;
      case 'help':
        router.push('/help');
        break;
      case 'terms':
        router.push('/legal/terms');
        break;
      case 'privacy-policy':
        router.push('/legal/privacy');
        break;
      case 'about':
        router.push('/about');
        break;
      default:
        console.log('Menu item pressed:', itemId);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#21ABF6" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Error al cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint={`Navegar a ${item.title}`}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon as any} size={22} color="#3b82f6" />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.menuItemRight}>
        {item.badge && (
          <View style={[styles.badge, item.badge === 'Nuevo' && styles.badgeNew]}>
            <Text style={[styles.badgeText, item.badge === 'Nuevo' && styles.badgeTextNew]}>
              {item.badge}
            </Text>
          </View>
        )}
        {item.hasSwitch && (
          <Switch
            value={notificationsEnabled}
            onValueChange={() => toggleNotification('push')}
            trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
            thumbColor={notificationsEnabled ? '#3b82f6' : '#9ca3af'}
          />
        )}
        {item.hasArrow && (
          <Ionicons name="chevron-forward-outline" size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Configuración"
          accessibilityHint="Abrir configuración de la aplicación"
        >
          <Ionicons name="settings-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.avatar || user.name?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto de perfil"
              accessibilityHint="Seleccionar nueva imagen para el perfil"
            >
              <Ionicons name="camera-outline" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.memberSince}>
              Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long'
              })}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.rating || 0}</Text>
                <View style={styles.statLabel}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.statText}>Rating</Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.completedJobs || 0}</Text>
                <Text style={styles.statText}>Trabajos</Text>
              </View>

              {unreadCount > 0 && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{unreadCount}</Text>
                    <Text style={styles.statText}>Sin leer</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {profileMenuItems.map((section, sectionIndex) => (
          <View key={section.section} style={styles.menuSection}>
            {section.items.map(renderMenuItem)}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          accessibilityHint="Cerrar sesión y regresar a la pantalla de inicio"
          accessibilityState={{ disabled: isLoggingOut }}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          )}
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.appVersion}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  avatarText: {
    fontSize: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    gap: 20,
    marginTop: 4,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeNew: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  badgeTextNew: {
    color: '#16a34a',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 18,
    minHeight: 56,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  appVersion: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});