import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types';
import { formatCurrency, formatSchedule } from '../utils/helpers';
import { useLanguage } from '../providers/LanguageProvider';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
  type?: 'opportunities' | 'flashJobs' | 'offers';
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // Two cards per row with padding

export function JobCard({ job, onPress, type = 'opportunities' }: JobCardProps) {
  const { t } = useLanguage();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'in_progress':
        return { backgroundColor: '#dbeafe', color: '#2563eb' };
      case 'completed':
        return { backgroundColor: '#f3f4f6', color: '#374151' };
      case 'closed':
        return { backgroundColor: '#fecaca', color: '#dc2626' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Abierto';
      case 'in_progress':
        return 'En progreso';
      case 'completed':
        return 'Completado';
      case 'closed':
        return 'Cerrado';
      default:
        return status;
    }
  };

  const getBackgroundGradient = () => {
    switch (type) {
      case 'flashJobs':
        return ['#ef4444', '#dc2626', '#b91c1c'];
      case 'offers':
        return ['#10b981', '#059669', '#047857'];
      default:
        return ['#3b82f6', '#2563eb', '#1d4ed8'];
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'flashJobs':
        return '#ef4444';
      case 'offers':
        return '#10b981';
      default:
        return '#3b82f6';
    }
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => onPress(job)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getBackgroundGradient()}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            {job.isUrgent && (
              <View style={styles.urgentBadge}>
                <Ionicons name="flash" size={12} color="#ffffff" />
                <Text style={styles.urgentText}>Urgente</Text>
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
              <Text style={styles.typeText}>
                {type === 'flashJobs' ? 'Flash' : type === 'offers' ? 'Oferta' : 'Trabajo'}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {job.title}
            </Text>
            
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {job.location}
                </Text>
              </View>
              
              {job.distance && (
                <View style={styles.detailItem}>
                  <Ionicons name="navigate-outline" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {job.distance < 1000 
                      ? `${job.distance}m` 
                      : `${(job.distance/1000).toFixed(1)}km`}
                  </Text>
                </View>
              )}
            </View>

            {/* Budget */}
            <View style={styles.budget}>
              <Text style={styles.budgetAmount}>
                {formatCurrency(job.budget)}
              </Text>
              <Text style={styles.budgetType}>
                {job.budgetType === 'fixed' ? 'Fijo' : 'Promedio'}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={[styles.statusBadge, getStatusColor(job.status)]}>
                <Text style={[styles.statusText, { color: getStatusColor(job.status).color }]}>
                  {getStatusText(job.status)}
                </Text>
              </View>
              <Text style={styles.timeAgo}>
                {timeAgo(job.postedDate)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    height: 220,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backgroundGradient: {
    flex: 1,
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  urgentBadge: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  urgentText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 20,
  },
  details: {
    gap: 4,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    flex: 1,
  },
  budget: {
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  budgetType: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.8,
  },
});