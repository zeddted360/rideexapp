export function generateTimeSlots() {
  const slots = [];
  const now = new Date();
  slots.push({ id: "now", label: "Now", start: now, end: null });
  let start = new Date(now.getTime());
  for (let i = 0; i < 4; i++) {
    const end = new Date(start.getTime() + 45 * 60000);
    slots.push({
      id: `${i + 1}`,
      label: `${start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      start: new Date(start),
      end: new Date(end),
    });
    start = end;
  }
  return slots;
}

export function formatDeliveryTime(date: Date) {
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
} 

export const getDeliveryTimeLabel = (
  deliveryDay: "today" | "tomorrow",
  selectedTimeSlot: string,
  timeSlots: any
) => {
  if (deliveryDay === "tomorrow") {
    return "Tomorrow";
  }

  if (selectedTimeSlot === "now") {
    return "Now";
  }

  // Find the selected time slot label
  const selectedSlot = timeSlots.find(
    (slot: any) => slot.id === selectedTimeSlot
  );
  if (selectedSlot?.label) {
    return selectedSlot.label; // e.g. "12:22 - 12:44"
  }

  // Fallback (shouldn't happen)
  return "ASAP";
};