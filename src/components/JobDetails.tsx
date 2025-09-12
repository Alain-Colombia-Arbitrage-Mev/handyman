import React, { useState } from 'react';
import { Job, Bid } from '../types';
import { ArrowLeft, MapPin, Clock, DollarSign, Star, MessageCircle, Calendar, AlertCircle, Users, CheckCircle2, User } from 'lucide-react-native';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { useLanguage } from './LanguageProvider';
import { formatCurrency } from '../utils/helpers';

interface JobDetailsProps {
  job: Job;
  onBack: () => void;
  onSubmitBid: (bid: Omit<Bid, 'id' | 'submittedAt' | 'status'>) => void;
}

export function JobDetails({ job, onBack, onSubmitBid }: JobDetailsProps) {
  const { t } = useLanguage();
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [timeline, setTimeline] = useState('');
  const [estimatedStartDate, setEstimatedStartDate] = useState('');
  const [estimatedEndDate, setEstimatedEndDate] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);

  const getBudgetTypeText = (budgetType: string) => {
    return budgetType === 'fixed' ? t('jobDetails.budgetType') : t('jobCard.average');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return t('jobCard.statusOpen');
      case 'in_progress': return t('jobCard.statusInProgress');
      case 'completed': return t('jobCard.statusCompleted');
      case 'closed': return t('jobCard.statusClosed');
      default: return status;
    }
  };

  const handleSubmitBid = () => {
    if (!bidAmount || !bidMessage || !timeline || !estimatedStartDate || !estimatedEndDate) return;

    onSubmitBid({
      handymanId: '1', // Mock current user
      handymanName: t('jobDetails.yourUser'),
      handymanAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      handymanRating: 4.8,
      amount: parseInt(bidAmount),
      message: bidMessage,
      timeline: timeline,
      estimatedStartDate: estimatedStartDate,
      estimatedEndDate: estimatedEndDate,
    });

    setBidAmount('');
    setBidMessage('');
    setTimeline('');
    setEstimatedStartDate('');
    setEstimatedEndDate('');
    setShowBidForm(false);
  };

  const timeLeft = Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Fixed */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="font-semibold truncate mx-4">{t('jobDetails.jobDetails')}</h1>
          <Badge className={`${getStatusColor(job.status)} text-xs`}>
            {getStatusText(job.status)}
          </Badge>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pb-20">
        {/* Job Header Card */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Job Image */}
            {job.images.length > 0 && (
              <div className="relative h-48 sm:h-56">
                <img 
                  src={job.images[0]} 
                  alt={job.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
            
            {/* Job Info */}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 leading-tight">{job.title}</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">{job.description}</p>
              
              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} />
                  <span>{timeLeft > 0 ? t('jobDetails.daysLeft', { days: timeLeft }) : t('jobDetails.expired')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} />
                  <span className="truncate">{job.postedBy}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} />
                  <span>{t('jobDetails.offersCount', { count: job.bids.length })}</span>
                </div>
              </div>

              {/* Budget Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} />
                    <span className="font-semibold text-green-800">
                      {formatCurrency(job.budget)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getBudgetTypeText(job.budgetType)}
                  </Badge>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} />
                  <span className="text-sm text-blue-700">
                    {job.budgetType === 'fixed' 
                      ? t('jobDetails.fixedBudgetTip')
                      : t('jobDetails.averageBudgetTip')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bid Form */}
        {job.status === 'open' && (
          <div className="px-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t('jobDetails.interestedInJob')}</h3>
                  <Button
                    onClick={() => setShowBidForm(!showBidForm)}
                    size="sm"
                    variant={showBidForm ? "outline" : "default"}
                    className="text-sm"
                  >
                    {showBidForm ? t('common.cancel') : t('jobDetails.makeOffer')}
                  </Button>
                </div>
              </div>

              {showBidForm && (
                <div className="p-4 space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobDetails.yourOffer')} *</label>
                    <div className="relative">
                      <DollarSign size={18} />
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="2500"
                        className="pl-10 text-base h-12"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('jobDetails.reference')}: {formatCurrency(job.budget)} ({getBudgetTypeText(job.budgetType).toLowerCase()})
                    </p>
                  </div>

                  {/* Timeline Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('jobDetails.start')} *</label>
                      <Input
                        value={estimatedStartDate}
                        onChange={(e) => setEstimatedStartDate(e.target.value)}
                        placeholder={t('jobDetails.startPlaceholder')}
                        className="text-base h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('jobDetails.delivery')} *</label>
                      <Input
                        value={estimatedEndDate}
                        onChange={(e) => setEstimatedEndDate(e.target.value)}
                        placeholder={t('jobDetails.deliveryPlaceholder')}
                        className="text-base h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobDetails.estimatedDuration')} *</label>
                    <Input
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder={t('jobDetails.durationPlaceholder')}
                      className="text-base h-12"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobDetails.describeProposal')} *</label>
                    <Textarea
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      placeholder={t('jobDetails.proposalPlaceholder')}
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleSubmitBid} 
                    className="w-full h-12 text-base"
                    disabled={!bidAmount || !bidMessage || !timeline || !estimatedStartDate || !estimatedEndDate}
                  >
                    {t('jobDetails.sendOffer')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bids Section */}
        <div className="px-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold">{t('jobDetails.bids')} ({job.bids.length})</h3>
            </div>

            {job.bids.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {job.bids.map((bid) => (
                  <div key={bid.id} className="p-4">
                    {/* Bid Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={bid.handymanAvatar}
                        alt={bid.handymanName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="min-w-0">
                            <h4 className="font-medium truncate">{bid.handymanName}</h4>
                            <div className="flex items-center gap-1">
                              <Star size={14} />
                              <span className="text-sm text-gray-600">{bid.handymanRating}</span>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(bid.amount)}
                            </div>
                            <div className="text-xs text-gray-500">{bid.timeline}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <div>
                            <p className="text-gray-500 text-xs">{t('jobDetails.start')}</p>
                            <p className="font-medium">{bid.estimatedStartDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          <div>
                            <p className="text-gray-500 text-xs">{t('jobDetails.delivery')}</p>
                            <p className="font-medium">{bid.estimatedEndDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bid Message */}
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">{bid.message}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle size={14} />
                        {t('job.message')}
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        {t('jobDetails.acceptOffer')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users size={48} />
                <h4 className="font-medium text-gray-600 mb-1">{t('jobDetails.noBids')}</h4>
                <p className="text-sm text-gray-500">
                  {t('jobDetails.bidsWillAppear')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}