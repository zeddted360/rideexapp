
import React, { Dispatch, FC, JSX } from 'react'
import { Button } from '../ui/button';
import { IDiscountFetched, IFeaturedItemFetched, IMenuItemFetched, IPopularItemFetched,  } from '../../../types/types';

interface EditMenuTabProps {
filteredSubTabs: {
    id: string;
    label: string;
}[];
filteredPopularItems:IPopularItemFetched[];
filteredFeaturedItems:IFeaturedItemFetched[];
subActiveTab: "menu" | "featured" | "popular" | "discount";
filteredDiscounts:IDiscountFetched[];
setSubActiveTab:Dispatch<React.SetStateAction<"menu" | "featured" | "popular" | "discount">>;
filteredMenuItems:IMenuItemFetched[];
renderItemCard:(item: IMenuItemFetched | IPopularItemFetched | IFeaturedItemFetched | IDiscountFetched, type: "menu" | "featured" | "popular" | "discount") => React.JSX.Element
}

const EditMenuTab:FC<EditMenuTabProps> = ({
    filteredDiscounts,
    filteredPopularItems,
    filteredSubTabs,
    subActiveTab,
    setSubActiveTab,
    filteredMenuItems,
    renderItemCard,
    filteredFeaturedItems
}) => {
  return (
   <div className="space-y-6">
               <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                 {filteredSubTabs.map((tab) => (
                   <Button
                     key={tab.id}
                     onClick={() => setSubActiveTab(tab.id as "menu" | "featured" | "popular" | "discount")}
                     className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                       subActiveTab === tab.id
                         ? "bg-orange-500 text-white border-b-2 border-orange-500"
                         : "text-gray-600 dark:text-gray-300 hover:text-orange-500"
                     }`}
                   >
                     {tab.label}
                   </Button>
                 ))}
               </div>
               <div className="grid grid-cols-1 gap-6">
                 {subActiveTab === "menu" && filteredMenuItems.length > 0 ? (
                   filteredMenuItems.map((item: IMenuItemFetched) => (
                     <div key={item.$id}>{renderItemCard(item, "menu")}</div>
                   ))
                 ) : subActiveTab === "menu" ? (
                   <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                     No menu items available.
                   </div>
                 ) : null}
                 {subActiveTab === "featured" && filteredFeaturedItems.length > 0 ? (
                   filteredFeaturedItems.map((item: IFeaturedItemFetched) => (
                     <div key={item.$id}>{renderItemCard(item, "featured")}</div>
                   ))
                 ) : subActiveTab === "featured" ? (
                   <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                     No featured items available.
                   </div>
                 ) : null}
                 {subActiveTab === "popular" && filteredPopularItems.length > 0 ? (
                   filteredPopularItems.map((item: IPopularItemFetched) => (
                     <div key={item.$id}>{renderItemCard(item, "popular")}</div>
                   ))
                 ) : subActiveTab === "popular" ? (
                   <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                     No popular items available.
                   </div>
                 ) : null}
                 {subActiveTab === "discount" && filteredDiscounts.length > 0 ? (
                   filteredDiscounts.map((item: IDiscountFetched) => (
                     <div key={item.$id}>{renderItemCard(item, "discount")}</div>
                   ))
                 ) : subActiveTab === "discount" ? (
                   <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                     No discounts available.
                   </div>
                 ) : null}
               </div>
    </div>
  )
}

export default EditMenuTab;