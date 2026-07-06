import React from "react";
import { formatKwacha } from "../utils/dataParser";

const ACCENTS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-8)",
];

export default function KpiCards({ kpis }) {
  return (
    <div className="kpi-grid">
      {kpis.map((kpi, idx) => (
        <article
          className="kpi-card"
          key={kpi.label}
          style={{
            background: `linear-gradient(140deg, var(--secondary-soft), transparent 70%), var(--surface)`,
          }}
        >
          <span
            className="kpi-label"
            style={{ color: ACCENTS[idx % ACCENTS.length] }}
          >
            {kpi.label}
          </span>
          <strong className="kpi-value">
            {kpi.formatted ?? formatKwacha(kpi.value)}
          </strong>
          {kpi.subtitle ? (
            <span className="kpi-subtitle">{kpi.subtitle}</span>
          ) : null}
        </article>
      ))}
    </div>
  );
}
