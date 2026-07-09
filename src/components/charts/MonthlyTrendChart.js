import React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CurrencyTooltip, chartMargin, getCategoryColors, yAxisFormatter } from "./shared";
import { formatMonthYear } from "../../utils/dataParser";

function groupRecordsByMonth(records) {
  const map = new Map();
  records.forEach((r) => {
    if (!r.date) return;
    const y = r.date.getFullYear();
    const m = String(r.date.getMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;
    const entry = map.get(key) || { key, label: formatMonthYear(r.date), date: r.date, total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.values()).sort((a, b) => a.date - b.date);
}

function listCategories(records) {
  const set = new Set();
  records.forEach((r) => set.add(r.category));
  return Array.from(set);
}

function buildMonthlyMatrix(records, months, categoryNames) {
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

function withCategoryColors(categories) {
  const colors = getCategoryColors(categories.length);
  return categories.map((name, i) => ({ category: name, color: colors[i] }));
}

export default function MonthlyTrendChart({ records }) {
  if (!records || records.length === 0) return null;
  const months = groupRecordsByMonth(records);
  if (months.length === 0) return null;
  const categoryNames = listCategories(records);
  const data = buildMonthlyMatrix(records, months, categoryNames);
  const categories = withCategoryColors(categoryNames);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={chartMargin()}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} tickFormatter={yAxisFormatter} />
        <Tooltip content={CurrencyTooltip} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }}
          iconType="circle"
        />
        {categories.map((c) => (
          <Line
            key={c.category}
            type="monotone"
            dataKey={c.category}
            stroke={c.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
        <Line
          type="monotone"
          dataKey="total"
          name="Total"
          stroke="var(--text)"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
