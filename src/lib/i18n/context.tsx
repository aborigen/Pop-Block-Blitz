"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dictionaries, type Locale, type Dictionary } from './dictionaries';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Defaulting to Russian ('ru') as requested
  const [locale, setLocale] = useState<Locale>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('app-locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ru')) {
      console.log(`[Stage 3: Application] Restoring locale from storage: ${saved}`);
      setLocale(saved);
    }
  }, []);

  const handleSetLocale = useCallback((newLocale: Locale) => {
    console.log(`[Stage 3: Application] Locale update applied: ${newLocale}`);
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-locale', newLocale);
    }
  }, []);

  const value = {
    locale,
    setLocale: handleSetLocale,
    t: dictionaries[locale]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
