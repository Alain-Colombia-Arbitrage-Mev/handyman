import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/providers/LanguageProvider';

const categories = [
  { id: 'plumbing', name: 'Plomería', icon: 'water-outline' },
  { id: 'electrical', name: 'Electricidad', icon: 'flash-outline' },
  { id: 'carpentry', name: 'Carpintería', icon: 'hammer-outline' },
  { id: 'painting', name: 'Pintura', icon: 'brush-outline' },
  { id: 'cleaning', name: 'Limpieza', icon: 'sparkles-outline' },
  { id: 'gardening', name: 'Jardinería', icon: 'leaf-outline' },
  { id: 'moving', name: 'Mudanzas', icon: 'car-outline' },
  { id: 'repair', name: 'Reparaciones', icon: 'construct-outline' },
];

export default function PostScreen() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = () => {
    if (!title || !description || !selectedCategory) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    // TODO: Implement job posting with Convex
    Alert.alert('Éxito', 'Tu trabajo ha sido publicado correctamente');
    
    // Reset form
    setTitle('');
    setDescription('');
    setBudget('');
    setSelectedCategory('');
    setIsUrgent(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Publicar Trabajo</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Título del trabajo *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Reparar grifo de cocina"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe detalladamente el trabajo que necesitas..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={24} 
                  color={selectedCategory === category.id ? '#21ABF6' : '#6b7280'} 
                />
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextSelected
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Presupuesto estimado</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: $500 - $1000"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
        </View>

        {/* Urgent Toggle */}
        <View style={styles.inputSection}>
          <TouchableOpacity 
            style={styles.urgentToggle}
            onPress={() => setIsUrgent(!isUrgent)}
          >
            <View style={styles.urgentToggleLeft}>
              <Ionicons 
                name="alarm-outline" 
                size={24} 
                color={isUrgent ? '#ef4444' : '#6b7280'} 
              />
              <View>
                <Text style={styles.urgentTitle}>Trabajo urgente</Text>
                <Text style={styles.urgentSubtitle}>
                  Necesito que se realice lo antes posible
                </Text>
              </View>
            </View>
            <View style={[
              styles.urgentSwitch,
              isUrgent && styles.urgentSwitchActive
            ]}>
              <View style={[
                styles.urgentSwitchThumb,
                isUrgent && styles.urgentSwitchThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publicar Trabajo</Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#21ABF6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
            <Text style={styles.infoText}>
              1. Publica tu trabajo con una descripción detallada{'\n'}
              2. Recibe propuestas de profesionales calificados{'\n'}
              3. Compara precios y perfiles{'\n'}
              4. Elige al mejor candidato para tu proyecto
            </Text>
          </View>
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
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  charCount: {
    textAlign: 'right',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: '30%',
    gap: 4,
  },
  categoryItemSelected: {
    borderColor: '#21ABF6',
    backgroundColor: '#eff6ff',
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#21ABF6',
    fontWeight: '600',
  },
  urgentToggle: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  urgentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  urgentSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  urgentSwitchActive: {
    backgroundColor: '#ef4444',
  },
  urgentSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  urgentSwitchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  submitButton: {
    backgroundColor: '#21ABF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 24,
    shadowColor: '#21ABF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});