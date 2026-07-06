import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: 12,
  color: "var(--text)",
  fontSize: 13,
  padding: "10px 14px",
  boxShadow: "var(--shadow)",
};

const currencyTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={tooltipStyle}>
      {label != null ? (
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      ) : null}
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            color: entry.color || entry.fill,
            display: "flex",
            justifyContent: "space-between",
            gap: 18,
            padding: "2px 0",
          }}
        >
          <span>{entry.name || entry.dataKey}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            K{Math.round(entry.value || 0).toLocaleString("en-US")}
          </span>
        </div>
      ))}
    </div>
  );
};

const AXIS_PROPS = {
  stroke: "var(--text-muted)",
  tick: { fontSize: 12, fill: "var(--text-muted)" },
  tickLine: false,
  axisLine: { stroke: "var(--border-strong)" },
};

export function CategoryDonut({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip content={currencyTooltip} />
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

export function MonthlyTrendChart({ data, categories }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis
          {...AXIS_PROPS}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={currencyTooltip} />
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

export function CategoryBarChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="category" {...AXIS_PROPS} />
        <YAxis
          {...AXIS_PROPS}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={currencyTooltip} cursor={{ fill: "var(--secondary-soft)" }} />
        <Bar dataKey="total" radius={[8, 8, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailySpendChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" />
        <YAxis
          {...AXIS_PROPS}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={currencyTooltip} cursor={{ fill: "var(--secondary-soft)" }} />
        <Bar dataKey="total" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryShareStackedChart({ data, categories }) {
  const series = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        ...Object.fromEntries(
          categories.map((c) => [c.category, row[c.category] || 0])
        ),
      })),
    [data, categories]
  );

  if (!series || series.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis
          {...AXIS_PROPS}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={currencyTooltip} cursor={{ fill: "var(--secondary-soft)" }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }}
          iconType="circle"
        />
        {categories.map((c) => (
          <Bar
            key={c.category}
            dataKey={c.category}
            stackId="spend"
            fill={c.color}
            radius={[6, 6, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
