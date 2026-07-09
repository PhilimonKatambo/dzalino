import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CurrencyTooltip, getCategoryColors } from "./shared";

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

export default function CategoryDonut({ records }) {
  if (!records || records.length === 0) return null;
  const data = aggregateByCategory(records);
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip content={CurrencyTooltip} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }}
        />
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="var(--surface)"
        >
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
