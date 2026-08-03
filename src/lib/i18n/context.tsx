
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
 * Provides a sensible first-render default to avoid flashes of wrong language.
 */
function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ru';
  
  // Standard browser detection
  const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0].toLowerCase() : 'ru';
  const initial = browserLang === 'en' ? 'en' : 'ru';
  
  console.log(`[Stage 2: Initialization] Initial heuristic locale: ${initial}`);
  return initial; 
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // Sync HTML lang attribute with the current locale for A11y
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState((prev) => {
      if (prev === newLocale) return prev;
      
      console.log(`[Stage 3: Application] Locale sync applied: ${prev} -> ${newLocale}`);
      
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
