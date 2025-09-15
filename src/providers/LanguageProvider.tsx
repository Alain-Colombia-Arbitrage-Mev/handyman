import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSettings } from '../store';

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
      post: 'Publicar',
      radar: 'Radar',
      messages: 'Mensajes',
      profile: 'Perfil'
    },
    splash: {
      title: 'Parkiing',
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
    },
    notifications: {
      new_proposal: 'Nueva propuesta',
      new_message: 'Nuevo mensaje',
      job_assigned: 'Trabajo asignado',
      job_completed: 'Trabajo completado',
      mark_all_read: 'Marcar todas como leídas',
      no_notifications: 'No hay notificaciones'
    },
    jobs: {
      urgent: 'Urgente',
      budget: 'Presupuesto',
      location: 'Ubicación',
      deadline: 'Fecha límite',
      proposals: 'Propuestas',
      submit_proposal: 'Enviar propuesta',
      view_details: 'Ver detalles'
    },
    auth: {
      login: 'Iniciar sesión',
      register: 'Registrarse',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      name: 'Nombre completo',
      phone: 'Teléfono'
    }
  },
  en: {
    tabs: {
      home: 'Home',
      post: 'Post',
      radar: 'Radar',
      messages: 'Messages',
      profile: 'Profile'
    },
    splash: {
      title: 'Parkiing',
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
    },
    notifications: {
      new_proposal: 'New proposal',
      new_message: 'New message',
      job_assigned: 'Job assigned',
      job_completed: 'Job completed',
      mark_all_read: 'Mark all as read',
      no_notifications: 'No notifications'
    },
    jobs: {
      urgent: 'Urgent',
      budget: 'Budget',
      location: 'Location',
      deadline: 'Deadline',
      proposals: 'Proposals',
      submit_proposal: 'Submit proposal',
      view_details: 'View details'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      name: 'Full name',
      phone: 'Phone'
    }
  },
  pt: {
    tabs: {
      home: 'Início',
      post: 'Publicar',
      radar: 'Radar',
      messages: 'Mensagens',
      profile: 'Perfil'
    },
    splash: {
      title: 'Parkiing',
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
    },
    notifications: {
      new_proposal: 'Nova proposta',
      new_message: 'Nova mensagem',
      job_assigned: 'Trabalho atribuído',
      job_completed: 'Trabalho concluído',
      mark_all_read: 'Marcar todas como lidas',
      no_notifications: 'Nenhuma notificação'
    },
    jobs: {
      urgent: 'Urgente',
      budget: 'Orçamento',
      location: 'Localização',
      deadline: 'Prazo',
      proposals: 'Propostas',
      submit_proposal: 'Enviar proposta',
      view_details: 'Ver detalhes'
    },
    auth: {
      login: 'Entrar',
      register: 'Registrar',
      logout: 'Sair',
      email: 'Email',
      password: 'Senha',
      name: 'Nome completo',
      phone: 'Telefone'
    }
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { settings, setLanguage: setStoreLanguage } = useSettings();
  const language = settings.language;

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

  const setLanguage = (lang: 'es' | 'en' | 'pt') => {
    setStoreLanguage(lang);
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