import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CurrencyTooltip, chartMargin, yAxisFormatter } from "./shared";

function buildDailySeries(records) {
  const map = new Map();
  records.forEach((r) => {
    if (!r.date) return;
    const key = r.date.toDateString();
    const entry = map.get(key) || { date: r.date, total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.values())
    .sort((a, b) => a.date - b.date)
    .map((d) => ({
      label: d.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      total: d.total,
      date: d.date,
    }));
}

export default function DailySpendChart({ records }) {
  if (!records || records.length === 0) return null;
  const data = buildDailySeries(records);
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={chartMargin()}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" />
        <YAxis {...AXIS_PROPS} tickFormatter={yAxisFormatter} />
        <Tooltip content={CurrencyTooltip} cursor={{ fill: "var(--secondary-soft)" }} />
        <Bar dataKey="total" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
