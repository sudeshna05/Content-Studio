// Basic local content calendar helpers. No external services.

function fmtDate(d) {
  // YYYY-MM-DD (local)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Suggest `count` posting dates starting at `startDate`, one per day.
 * V1 keeps it simple: consecutive days. Adjust in the editor per item.
 */
export function suggestDates(startDate, count) {
  const dates = [];
  const base = new Date(startDate);
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(fmtDate(d));
  }
  return dates;
}

/** Items scheduled today or later, sorted ascending — for the "Upcoming" view. */
export function upcoming(items) {
  const today = fmtDate(new Date());
  return items
    .filter((it) => it.scheduledDate && it.scheduledDate >= today)
    .sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime));
}

/** Group items by weekday name for the dashboard's Mon..Sun queue. */
export function byWeekday(items) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const groups = Object.fromEntries(order.map((d) => [d, []]));
  for (const it of items) {
    if (!it.scheduledDate) {
      groups['Monday'].push(it); // unscheduled bucket lands on Monday visually
      continue;
    }
    const d = new Date(it.scheduledDate + 'T00:00:00');
    groups[names[d.getDay()]].push(it);
  }
  return { order, groups };
}
