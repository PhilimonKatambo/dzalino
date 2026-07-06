import { formatMonthYear } from "./dataParser";

/**
 * The palette is sourced from CSS custom properties defined in App.css
 * so the charts automatically pick up the active theme (light or dark).
 */
function readPalette() {
  if (typeof window === "undefined") return [];
  const styles = getComputedStyle(document.documentElement);
  const keys = [
    "--chart-1",
    "--chart-2",
    "--chart-3",
    "--chart-4",
    "--chart-5",
    "--chart-6",
    "--chart-7",
    "--chart-8",
  ];
  return keys.map((k) => styles.getPropertyValue(k).trim() || "#69a6bb");
}

export const PALETTE_VARIABLES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export function getCategoryColors(count) {
  const palette = readPalette();
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(palette[i % palette.length] || "#69a6bb");
  }
  return result;
}

export function totalSpend(records) {
  return records.reduce((sum, r) => sum + (r.total || 0), 0);
}

export function averageSpend(records) {
  if (records.length === 0) return 0;
  return totalSpend(records) / records.length;
}

export function medianSpend(records) {
  if (records.length === 0) return 0;
  const values = records.map((r) => r.total).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid];
}

export function maxSpend(records) {
  return records.reduce((m, r) => (r.total > m ? r.total : m), 0);
}

export function minSpend(records) {
  if (records.length === 0) return 0;
  return records.reduce((m, r) => (r.total < m ? r.total : m), records[0].total);
}

export function uniqueDays(records) {
  const set = new Set();
  records.forEach((r) => {
    if (r.date) set.add(r.date.toDateString());
  });
  return set.size;
}

export function uniqueCategories(records) {
  const set = new Set();
  records.forEach((r) => set.add(r.category));
  return set.size;
}

export function byCategory(records) {
  const map = new Map();
  records.forEach((r) => {
    const key = r.category;
    const entry = map.get(key) || { category: key, total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    map.set(key, entry);
  });
  const arr = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const colors = getCategoryColors(arr.length);
  arr.forEach((entry, i) => {
    entry.color = colors[i];
  });
  return arr;
}

export function byMonth(records) {
  const map = new Map();
  records.forEach((r) => {
    if (!r.date) return;
    const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
    const label = formatMonthYear(r.date);
    const entry = map.get(key) || { key, label, date: r.date, total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.values()).sort((a, b) => a.date - b.date);
}

export function byDay(records) {
  const map = new Map();
  records.forEach((r) => {
    if (!r.date) return;
    const key = r.date.toDateString();
    const entry = map.get(key) || { date: r.date, total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.values()).sort((a, b) => a.date - b.date);
}

export function topItems(records, limit = 5) {
  const map = new Map();
  records.forEach((r) => {
    const key = r.description.toLowerCase();
    const entry = map.get(key) || {
      description: r.description,
      total: 0,
      count: 0,
      category: r.category,
    };
    entry.total += r.total;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function totalsByCategoryAndMonth(records, categories) {
  const months = byMonth(records);
  const categoryNames = categories.map((c) => c.category);
  return months.map((month) => {
    const row = { label: month.label, total: month.total };
    categoryNames.forEach((c) => {
      row[c] = 0;
    });
    records
      .filter(
        (r) =>
          r.date &&
          r.date.getFullYear() === month.date.getFullYear() &&
          r.date.getMonth() === month.date.getMonth()
      )
      .forEach((r) => {
        if (row[r.category] != null) row[r.category] += r.total;
      });
    return row;
  });
}

export function dailySpendSeries(records) {
  return byDay(records).map((d) => ({
    label: d.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    total: d.total,
    date: d.date,
  }));
}

export function buildInsights(records) {
  if (records.length === 0) return [];
  const insights = [];
  const catTotals = byCategory(records);
  if (catTotals.length > 0) {
    const top = catTotals[0];
    const share = (top.total / totalSpend(records)) * 100;
    insights.push({
      title: `${top.category} dominates spend`,
      detail: `K${top.total.toLocaleString("en-US")} (${share.toFixed(
        1
      )}% of total) across ${top.count} transactions.`,
    });
  }

  const months = byMonth(records);
  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];
    const delta = last.total - prev.total;
    const pct = prev.total === 0 ? null : (delta / prev.total) * 100;
    const direction = delta >= 0 ? "up" : "down";
    insights.push({
      title: `Monthly trend is ${direction}`,
      detail: `${formatMonthYear(last.date)} spent K${last.total.toLocaleString(
        "en-US"
      )} vs K${prev.total.toLocaleString(
        "en-US"
      )} in ${formatMonthYear(prev.date)} (${pct == null ? "n/a" : `${pct.toFixed(1)}%`}).`,
    });
  }

  const top = topItems(records, 1)[0];
  if (top) {
    insights.push({
      title: `Top item: ${top.description}`,
      detail: `K${top.total.toLocaleString("en-US")} across ${top.count} transaction(s) in category ${top.category}.`,
    });
  }

  const avg = averageSpend(records);
  insights.push({
    title: "Average ticket size",
    detail: `K${Math.round(avg).toLocaleString("en-US")} per expense across ${records.length} entries.`,
  });

  return insights;
}
