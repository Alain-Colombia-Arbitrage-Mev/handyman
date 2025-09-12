import React from 'react';
import { UserSettings } from '../../types';
import { Bell, Shield, Settings, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { BackHeader } from '../Header';
import { useLanguage } from '../LanguageProvider';

interface SettingsPageProps {
  settingsData: UserSettings;
  onBackToProfile: () => void;
  onUpdateSettings: (section: keyof UserSettings, key: string, value: any) => void;
}

export function SettingsPage({ settingsData, onBackToProfile, onUpdateSettings }: SettingsPageProps) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackHeader title={t('menu.settings')} onBack={onBackToProfile} />

      <div className="p-4 space-y-4">
        {/* Notificaciones */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-blue-600" />
            <h3 className="font-semibold">{t('settings.notifications.title')}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.notifications.push')}</p>
                <p className="text-sm text-gray-500">{t('settings.notifications.pushDesc')}</p>
              </div>
              <Switch
                checked={settingsData.notifications.pushEnabled}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'pushEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.notifications.email')}</p>
                <p className="text-sm text-gray-500">{t('settings.notifications.emailDesc')}</p>
              </div>
              <Switch
                checked={settingsData.notifications.emailEnabled}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'emailEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.notifications.sms')}</p>
                <p className="text-sm text-gray-500">{t('settings.notifications.smsDesc')}</p>
              </div>
              <Switch
                checked={settingsData.notifications.smsEnabled}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'smsEnabled', checked)}
              />
            </div>
            
            <hr className="my-3" />
            
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.newOffers')}</p>
              <Switch
                checked={settingsData.notifications.newBids}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'newBids', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.messages')}</p>
              <Switch
                checked={settingsData.notifications.messages}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'messages', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.jobUpdates')}</p>
              <Switch
                checked={settingsData.notifications.jobUpdates}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'jobUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.nearbyJobs')}</p>
              <Switch
                checked={settingsData.notifications.nearbyJobs}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'nearbyJobs', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.commercialOffers')}</p>
              <Switch
                checked={settingsData.notifications.commercialOffers}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'commercialOffers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.surplusAuctions')}</p>
              <Switch
                checked={settingsData.notifications.surplusAuctions}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'surplusAuctions', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.internalMessages')}</p>
              <Switch
                checked={settingsData.notifications.internalMessages}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'internalMessages', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">{t('settings.notifications.promotions')}</p>
              <Switch
                checked={settingsData.notifications.promotions}
                onCheckedChange={(checked) => onUpdateSettings('notifications', 'promotions', checked)}
              />
            </div>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-green-600" />
            <h3 className="font-semibold">{t('settings.privacy.title')}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.privacy.showProfile')}</p>
                <p className="text-sm text-gray-500">{t('settings.privacy.showProfileDesc')}</p>
              </div>
              <Switch
                checked={settingsData.privacy.showProfile}
                onCheckedChange={(checked) => onUpdateSettings('privacy', 'showProfile', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.privacy.showLocation')}</p>
                <p className="text-sm text-gray-500">{t('settings.privacy.showLocationDesc')}</p>
              </div>
              <Switch
                checked={settingsData.privacy.showLocation}
                onCheckedChange={(checked) => onUpdateSettings('privacy', 'showLocation', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.privacy.shareLocationForJobs')}</p>
                <p className="text-sm text-gray-500">{t('settings.privacy.shareLocationForJobsDesc')}</p>
              </div>
              <Switch
                checked={settingsData.privacy.shareLocationForJobs}
                onCheckedChange={(checked) => onUpdateSettings('privacy', 'shareLocationForJobs', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.privacy.allowDirectContact')}</p>
                <p className="text-sm text-gray-500">{t('settings.privacy.allowDirectContactDesc')}</p>
              </div>
              <Switch
                checked={settingsData.privacy.allowDirectContact}
                onCheckedChange={(checked) => onUpdateSettings('privacy', 'allowDirectContact', checked)}
              />
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-purple-600" />
            <h3 className="font-semibold">{t('settings.preferences.title')}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>{t('settings.preferences.language')}</span>
                </div>
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                value={settingsData.preferences.language}
                onChange={(e) => onUpdateSettings('preferences', 'language', e.target.value)}
              >
                <option value="es">🇪🇸 {t('languages.spanish')}</option>
                <option value="en">🇺🇸 {t('languages.english')}</option>
                <option value="pt">🇧🇷 {t('languages.portuguese')}</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">{t('settings.preferences.currency')}</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                value={settingsData.preferences.currency}
                onChange={(e) => onUpdateSettings('preferences', 'currency', e.target.value)}
              >
                <option value="COP">🇨🇴 {t('settings.preferences.currencyOptions.cop')}</option>
                <option value="USD">🇺🇸 {t('settings.preferences.currencyOptions.usd')}</option>
                <option value="EUR">🇪🇺 {t('settings.preferences.currencyOptions.eur')}</option>
                <option value="BRL">🇧🇷 {t('settings.preferences.currencyOptions.brl')}</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">{t('settings.preferences.theme')}</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                value={settingsData.preferences.theme}
                onChange={(e) => onUpdateSettings('preferences', 'theme', e.target.value)}
              >
                <option value="light">☀️ {t('settings.preferences.themeOptions.light')}</option>
                <option value="dark">🌙 {t('settings.preferences.themeOptions.dark')}</option>
                <option value="auto">🔄 {t('settings.preferences.themeOptions.auto')}</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">{t('settings.preferences.radarRadius')}</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                value={settingsData.preferences.radarRadius}
                onChange={(e) => onUpdateSettings('preferences', 'radarRadius', parseInt(e.target.value))}
              >
                <option value={500}>📍 {t('settings.preferences.radiusOptions.meters500')}</option>
                <option value={1000}>🎯 {t('settings.preferences.radiusOptions.km1')}</option>
                <option value={2000}>🌐 {t('settings.preferences.radiusOptions.km2')}</option>
                <option value={5000}>🗺️ {t('settings.preferences.radiusOptions.km5')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4 text-[#21ABF6]">{t('settings.account.title')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.account.appVersion')}:</span>
              <span className="font-medium">2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.account.lastSync')}:</span>
              <span className="font-medium">{t('settings.account.fiveMinutesAgo')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.account.serverStatus')}:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-600">{t('settings.account.connected')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuenta */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4 text-red-600">{t('settings.dangerZone.title')}</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
              {t('settings.dangerZone.deactivateAccount')}
            </Button>
            <Button variant="destructive" className="w-full">
              {t('settings.dangerZone.deleteAccount')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}