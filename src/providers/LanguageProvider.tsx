import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'es' | 'en' | 'pt';
  setLanguage: (lang: 'es' | 'en' | 'pt') => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    tabs: {
      home: 'Inicio',
      search: 'Buscar',
      messages: 'Mensajes',
      profile: 'Perfil'
    },
    splash: {
      title: 'Handyman Auction',
      subtitle: 'Conectando profesionales con clientes'
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar'
    }
  },
  en: {
    tabs: {
      home: 'Home',
      search: 'Search',
      messages: 'Messages',
      profile: 'Profile'
    },
    splash: {
      title: 'Handyman Auction',
      subtitle: 'Connecting professionals with clients'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit'
    }
  },
  pt: {
    tabs: {
      home: 'Início',
      search: 'Buscar',
      messages: 'Mensagens',
      profile: 'Perfil'
    },
    splash: {
      title: 'Handyman Auction',
      subtitle: 'Conectando profissionais com clientes'
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar'
    }
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<'es' | 'en' | 'pt'>('es');

  const getNestedTranslation = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const translation = getNestedTranslation(translations[language], key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    if (typeof translation !== 'string') {
      return key;
    }
    
    if (!params) {
      return translation;
    }
    
    return Object.keys(params).reduce((text, param) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), String(params[param]));
    }, translation);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}