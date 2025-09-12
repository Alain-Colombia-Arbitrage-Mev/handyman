import React from 'react';
import { Payment } from '../../types';
import { CheckCircle, Clock, XCircle, Download, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface PaymentsPageProps {
  payments: Payment[];
  onBackToProfile: () => void;
  formatCurrency: (amount: number) => string;
}

export function PaymentsPage({ payments, onBackToProfile, formatCurrency }: PaymentsPageProps) {
  const { t } = useLanguage();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'failed': return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('payments.status.completed');
      case 'pending': return t('payments.status.pending');
      case 'failed': return t('payments.status.failed');
      case 'refunded': return t('payments.status.refunded');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('profile.payments')} onBack={onBackToProfile} />

      <div className="p-4 space-y-4">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t('payments.methods.title')}</h3>
            <Button size="sm" variant="outline">{t('payments.methods.add')}</Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard size={20} className="text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">{t('payments.methods.creditCard')}</p>
                <p className="text-sm text-gray-500">**** **** **** 1234</p>
              </div>
              <Badge variant="secondary">{t('payments.methods.primary')}</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard size={20} className="text-green-600" />
              <div className="flex-1">
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-gray-500">juan@email.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">{t('payments.history.title')}</h3>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{payment.jobTitle}</h4>
                    <p className="text-sm text-gray-600 truncate">{payment.handymanName}</p>
                    <p className="text-xs text-gray-500">{payment.date.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusText(payment.status)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="truncate">{payment.paymentMethod}</span>
                  <div className="flex items-center gap-2 ml-2">
                    {getStatusIcon(payment.status)}
                    <span className="text-xs">{t('payments.history.transactionId')}: {payment.transactionId}</span>
                    <Button size="sm" variant="ghost" className="p-1" title={t('payments.history.download')}>
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}