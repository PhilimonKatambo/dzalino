export const AXIS_PROPS = {
  stroke: "var(--text-muted)",
  tick: { fontSize: 12, fill: "var(--text-muted)" },
  tickLine: false,
  axisLine: { stroke: "var(--border-strong)" },
};

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: 12,
  color: "var(--text)",
  fontSize: 13,
  padding: "10px 14px",
  boxShadow: "var(--shadow)",
};

export function CurrencyTooltip({ active, payload, label }) {
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
}

export function yAxisFormatter(v) {
  return `${(v / 1000).toFixed(0)}k`;
}

export function chartMargin() {
  return { top: 8, right: 16, left: 0, bottom: 0 };
}

export function getCategoryColors(count) {
  if (typeof window === "undefined") return [];
  const styles = getComputedStyle(document.documentElement);
  const keys = [
    "--chart-1", "--chart-2", "--chart-3", "--chart-4",
    "--chart-5", "--chart-6", "--chart-7", "--chart-8",
  ];
  const fallback = "#69a6bb";
  const palette = keys.map((k) => styles.getPropertyValue(k).trim() || fallback);
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(palette[i % palette.length]);
  }
  return result;
}
