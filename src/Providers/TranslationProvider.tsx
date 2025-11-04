"use client"
import { I18nextProvider } from "react-i18next";
import { ReactNode } from "react";
import i18n from "@/app/lib/i18n";






export const TranslationProvider = ({children}:{children:ReactNode}) => {
    
    return <I18nextProvider i18n={i18n}>{ children}</I18nextProvider>;
}

