"use client";
import React from "react";
import {
  Building,
  Utensils,
  Star,
  Flame,
  Percent,
  Edit,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import { Button } from "../ui/button";

interface AddItemSidebarProps {
  activeTab: "account" | "discount" | "menu-item" | "featured-item" | "popular-item" | "edit-menu" | "extras";
  setActiveTab: (tab: "account" | "discount" | "menu-item" | "featured-item" | "popular-item" | "edit-menu" | "extras") => void;
}

const AddItemSidebar = ({ activeTab, setActiveTab }: AddItemSidebarProps) => {
  const tabs = [
    { 
      id: "account", 
      label: "My Restaurants", 
      icon: Building,
      description: "Manage your restaurants"
    },
    { 
      id: "edit-menu", 
      label: "Manage Contents", 
      icon: Edit,
      description: "Update menu items"
    },
    { 
      id: "menu-item", 
      label: "Add Menu Item", 
      icon: Utensils,
      description: "Create new dishes"
    },
    { 
      id: "featured-item", 
      label: "Add Featured", 
      icon: Star,
      description: "Highlight best dishes"
    },
    { 
      id: "popular-item", 
      label: "Add Popular", 
      icon: Flame,
      description: "Showcase favorites"
    },
    { 
      id: "discount", 
      label: "Add Discount", 
      icon: Percent,
      description: "Create promotions"
    },
     { id: "extras", label: "Manage Extras", icon: PlusCircle, description: "Add extract" }
  ];

  // console.log("The active tab is :", activeTab);

  const user = useAuth();
  const role = user.role;

  const filteredTabs = tabs.filter(tab => {
    if (role === "vendor" && (tab.id === "featured-item" || tab.id === "popular-item")) {
      return false;
    }
    return true;
  });

  return (
    <aside className="w-full lg:w-72 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 border-b lg:border-r border-gray-200 dark:border-gray-700 shadow-lg lg:shadow-none">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Vendor Dashboard
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage your business</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`group w-full flex items-center justify-between p-4 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:scale-102"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-white/20" 
                      : "bg-gray-100 dark:bg-gray-600 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isActive 
                        ? "text-white" 
                        : "text-orange-600 dark:text-orange-400"
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{tab.label}</div>
                    <div className={`text-xs transition-colors ${
                      isActive 
                        ? "text-orange-100" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                    }`}>
                      {tab.description}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-5 h-5 text-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                Pro Tip
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Feature your best dishes to boost visibility and sales!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dashboard</h2>
        </div>
        <nav className="flex overflow-x-auto gap-2 p-4 scrollbar-hide">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap min-w-[100px] ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? "bg-white/20" 
                    : "bg-orange-100 dark:bg-orange-900/30"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive 
                      ? "text-white" 
                      : "text-orange-600 dark:text-orange-400"
                  }`} />
                </div>
                <span className="text-xs font-semibold">{tab.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AddItemSidebar;