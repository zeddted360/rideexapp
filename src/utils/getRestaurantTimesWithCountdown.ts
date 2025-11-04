// utils/getRestaurantTimesWithCountdown.ts
import { IRestaurantFetched } from "../../types/types";

interface RestaurantTimes {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  countdownToOpen?: string | null;
}

export const getRestaurantTimesWithCountdown = (
  restaurant: IRestaurantFetched
): RestaurantTimes => {

  if (!restaurant.schedule || restaurant.schedule.length === 0) {
    return { isOpen: false, countdownToOpen: null };
  }

  const now = new Date();
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = daysOfWeek[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = restaurant.schedule.find((s) => s.day === currentDay);
  if (
    !todaySchedule ||
    todaySchedule.isClosed ||
    !todaySchedule.openTime ||
    !todaySchedule.closeTime
  ) {
    return {
      isOpen: false,
      openTime: undefined,
      closeTime: undefined,
      countdownToOpen: null,
    };
  }

  const [openH, openM] = todaySchedule.openTime.split(":").map(Number);
  const [closeH, closeM] = todaySchedule.closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isRestaurantOpen =
    currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  // Calculate countdown if the restaurant is closed and within 1 hour of opening
  let countdownToOpen: string | null = null;
  if (!isRestaurantOpen && currentMinutes < openMinutes) {
    const minutesUntilOpen = openMinutes - currentMinutes;
    if (minutesUntilOpen <= 60) {
      // Within 1 hour
      const hours = Math.floor(minutesUntilOpen / 60);
      const minutes = minutesUntilOpen % 60;
      const seconds = 60 - now.getSeconds(); // Remaining seconds in the current minute
      countdownToOpen = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
  }

  return {
    isOpen: isRestaurantOpen,
    openTime: todaySchedule.openTime,
    closeTime: todaySchedule.closeTime,
    countdownToOpen,
  };
};
