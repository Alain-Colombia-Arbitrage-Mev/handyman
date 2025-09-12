import React from 'react';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface ContactPageProps {
  onBackToProfile: () => void;
}

export function ContactPage({ onBackToProfile }: ContactPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('menu.contact')} onBack={onBackToProfile} />

      <div className="p-4 space-y-4">
        {/* Contact Information */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">{t('contact.info.title')}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <p className="font-medium">{t('contact.info.phone')}</p>
                <p className="text-sm text-gray-600">+57 1 234 5678</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <p className="font-medium">{t('contact.info.email')}</p>
                <p className="text-sm text-gray-600">soporte@parkiing.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="font-medium">{t('contact.info.liveChat')}</p>
                <p className="text-sm text-gray-600">{t('contact.info.available247')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-medium">{t('contact.info.offices')}</p>
                <p className="text-sm text-gray-600">{t('contact.info.address')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} />
            <h3 className="font-semibold">{t('contact.hours.title')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('contact.hours.mondayFriday')}:</span>
              <span className="font-medium">{t('contact.hours.mondayFridayTime')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('contact.hours.saturday')}:</span>
              <span className="font-medium">{t('contact.hours.saturdayTime')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('contact.hours.sunday')}:</span>
              <span className="font-medium">{t('contact.hours.closed')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('contact.hours.onlineChat')}:</span>
              <span className="font-medium text-green-600">24/7</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">{t('contact.form.title')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">{t('contact.form.fullName')} *</label>
              <Input placeholder={t('contact.form.fullNamePlaceholder')} className="h-12 touch-manipulation" />
            </div>

            <div>
              <label className="block font-medium mb-2">{t('contact.form.email')} *</label>
              <Input type="email" placeholder={t('contact.form.emailPlaceholder')} className="h-12 touch-manipulation" />
            </div>

            <div>
              <label className="block font-medium mb-2">{t('contact.form.phone')}</label>
              <Input type="tel" placeholder={t('contact.form.phonePlaceholder')} className="h-12 touch-manipulation" />
            </div>

            <div>
              <label className="block font-medium mb-2">{t('contact.form.subject')} *</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg h-12 text-base bg-white touch-manipulation">
                <option value="">{t('contact.form.selectSubject')}</option>
                <option value="support">{t('contact.form.subjects.support')}</option>
                <option value="billing">{t('contact.form.subjects.billing')}</option>
                <option value="account">{t('contact.form.subjects.account')}</option>
                <option value="suggestion">{t('contact.form.subjects.suggestion')}</option>
                <option value="other">{t('contact.form.subjects.other')}</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">{t('contact.form.message')} *</label>
              <Textarea 
                placeholder={t('contact.form.messagePlaceholder')}
                rows={4}
                className="resize-none touch-manipulation"
              />
            </div>

            <Button className="w-full h-12 touch-manipulation">
              <Send size={16} />
              {t('contact.form.sendMessage')}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              {t('contact.form.responseTime')}
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">{t('contact.emergency.title')}</h3>
          <p className="text-sm text-red-700 mb-3">
            {t('contact.emergency.description')}
          </p>
          <Button className="bg-red-600 hover:bg-red-700 text-white touch-manipulation">
            <Phone size={16} />
            {t('contact.emergency.callEmergency')}
          </Button>
        </div>
      </div>
    </div>
  );
}