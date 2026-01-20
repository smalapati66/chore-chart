// src/util/week.ts
export function weekStartSundayNoon(now = new Date()): Date {
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun..6=Sat

  const start = new Date(d);
  start.setDate(d.getDate() - day); // go back to Sunday
  start.setHours(12, 0, 0, 0);      // 12:00 PM

  // If it's Sunday before noon, week start is last Sunday noon
  if (day === 0 && d.getTime() < start.getTime()) {
    start.setDate(start.getDate() - 7);
  }
  return start;
}

export function nextSundayNoon(now = new Date()): Date {
  const d = new Date(now);
  const day = d.getDay();

  const next = new Date(d);
  next.setDate(d.getDate() + ((7 - day) % 7)); // next Sunday (today if Sunday)
  next.setHours(12, 0, 0, 0);

  // If already past Sunday's noon today, jump to next week's Sunday noon
  if (day === 0 && d.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 7);
  }
  return next;
}

export function msUntilNextSundayNoon(now = new Date()): number {
  return nextSundayNoon(now).getTime() - now.getTime();
}

