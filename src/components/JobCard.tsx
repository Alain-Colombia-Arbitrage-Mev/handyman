import React from 'react';
import { Job } from '../types';
import { MapPin, Calendar, DollarSign, Clock, Zap, User } from 'lucide-react-native';
import { Badge } from './ui/badge';
import { formatCurrency, formatSchedule } from '../utils/helpers';
import { useLanguage } from './LanguageProvider';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const { t } = useLanguage();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return t('jobCard.statusOpen');
      case 'in_progress':
        return t('jobCard.statusInProgress');
      case 'completed':
        return t('jobCard.statusCompleted');
      case 'closed':
        return t('jobCard.statusClosed');
      default:
        return status;
    }
  };

  const getBudgetTypeText = (type: string) => {
    return type === 'fixed' ? t('jobCard.fixed') : t('jobCard.average');
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return t('jobCard.timeAgo', { time: `${diffInMinutes}m` });
    } else if (diffInMinutes < 1440) {
      return t('jobCard.timeAgo', { time: `${Math.floor(diffInMinutes / 60)}h` });
    } else {
      return t('jobCard.timeAgo', { time: `${Math.floor(diffInMinutes / 1440)}d` });
    }
  };

  return (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md active:shadow-lg transition-all duration-200"
      onClick={() => onClick(job)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-semibold text-lg leading-tight">{job.title}</h3>
            {job.isUrgent && (
              <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full">
                <Zap size={12} />
                <span className="text-xs font-medium">{t('jobCard.urgent')}</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
            {job.description}
          </p>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} />
          <span>{job.location}</span>
          {job.distance && (
            <span className="text-blue-600">
              • {t('jobCard.distance', { 
                distance: job.distance < 1000 
                  ? `${job.distance}m` 
                  : `${(job.distance/1000).toFixed(1)}km` 
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>{t('jobCard.deadline')} {job.deadline.toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={14} />
          <span>{formatSchedule(job.schedule)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={14} />
          <span>{t('jobCard.postedBy')} {job.postedBy}</span>
          <span className="text-gray-400">• {timeAgo(job.postedDate)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {t(`categories.${job.category}`)}
          </Badge>
          <Badge className={getStatusColor(job.status)}>
            {getStatusText(job.status)}
          </Badge>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign size={16} />
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(job.budget)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {t('jobCard.budget')} {getBudgetTypeText(job.budgetType)}
          </span>
        </div>
      </div>

      {/* Offers indicator */}
      {job.bids.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-blue-600 font-medium">
            {t('jobCard.offersReceived', { count: job.bids.length })}
          </span>
        </div>
      )}
    </div>
  );
}