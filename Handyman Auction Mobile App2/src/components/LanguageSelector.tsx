import React, { useState } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

const languages = [
  { code: 'es' as const, name: 'languages.spanish', flag: '🇪🇸' },
  { code: 'en' as const, name: 'languages.english', flag: '🇺🇸' },
  { code: 'pt' as const, name: 'languages.portuguese', flag: '🇧🇷' }
];

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: 'es' | 'en' | 'pt') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-150 transition-colors touch-manipulation"
      >
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Languages size={16} className="text-gray-600" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentLanguage?.flag}</span>
            <span className="text-gray-700 font-medium text-sm">{t(currentLanguage?.name || 'languages.spanish')}</span>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation first:rounded-t-xl last:rounded-b-xl ${
                  language === lang.code ? 'bg-blue-50 text-[#21ABF6]' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium text-sm">{t(lang.name)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}