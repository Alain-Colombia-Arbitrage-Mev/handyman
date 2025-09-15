import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CreditCard,
  Plus,
  Trash2,
  ChevronRight,
  X,
  Check,
  DollarSign,
  Smartphone,
  Building,
} from 'lucide-react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const PaymentMethodsScreen = ({ navigation, route }: any) => {
  const { userId } = route.params;
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'card' | 'bank' | 'digital'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    digitalWallet: '',
    email: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = useQuery(api.payments.getUserPaymentMethods, { userId });
  const addPaymentMethod = useMutation(api.payments.addPaymentMethod);
  const deletePaymentMethod = useMutation(api.payments.deletePaymentMethod);
  const setDefaultPayment = useMutation(api.payments.setDefaultPaymentMethod);

  const handleAddPaymentMethod = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      let methodData = {};
      
      if (selectedType === 'card') {
        methodData = {
          type: 'card',
          last4: formData.cardNumber.slice(-4),
          brand: detectCardBrand(formData.cardNumber),
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cardholderName: formData.cardholderName,
        };
      } else if (selectedType === 'bank') {
        methodData = {
          type: 'bank_account',
          bankName: formData.bankName,
          last4: formData.accountNumber.slice(-4),
        };
      } else {
        methodData = {
          type: 'digital_wallet',
          walletType: formData.digitalWallet,
          email: formData.email,
        };
      }

      await addPaymentMethod({
        userId,
        ...methodData,
        isDefault: !paymentMethods || paymentMethods.length === 0,
      });

      Alert.alert('Éxito', 'Método de pago agregado correctamente');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el método de pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Eliminar Método de Pago',
      '¿Estás seguro de que deseas eliminar este método de pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod({ paymentMethodId: methodId });
              Alert.alert('Éxito', 'Método de pago eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el método de pago');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await setDefaultPayment({ userId, paymentMethodId: methodId });
      Alert.alert('Éxito', 'Método de pago predeterminado actualizado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el método predeterminado');
    }
  };

  const detectCardBrand = (cardNumber: string) => {
    const firstDigit = cardNumber[0];
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    return 'Unknown';
  };

  const validateForm = () => {
    if (selectedType === 'card') {
      if (!formData.cardNumber || formData.cardNumber.length < 16) {
        Alert.alert('Error', 'Número de tarjeta inválido');
        return false;
      }
      if (!formData.cardholderName) {
        Alert.alert('Error', 'Nombre del titular requerido');
        return false;
      }
      if (!formData.expiryMonth || !formData.expiryYear) {
        Alert.alert('Error', 'Fecha de vencimiento requerida');
        return false;
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        Alert.alert('Error', 'CVV inválido');
        return false;
      }
    } else if (selectedType === 'bank') {
      if (!formData.bankName || !formData.accountNumber || !formData.routingNumber) {
        Alert.alert('Error', 'Todos los campos bancarios son requeridos');
        return false;
      }
    } else {
      if (!formData.digitalWallet || !formData.email) {
        Alert.alert('Error', 'Información de billetera digital requerida');
        return false;
      }
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      digitalWallet: '',
      email: '',
    });
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard size={24} color="#7C3AED" />;
      case 'bank_account':
        return <Building size={24} color="#7C3AED" />;
      case 'digital_wallet':
        return <Smartphone size={24} color="#7C3AED" />;
      default:
        return <DollarSign size={24} color="#7C3AED" />;
    }
  };

  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED']}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Métodos de Pago</Text>
          <Text style={styles.subtitle}>
            Administra tus métodos de pago de forma segura
          </Text>
        </View>

        <View style={styles.container}>
          {/* Payment Methods List */}
          {paymentMethods && paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map((method: any) => (
                <View key={method._id} style={styles.methodCard}>
                  <View style={styles.methodHeader}>
                    <View style={styles.methodIcon}>
                      {getPaymentIcon(method.type)}
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodTitle}>
                        {method.type === 'card'
                          ? `${method.brand} •••• ${method.last4}`
                          : method.type === 'bank_account'
                          ? `${method.bankName} •••• ${method.last4}`
                          : `${method.walletType}`}
                      </Text>
                      {method.type === 'card' && (
                        <Text style={styles.methodSubtitle}>
                          Vence {method.expiryMonth}/{method.expiryYear}
                        </Text>
                      )}
                    </View>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Predeterminado</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method._id)}
                      >
                        <Check size={18} color="#7C3AED" />
                        <Text style={styles.actionText}>Hacer predeterminado</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeletePaymentMethod(method._id)}
                    >
                      <Trash2 size={18} color="#EF4444" />
                      <Text style={[styles.actionText, { color: '#EF4444' }]}>
                        Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                No tienes métodos de pago configurados
              </Text>
              <Text style={styles.emptySubtext}>
                Agrega un método de pago para empezar
              </Text>
            </View>
          )}

          {/* Add Payment Method Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Agregar Método de Pago</Text>
          </TouchableOpacity>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>🔒 Pagos Seguros</Text>
            <Text style={styles.securityText}>
              Tu información de pago está encriptada y protegida. Nunca almacenamos
              los números completos de tus tarjetas.
            </Text>
          </View>
        </View>

        {/* Add Payment Method Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Método de Pago</Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Payment Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'card' && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType('card')}
                >
                  <CreditCard size={20} color={selectedType === 'card' ? '#7C3AED' : '#6B7280'} />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'card' && styles.typeButtonTextActive,
                    ]}
                  >
                    Tarjeta
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'bank' && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType('bank')}
                >
                  <Building size={20} color={selectedType === 'bank' ? '#7C3AED' : '#6B7280'} />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'bank' && styles.typeButtonTextActive,
                    ]}
                  >
                    Banco
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'digital' && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType('digital')}
                >
                  <Smartphone size={20} color={selectedType === 'digital' ? '#7C3AED' : '#6B7280'} />
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'digital' && styles.typeButtonTextActive,
                    ]}
                  >
                    Digital
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <ScrollView style={styles.formScroll}>
                {selectedType === 'card' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Número de Tarjeta</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChangeText={(text) =>
                          setFormData({ ...formData, cardNumber: text })
                        }
                        keyboardType="numeric"
                        maxLength={16}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nombre del Titular</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Juan Pérez"
                        value={formData.cardholderName}
                        onChangeText={(text) =>
                          setFormData({ ...formData, cardholderName: text })
                        }
                      />
                    </View>
                    <View style={styles.row}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Mes</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="MM"
                          value={formData.expiryMonth}
                          onChangeText={(text) =>
                            setFormData({ ...formData, expiryMonth: text })
                          }
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                        <Text style={styles.label}>Año</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="YY"
                          value={formData.expiryYear}
                          onChangeText={(text) =>
                            setFormData({ ...formData, expiryYear: text })
                          }
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                        <Text style={styles.label}>CVV</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="123"
                          value={formData.cvv}
                          onChangeText={(text) =>
                            setFormData({ ...formData, cvv: text })
                          }
                          keyboardType="numeric"
                          maxLength={4}
                          secureTextEntry
                        />
                      </View>
                    </View>
                  </>
                )}

                {selectedType === 'bank' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nombre del Banco</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Banco Nacional"
                        value={formData.bankName}
                        onChangeText={(text) =>
                          setFormData({ ...formData, bankName: text })
                        }
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Número de Cuenta</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="1234567890"
                        value={formData.accountNumber}
                        onChangeText={(text) =>
                          setFormData({ ...formData, accountNumber: text })
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Número de Ruta</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="123456789"
                        value={formData.routingNumber}
                        onChangeText={(text) =>
                          setFormData({ ...formData, routingNumber: text })
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </>
                )}

                {selectedType === 'digital' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Tipo de Billetera</Text>
                      <View style={styles.walletOptions}>
                        {['PayPal', 'Nequi', 'Daviplata'].map((wallet) => (
                          <TouchableOpacity
                            key={wallet}
                            style={[
                              styles.walletOption,
                              formData.digitalWallet === wallet &&
                                styles.walletOptionActive,
                            ]}
                            onPress={() =>
                              setFormData({ ...formData, digitalWallet: wallet })
                            }
                          >
                            <Text
                              style={[
                                styles.walletOptionText,
                                formData.digitalWallet === wallet &&
                                  styles.walletOptionTextActive,
                              ]}
                            >
                              {wallet}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChangeText={(text) =>
                          setFormData({ ...formData, email: text })
                        }
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </>
                )}
              </ScrollView>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, isProcessing && styles.buttonDisabled]}
                  onPress={handleAddPaymentMethod}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Agregar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  methodsList: {
    marginBottom: 20,
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  actionText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  securityInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  typeButton: {
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    width: 100,
  },
  typeButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  formScroll: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
  },
  walletOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  walletOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  walletOptionActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  walletOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  walletOptionTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});