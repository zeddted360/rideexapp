// components/Header/RightActions.tsx
import React from "react";
import { Button } from "@/components/ui/button";

import { Sun, Moon, Monitor, Globe, UserCircle } from "lucide-react";
import ProfileDropdown from "@/components/ui/ProfileDropdown";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface RightActionsProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  isLanguageLoading: boolean;
  isAuthenticated: boolean;
  user: any;
}

const RightActions: React.FC<RightActionsProps> = ({
  theme,
  setTheme,
  currentLanguage,
  changeLanguage,
  isLanguageLoading,
  isAuthenticated,
  user,
}) => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg ring-2 ring-green-500 transition-all duration-300 hover:scale-105 p-0"
          >
            {theme === "light" ? (
              <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            ) : theme === "dark" ? (
              <Moon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            ) : (
              <Monitor className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl"
        >
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className={`flex items-center gap-3 px-4 py-3 ${
              theme === "light"
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-3 px-4 py-3 ${
              theme === "dark"
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className={`flex items-center gap-3 px-4 py-3 ${
              theme === "system"
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLanguageLoading}
            className={`rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 p-0 ${
              isLanguageLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl"
        >
          <DropdownMenuItem
            onClick={() => changeLanguage("en")}
            className={`flex items-center gap-3 px-4 py-3 ${
              currentLanguage === "en"
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <span>🇺🇸</span>
            <span>{t("header.language.english")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeLanguage("ig")}
            className={`flex items-center gap-3 px-4 py-3 ${
              currentLanguage === "ig"
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <span>🇳🇬</span>
            <span>{t("header.language.igbo")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDropdown>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 p-0"
        >
          <UserCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </Button>
      </ProfileDropdown>
    </div>
  );
};

export default RightActions;