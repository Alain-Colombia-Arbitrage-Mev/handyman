import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../providers/LanguageProvider';

interface PublishOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onOptionSelect: (option: 'opportunities' | 'flashJobs' | 'offers') => void;
}

const { width } = Dimensions.get('window');

export function PublishOptionsModal({ visible, onClose, onOptionSelect }: PublishOptionsModalProps) {
  const { t } = useLanguage();

  const handleOptionPress = (option: 'opportunities' | 'flashJobs' | 'offers') => {
    onOptionSelect(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>¿Qué quieres publicar?</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.options}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleOptionPress('opportunities')}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#3b82f6' }]}>
                  <Ionicons name="briefcase-outline" size={28} color="#ffffff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Oportunidades</Text>
                  <Text style={styles.optionDescription}>
                    Publica trabajos regulares por categorías
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => handleOptionPress('flashJobs')}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#ef4444' }]}>
                  <Ionicons name="flash-outline" size={28} color="#ffffff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Flash Jobs</Text>
                  <Text style={styles.optionDescription}>
                    Trabajos urgentes con notificaciones push
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => handleOptionPress('offers')}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#10b981' }]}>
                  <Ionicons name="pricetag-outline" size={28} color="#ffffff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Ofertas</Text>
                  <Text style={styles.optionDescription}>
                    Publica ofertas especiales y promociones
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  options: {
    paddingHorizontal: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});