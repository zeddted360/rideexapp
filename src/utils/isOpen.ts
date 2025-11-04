// utils/isOpen.ts
import { IRestaurantFetched } from "../../types/types";

export const isOpen = (restaurant: IRestaurantFetched): boolean => {
  if (!restaurant.schedule || restaurant.schedule.length === 0) return false;

  const now = new Date();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = daysOfWeek[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = restaurant.schedule.find((s) => s.day === currentDay);
  if (!todaySchedule || todaySchedule.isClosed || !todaySchedule.openTime || !todaySchedule.closeTime) {
    return false;
  }

  const [openH, openM] = todaySchedule.openTime.split(":").map(Number);
  const [closeH, closeM] = todaySchedule.closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};