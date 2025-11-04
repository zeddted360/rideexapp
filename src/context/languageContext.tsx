"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  isLanguageLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);

  useEffect(() => {
    // Set initial language from i18n
    setCurrentLanguage(i18n.language || "en");
  }, [i18n.language]);

  const changeLanguage = async (language: string) => {
    setIsLanguageLoading(true);
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      // Store in localStorage for persistence
      localStorage.setItem("i18nextLng", language);
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsLanguageLoading(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        isLanguageLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}; 