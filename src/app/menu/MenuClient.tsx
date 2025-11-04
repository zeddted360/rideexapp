"use client";
import React, { Suspense } from "react";
import RestaurantCardSkeleton from "@/components/ui/restaurantCardSkeleton";
import RestaurantList from "@/components/ui/RestaurantList";

const Menu = () => {
  return (
    <div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <RestaurantCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <RestaurantList />
      </Suspense>
    </div>
  );
};

export default Menu;
