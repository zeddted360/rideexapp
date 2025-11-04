"use client"
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { getAsyncRestaurantById } from "@/state/restaurantSlice";
import toast from "react-hot-toast";
import { IRestaurantFetched } from "../../types/types";

export interface UseRestaurantResult {
  restaurant: IRestaurantFetched | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  refetch: () => void;
}

export const useRestaurantById = (restaurantId: string | null): UseRestaurantResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedRestaurant, loading: reduxLoading, error: reduxError } = useSelector(
    (state: RootState) => state.restaurant
  );

  const [localState, setLocalState] = useState<UseRestaurantResult>({
    restaurant: null,
    loading: "idle",
    error: null,
    refetch: () => {},
  });

  const refetch = useCallback(async () => {
    if (!restaurantId) return;
    setLocalState(prev => ({ ...prev, loading: "pending", error: null }));
    try {
      await dispatch(getAsyncRestaurantById(restaurantId)).unwrap();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch restaurant";
      setLocalState(prev => ({ ...prev, loading: "failed", error: errorMsg }));
      toast.error(errorMsg);
    }
  }, [dispatch, restaurantId]);

  useEffect(() => {
    if (reduxLoading === "succeeded" && selectedRestaurant?.$id === restaurantId) {
      setLocalState({
        restaurant: selectedRestaurant,
        loading: "succeeded",
        error: null,
        refetch,
      });
    } else if (reduxError) {
      setLocalState({
        restaurant: null,
        loading: "failed",
        error: reduxError,
        refetch,
      });
    }
  }, [selectedRestaurant, reduxLoading, reduxError, restaurantId, refetch]);

  useEffect(() => {
    if (!restaurantId || localState.loading !== "idle") return;
    if (selectedRestaurant?.$id === restaurantId) {
      setLocalState({
        restaurant: selectedRestaurant,
        loading: "succeeded",
        error: null,
        refetch,
      });
    } else {
      refetch();
    }
  }, [restaurantId, selectedRestaurant, refetch]);

  return localState;
};