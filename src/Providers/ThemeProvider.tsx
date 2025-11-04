"use client"
import { ThemeProvider } from "@/app/Providers/theme-provider";
import { ReactNode } from "react";



export const _ThemeProvider = ({ children }: { children: ReactNode }) => {
    
    return <ThemeProvider>{ children}</ThemeProvider>
};