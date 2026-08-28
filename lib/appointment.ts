export const appointmentSlots = [
  "29 Aug · 11:20 AM",
  "30 Aug · 10:00 AM",
  "31 Aug · 02:30 PM",
  "01 Sep · 11:20 AM",
  "02 Sep · 04:15 PM",
] as const;

export function appointmentParts(slot?: string) {
  const value = slot || "29 Aug · 11:20 AM";
  const parts = value.split("·").map((s) => s.trim());
  const datePart = parts[0] || "29 Aug";
  const timePart = parts[1] || "11:20 AM";

  const cleanDate = datePart.includes("2026") ? datePart : `${datePart} 2026`;

  return {
    value,
    day: datePart.split(" ")[0] || "29",
    month: datePart.split(" ")[1] || "Aug",
    time: timePart,
    dayName: "Scheduled Day",
    longDate: `${cleanDate} at ${timePart}`,
    timelineDate: cleanDate,
  };
}
