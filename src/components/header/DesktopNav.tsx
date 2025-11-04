// components/Header/DesktopNav.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DesktopNavProps {
  pathname: string;
  t: any;
  user: any;
  role: string | null;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ pathname, t, user, role }) => {
  return (
    <nav className="hidden lg:flex items-center space-x-8">
      <Link
        href="/"
        className={`text-sm font-medium transition-colors ${
          pathname === "/"
            ? "text-orange-600 dark:text-orange-400"
            : "text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400"
        }`}
      >
        {t("header.home")}
      </Link>
      <Link
        href="/menu"
        className={`text-sm font-medium transition-colors ${
          pathname === "/menu"
            ? "text-orange-600 dark:text-orange-400"
            : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
        }`}
      >
        {t("header.menu")}
      </Link>
      <Link
        href="/offers"
        className={`text-sm font-medium transition-colors ${
          pathname === "/offers"
            ? "text-orange-600 dark:text-orange-400"
            : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
        }`}
      >
        {t("header.offers")}
      </Link>
      <Link
        href="/myorders"
        className={`text-sm font-medium transition-colors ${
          pathname === "/myorders"
            ? "text-orange-600 dark:text-orange-400"
            : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
        }`}
      >
        {t("header.orders")}
      </Link>
      <Link
        href="/address"
        className={`text-sm font-medium transition-colors ${
          pathname === "/address"
            ? "text-orange-600 dark:text-orange-400"
            : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
        }`}
      >
        {t("header.contact")}
      </Link>
      {(role === "admin" || role === "vendor") && !user.code &&  (
        <>
          <Link href="/vendor" className="ml-2">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-4 py-2 cursor-pointer rounded-lg shadow-md flex items-center gap-2 transition-all border-0">
            <Plus className="w-4 h-4" />
             Vendor dashboard
            </Button>
          </Link>
          {!user.code && role === "admin" &&  (
            <Link href="/admin/dashboard" className="ml-2">
              <Button className="bg-gradient-to-r from-gray-700 to-orange-500 hover:from-gray-800 hover:to-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all border-0">
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Button>
            </Link>
          )}
        </>
      )}
      {!user && (
        <div className="flex items-center gap-2 ml-4">
          <Link href="/vendor/login">
            <Button
              variant="outline"
              className="text-orange-600 border-orange-500 bg-white hover:bg-orange-50 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-400 dark:hover:bg-orange-900/60 font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Login as a vendor
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="text-orange-600 border-orange-500 bg-white hover:bg-orange-50 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-400 dark:hover:bg-orange-900/60 font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-all">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default DesktopNav;