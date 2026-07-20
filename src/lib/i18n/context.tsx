"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dictionaries, type Locale, type Dictionary } from './dictionaries';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Detects the most likely locale based on browser settings before SDK init.
 */
function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ru';
  
  const saved = localStorage.getItem('app-locale') as Locale;
  if (saved === 'en' || saved === 'ru') return saved;
  
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  return browserLang === 'en' ? 'en' : 'ru'; // Default to 'ru' if not 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    const saved = localStorage.getItem('app-locale') as Locale;
    if (saved && (saved === 'en' || saved === 'ru') && saved !== locale) {
      console.log(`[Stage 3: Application] Restoring locale from storage: ${saved}`);
      setLocaleState(saved);
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState((prev) => {
      if (prev === newLocale) return prev;
      console.log(`[Stage 3: Application] Locale update applied: ${newLocale}`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-locale', newLocale);
      }
      return newLocale;
    });
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t: dictionaries[locale]
  }), [locale, setLocale]);

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
