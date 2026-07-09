import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CurrencyTooltip, chartMargin, getCategoryColors, yAxisFormatter } from "./shared";

function aggregateByCategory(records) {
  const map = new Map();
  records.forEach((r) => {
    const entry = map.get(r.category) || { category: r.category, total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    map.set(r.category, entry);
  });
  const arr = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const colors = getCategoryColors(arr.length);
  arr.forEach((entry, i) => {
    entry.color = colors[i];
  });
  return arr;
}

export default function CategoryBarChart({ records }) {
  if (!records || records.length === 0) return null;
  const data = aggregateByCategory(records);
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={chartMargin()}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="category" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} tickFormatter={yAxisFormatter} />
        <Tooltip content={CurrencyTooltip} cursor={{ fill: "var(--secondary-soft)" }} />
        <Bar dataKey="total" radius={[8, 8, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
