"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dictionaries, type Locale, type Dictionary } from './dictionaries';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale, persist?: boolean) => void;
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
  
  const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0].toLowerCase() : 'ru';
  return browserLang === 'en' ? 'en' : 'ru'; 
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // Sync HTML lang attribute with the current locale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale, persist: boolean = true) => {
    setLocaleState((prev) => {
      if (prev === newLocale) return prev;
      
      console.log(`[Stage 3: Application] Locale update applied: ${newLocale} (Manual Persist: ${persist})`);
      
      if (persist && typeof window !== 'undefined') {
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
