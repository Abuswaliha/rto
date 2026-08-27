export const appointmentSlots = [
  "29 Aug · 11:20 AM",
  "29 Aug · 2:40 PM",
  "30 Aug · 10:00 AM",
] as const;

export function appointmentParts(slot?: string) {
  const value = slot || appointmentSlots[0];
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+·\s+(.+)$/);
  const day = match?.[1] || "29";
  const month = (match?.[2] || "Aug").toUpperCase();
  const time = match?.[3] || "11:20 AM";
  const dayName = day === "30" ? "SUNDAY" : "SATURDAY";
  return {
    value,
    day,
    month,
    time,
    dayName,
    longDate: `${day} August 2026 · ${time}`,
    timelineDate: `${day} Aug 2026`,
  };
}
