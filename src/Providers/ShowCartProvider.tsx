"use client"
import { ShowCartContextProvider } from "@/context/showCart"
import { FC, ReactNode } from "react"

export const ShowCartProvider: FC<{ children: ReactNode }> = ({ children }) => {
    
    return <ShowCartContextProvider>{children}</ShowCartContextProvider>
}