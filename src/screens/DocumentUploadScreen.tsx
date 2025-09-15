import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  Camera,
  Upload,
  Check,
  X,
  FileText,
  AlertCircle,
  Shield,
  CreditCard,
  File,
} from 'lucide-react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface DocumentUploadScreenProps {
  navigation: any;
  route: any;
}

export const DocumentUploadScreen = ({ navigation, route }: DocumentUploadScreenProps) => {
  const { userId } = route.params;
  const [documents, setDocuments] = useState<any>({
    profile_photo: null,
    id_front: null,
    id_back: null,
    criminal_record: null,
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveFile = useMutation(api.storage.saveFile);
  const userDocuments = useQuery(api.storage.getUserDocuments, { userId });
  const verificationStatus = useQuery(api.storage.getUserVerificationStatus, { userId });

  useEffect(() => {
    // Load existing documents
    if (userDocuments) {
      const docMap: any = {};
      userDocuments.forEach((doc: any) => {
        docMap[doc.documentType] = {
          url: doc.url,
          status: doc.verificationStatus,
          fileName: doc.fileName,
        };
      });
      setDocuments(docMap);
    }
  }, [userDocuments]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitamos acceso a tu cámara y galería para subir documentos.',
      );
      return false;
    }
    return true;
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return null;

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      return result;
    }
    return null;
  };

  const uploadDocument = async (documentType: string, isImageType: boolean = true) => {
    try {
      setUploading(documentType);
      
      let file;
      if (isImageType) {
        // Show options for image documents
        Alert.alert(
          'Seleccionar Fuente',
          '¿Cómo deseas subir el documento?',
          [
            { text: 'Cámara', onPress: async () => {
              file = await pickImage('camera');
              if (file) await processUpload(file, documentType);
            }},
            { text: 'Galería', onPress: async () => {
              file = await pickImage('gallery');
              if (file) await processUpload(file, documentType);
            }},
            { text: 'Cancelar', style: 'cancel' },
          ]
        );
      } else {
        // For PDF documents
        file = await pickDocument();
        if (file) await processUpload(file, documentType);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al subir el documento');
    } finally {
      setUploading(null);
    }
  };

  const processUpload = async (file: any, documentType: string) => {
    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      
      // Create form data
      const response = await fetch(file.uri);
      const blob = await response.blob();
      
      // Upload to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': file.mimeType || 'image/jpeg',
        },
        body: blob,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const { storageId } = await uploadResponse.json();
      
      // Save file reference in database
      await saveFile({
        storageId,
        fileName: file.name || `${documentType}_${Date.now()}.jpg`,
        fileType: file.mimeType || 'image/jpeg',
        fileSize: file.fileSize || 0,
        userId,
        documentType: documentType as any,
      });
      
      // Update local state
      setDocuments((prev: any) => ({
        ...prev,
        [documentType]: {
          url: file.uri,
          status: 'pending',
          fileName: file.name || `${documentType}_${Date.now()}.jpg`,
        },
      }));
      
      Alert.alert('Éxito', 'Documento subido correctamente');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Error al subir el documento');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check size={16} color="#10B981" />;
      case 'rejected':
        return <X size={16} color="#EF4444" />;
      case 'pending':
        return <AlertCircle size={16} color="#F59E0B" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'En revisión';
      default:
        return 'No subido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const documentTypes = [
    {
      key: 'profile_photo',
      title: 'Foto de Perfil',
      description: 'Una foto clara de tu rostro',
      icon: <Camera size={24} color="#7C3AED" />,
      required: false,
      isImage: true,
    },
    {
      key: 'id_front',
      title: 'Cédula (Frente)',
      description: 'Foto del frente de tu documento de identidad',
      icon: <CreditCard size={24} color="#7C3AED" />,
      required: true,
      isImage: true,
    },
    {
      key: 'id_back',
      title: 'Cédula (Reverso)',
      description: 'Foto del reverso de tu documento de identidad',
      icon: <CreditCard size={24} color="#7C3AED" />,
      required: true,
      isImage: true,
    },
    {
      key: 'criminal_record',
      title: 'Antecedentes Penales',
      description: 'Certificado de antecedentes judiciales',
      icon: <Shield size={24} color="#7C3AED" />,
      required: true,
      isImage: false,
    },
  ];

  const allRequiredUploaded = documentTypes
    .filter(doc => doc.required)
    .every(doc => documents[doc.key]);

  const handleContinue = () => {
    if (!allRequiredUploaded) {
      Alert.alert(
        'Documentos Faltantes',
        'Por favor sube todos los documentos requeridos antes de continuar.',
      );
      return;
    }

    Alert.alert(
      'Documentos Enviados',
      'Tus documentos han sido enviados para revisión. Te notificaremos cuando tu cuenta sea verificada.',
      [
        {
          text: 'Continuar',
          onPress: () => navigation.navigate('Home', { userId }),
        },
      ]
    );
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FileText size={40} color="#7C3AED" />
          </View>
          <Text style={styles.title}>Verificación de Cuenta</Text>
          <Text style={styles.subtitle}>
            Sube tus documentos para verificar tu identidad
          </Text>
        </View>

        {/* Verification Status */}
        {verificationStatus && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Shield size={20} color={verificationStatus.isVerified ? '#10B981' : '#F59E0B'} />
              <Text style={styles.statusTitle}>
                Estado: {verificationStatus.isVerified ? 'Verificado' : 'Pendiente'}
              </Text>
            </View>
            {verificationStatus.verifiedAt && (
              <Text style={styles.statusDate}>
                Verificado el: {new Date(verificationStatus.verifiedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Document List */}
        <View style={styles.documentsContainer}>
          {documentTypes.map((docType) => {
            const doc = documents[docType.key];
            const isUploading = uploading === docType.key;

            return (
              <View key={docType.key} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={styles.documentIconContainer}>
                    {docType.icon}
                  </View>
                  <View style={styles.documentInfo}>
                    <View style={styles.documentTitleRow}>
                      <Text style={styles.documentTitle}>{docType.title}</Text>
                      {docType.required && (
                        <Text style={styles.requiredBadge}>Requerido</Text>
                      )}
                    </View>
                    <Text style={styles.documentDescription}>
                      {docType.description}
                    </Text>
                  </View>
                </View>

                {doc ? (
                  <View style={styles.uploadedContainer}>
                    {doc.url && docType.isImage && (
                      <Image source={{ uri: doc.url }} style={styles.thumbnail} />
                    )}
                    <View style={styles.uploadedInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {doc.fileName}
                      </Text>
                      <View style={styles.statusContainer}>
                        {getStatusIcon(doc.status)}
                        <Text
                          style={[styles.statusText, { color: getStatusColor(doc.status) }]}
                        >
                          {getStatusText(doc.status)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.reuploadButton}
                      onPress={() => uploadDocument(docType.key, docType.isImage)}
                      disabled={isUploading}
                    >
                      <Upload size={16} color="#7C3AED" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => uploadDocument(docType.key, docType.isImage)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator color="#7C3AED" />
                    ) : (
                      <>
                        <Upload size={20} color="#7C3AED" />
                        <Text style={styles.uploadButtonText}>Subir Documento</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !allRequiredUploaded && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!allRequiredUploaded}
        >
          <Text style={styles.continueButtonText}>
            {allRequiredUploaded ? 'Continuar' : 'Sube todos los documentos requeridos'}
          </Text>
        </TouchableOpacity>

        {/* Skip Link */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Home', { userId })}
        >
          <Text style={styles.skipText}>Completar más tarde</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  documentsContainer: {
    marginBottom: 20,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  requiredBadge: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: '#F9F5FF',
  },
  uploadButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  uploadedInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  reuploadButton: {
    padding: 8,
  },
  continueButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});