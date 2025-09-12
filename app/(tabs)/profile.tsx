import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const userProfile = {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+54 9 11 1234-5678',
    location: 'Buenos Aires, Argentina',
    memberSince: 'Miembro desde Enero 2023',
    rating: 4.8,
    completedJobs: 15,
    avatar: '👨‍💼'
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem}>
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
            onValueChange={setNotificationsEnabled}
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
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="settings-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userProfile.avatar}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
            <Text style={styles.memberSince}>{userProfile.memberSince}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userProfile.rating}</Text>
                <View style={styles.statLabel}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.statText}>Rating</Text>
                </View>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userProfile.completedJobs}</Text>
                <Text style={styles.statText}>Trabajos</Text>
              </View>
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
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 50,
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
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  appVersion: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});