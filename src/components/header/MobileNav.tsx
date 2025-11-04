// components/Header/MobileNav.tsx
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Sun,
  Moon,
  Globe,
  History,
  Settings,
  Shield,
  LogOut,
  Plus,
  UserCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileNavProps {
  pathname: string;
  t: any;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  isLanguageLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  role: string | null;
  router: any;
  handleLogout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({
  pathname,
  t,
  theme,
  setTheme,
  currentLanguage,
  changeLanguage,
  isLanguageLoading,
  isAuthenticated,
  user,
  role,
  router,
  handleLogout,
}) => {
  return (
    <div className="flex lg:hidden items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 p-0"
          >
            <Menu className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl flex flex-col min-h-[400px]"
        >
          <DropdownMenuItem asChild>
            <Link href="/" className="flex items-center gap-3 px-4 py-3">
              <span>{t("header.home")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/menu" className="flex items-center gap-3 px-4 py-3">
              <span>{t("header.menu")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/offers" className="flex items-center gap-3 px-4 py-3">
              <span>{t("header.offers")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/myorders" className="flex items-center gap-3 px-4 py-3">
              <span>{t("header.orders")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/history" className="flex items-center gap-3 px-4 py-3">
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/address" className="flex items-center gap-3 px-4 py-3">
              <span>{t("header.contact")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center gap-3 px-4 py-3"
          >
            {theme === "light" ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DropdownMenuItem className="flex items-center gap-3 px-4 py-3">
                <Globe className="w-4 h-4" />
                <span>{t("header.language.english")}</span>
              </DropdownMenuItem>
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

          {isAuthenticated && (
            <>
              <DropdownMenuItem
                onClick={() => router.push("/myorders")}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <UserCircle className="w-4 h-4 text-gray-500" />
                <span>{t("header.orders")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/address")}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>{t("header.contact")}</span>
              </DropdownMenuItem>
              {(user?.isAdmin || role === "vendor") && (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push("/vendor")}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer text-orange-600 font-bold bg-orange-50 dark:bg-orange-900/20 rounded-lg mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Vendor Dashboard</span>
                  </DropdownMenuItem>
                  {role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin/dashboard")}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </>
          )}

          {!isAuthenticated && (
            <div className="flex flex-col gap-2 mt-8 px-4 pb-4 w-full">
              <Link href="/vendor/login">
                <Button
                  variant="outline"
                  className="w-full mb-2 text-orange-600 border-orange-500 bg-white hover:bg-orange-50 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-400 dark:hover:bg-orange-900/60 font-semibold px-3 py-2 rounded-lg transition-all text-sm"
                >
                  Login as vendor
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full text-orange-600 border-orange-500 bg-white hover:bg-orange-50 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-400 dark:hover:bg-orange-900/60 font-semibold px-3 py-2 rounded-lg transition-all text-sm"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-2 rounded-lg transition-all text-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileNav;