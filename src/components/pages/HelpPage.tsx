import React from 'react';
import { Phone, Mail, MessageCircle, HelpCircle, FileText, Shield, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface HelpPageProps {
  onBackToProfile: () => void;
}

export function HelpPage({ onBackToProfile }: HelpPageProps) {
  const { t } = useLanguage();
  
  const faqData = [
    {
      question: t('help.faq.howToPublishJob.question'),
      answer: t('help.faq.howToPublishJob.answer')
    },
    {
      question: t('help.faq.howRadarWorks.question'),
      answer: t('help.faq.howRadarWorks.answer')
    },
    {
      question: t('help.faq.whatAreCommercialOffers.question'),
      answer: t('help.faq.whatAreCommercialOffers.answer')
    },
    {
      question: t('help.faq.howBiddingWorks.question'),
      answer: t('help.faq.howBiddingWorks.answer')
    },
    {
      question: t('help.faq.howToPayForJob.question'),
      answer: t('help.faq.howToPayForJob.answer')
    },
    {
      question: t('help.faq.whatIfNotSatisfied.question'),
      answer: t('help.faq.whatIfNotSatisfied.answer')
    },
    {
      question: t('help.faq.howProfessionalsVerified.question'),
      answer: t('help.faq.howProfessionalsVerified.answer')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('menu.helpSupport')} onBack={onBackToProfile} />

      <div className="p-4 space-y-4">
        {/* Contact Options */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">{t('help.contact.title')}</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <Phone size={20} className="text-green-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{t('help.contact.phone')}</p>
                <p className="text-sm text-gray-500">+52 55 1234 5678</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <Mail size={20} className="text-blue-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{t('help.contact.email')}</p>
                <p className="text-sm text-gray-500">soporte@parkiing.com</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <MessageCircle size={20} className="text-purple-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{t('help.contact.liveChat')}</p>
                <p className="text-sm text-gray-500">{t('help.contact.available247')}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={20} className="text-orange-600" />
            <h3 className="font-semibold">{t('help.faq.title')}</h3>
          </div>
          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <details key={index} className="border rounded-lg">
                <summary className="p-3 font-medium cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  {faq.question}
                </summary>
                <div className="p-3 pt-0 text-sm text-gray-600 border-t leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">{t('help.resources.title')}</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <FileText size={20} className="text-gray-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{t('help.resources.termsAndConditions')}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <Shield size={20} className="text-gray-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{t('help.resources.privacyPolicy')}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <HelpCircle size={20} className="text-gray-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{t('help.resources.userGuide')}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">{t('help.appInfo.title')}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>{t('help.appInfo.version')}:</span>
              <span>2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>{t('help.appInfo.lastUpdate')}:</span>
              <span>{t('help.appInfo.lastUpdateDate')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('help.appInfo.deviceId')}:</span>
              <span>ABC123...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}