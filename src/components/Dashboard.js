import React, { useEffect, useState } from "react";
import KpiCards from "./KpiCards";
import Insights from "./Insights";
import ExpenseTable from "./ExpenseTable";
import {
  CategoryBarChart,
  CategoryDonut,
  CategoryShareStackedChart,
  DailySpendChart,
  MonthlyTrendChart,
} from "./charts";
import { loadExpensesWorkbook, parseExpenseRows } from "../utils/dataParser";

function buildSummary(records) {
  if (records.length === 0) return null;
  let total = 0;
  const totals = [];
  const monthSet = new Map();
  const daySet = new Set();
  const categorySet = new Set();
  records.forEach((r) => {
    total += r.total;
    totals.push(r.total);
    if (r.date) {
      daySet.add(r.date.toDateString());
      const y = r.date.getFullYear();
      const m = String(r.date.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      const entry = monthSet.get(key) || { date: r.date, total: 0 };
      entry.total += r.total;
      monthSet.set(key, entry);
    }
    categorySet.add(r.category);
  });

  const months = Array.from(monthSet.values()).sort((a, b) => a.date - b.date);
  const first = months[0]?.date;
  const last = months[months.length - 1]?.date;
  const sorted = [...totals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length === 0
    ? 0
    : sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  const max = totals.reduce((m, v) => (v > m ? v : m), 0);
  const min = totals.reduce((m, v) => (v < m ? v : m), totals[0] || 0);
  const avg = totals.length === 0 ? 0 : total / totals.length;

  return {
    total,
    count: records.length,
    avg,
    median,
    max,
    min,
    days: daySet.size,
    categories: categorySet.size,
    first,
    last,
  };
}

function buildInsights(records) {
  if (records.length === 0) return [];
  const insights = [];

  const categoryMap = new Map();
  records.forEach((r) => {
    const entry = categoryMap.get(r.category) || { category: r.category, total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    categoryMap.set(r.category, entry);
  });
  const catTotals = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  const totalAll = records.reduce((sum, r) => sum + r.total, 0);
  if (catTotals.length > 0) {
    const top = catTotals[0];
    const share = (top.total / totalAll) * 100;
    insights.push({
      title: `${top.category} dominates spend`,
      detail: `K${top.total.toLocaleString("en-US")} (${share.toFixed(1)}% of total) across ${top.count} transactions.`,
    });
  }

  const monthMap = new Map();
  records.forEach((r) => {
    if (!r.date) return;
    const y = r.date.getFullYear();
    const m = String(r.date.getMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;
    const entry = monthMap.get(key) || { date: r.date, total: 0 };
    entry.total += r.total;
    monthMap.set(key, entry);
  });
  const months = Array.from(monthMap.values()).sort((a, b) => a.date - b.date);
  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];
    const delta = last.total - prev.total;
    const pct = prev.total === 0 ? null : (delta / prev.total) * 100;
    const direction = delta >= 0 ? "up" : "down";
    insights.push({
      title: `Monthly trend is ${direction}`,
      detail: `K${last.total.toLocaleString("en-US")} vs K${prev.total.toLocaleString("en-US")} (${pct == null ? "n/a" : `${pct.toFixed(1)}%`}).`,
    });
  }

  const itemMap = new Map();
  records.forEach((r) => {
    const key = r.description.toLowerCase();
    const entry = itemMap.get(key) || { description: r.description, total: 0, count: 0, category: r.category };
    entry.total += r.total;
    entry.count += 1;
    itemMap.set(key, entry);
  });
  const topItem = Array.from(itemMap.values()).sort((a, b) => b.total - a.total)[0];
  if (topItem) {
    insights.push({
      title: `Top item: ${topItem.description}`,
      detail: `K${topItem.total.toLocaleString("en-US")} across ${topItem.count} transaction(s) in category ${topItem.category}.`,
    });
  }

  insights.push({
    title: "Average ticket size",
    detail: `K${Math.round(totalAll / records.length).toLocaleString("en-US")} per expense across ${records.length} entries.`,
  });

  return insights;
}

function buildTopItems(records, limit = 5) {
  const map = new Map();
  records.forEach((r) => {
    const key = r.description.toLowerCase();
    const entry = map.get(key) || { description: r.description, total: 0, count: 0, category: r.category };
    entry.total += r.total;
    entry.count += 1;
    map.set(key, entry);
  });
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await loadExpensesWorkbook();
        if (cancelled) return;
        setRecords(parseExpenseRows(rows));
        setStatus({ loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setStatus({ loading: false, error: err.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.loading) {
    return <div className="state-card">Loading expense data�</div>;
  }
  if (status.error) {
    return (
      <div className="state-card error">
        <h2>We could not read the workbook</h2>
        <p>{status.error}</p>
      </div>
    );
  }
  if (records.length === 0) {
    return <div className="state-card">No expense rows were found.</div>;
  }

  const summary = buildSummary(records);
  const insights = buildInsights(records);
  const topFive = buildTopItems(records, 5);

  const kpis = [
    {
      label: "Total spend",
      formatted: `K${summary.total.toLocaleString("en-US")}`,
      subtitle: `${summary.count} transactions tracked`,
    },
    {
      label: "Average ticket",
      formatted: `K${Math.round(summary.avg).toLocaleString("en-US")}`,
      subtitle: `Median K${Math.round(summary.median).toLocaleString("en-US")}`,
    },
    {
      label: "Largest expense",
      formatted: `K${Math.round(summary.max).toLocaleString("en-US")}`,
      subtitle: `Smallest K${Math.round(summary.min).toLocaleString("en-US")}`,
    },
    {
      label: "Categories",
      formatted: summary.categories.toString(),
      subtitle: `Active on ${summary.days} day${summary.days === 1 ? "" : "s"}`,
    },
    {
      label: "Coverage",
      formatted:
        summary.first && summary.last
          ? `${formatRangeLabel(summary.first)} ? ${formatRangeLabel(summary.last)}`
          : "�",
      subtitle: "Period observed",
    },
  ];

  return (
    <main className="dashboard" id="analytics">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">Dzalino analytics</span>
          <h1>Expense insights, trends and meaning</h1>
          <p className="hero-sub">
            Live interpretation of the DzalinoData.xlsx workbook. Every figure
            below is recomputed from the underlying transactions, surfacing the
            story behind the spend.
          </p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span>Total</span>
            <strong>K{summary.total.toLocaleString("en-US")}</strong>
            <small>Across {summary.count} records</small>
          </div>
          <div className="hero-stat">
            <span>Days covered</span>
            <strong>{summary.days}</strong>
            <small>
              {summary.first && summary.last
                ? `${formatRangeLabel(summary.first)} � ${formatRangeLabel(summary.last)}`
                : "�"}
            </small>
          </div>
          <div className="hero-stat">
            <span>Categories</span>
            <strong>{summary.categories}</strong>
            <small>Distinct cost centres</small>
          </div>
        </div>
      </section>

      <KpiCards kpis={kpis} />

      <section className="chart-grid" id="charts">
        <div className="panel span-2">
          <header className="panel-header">
            <h3>Monthly spend trend</h3>
            <p>Per-category monthly totals with a bold total line on top.</p>
          </header>
          <MonthlyTrendChart records={records} />
        </div>
        <div className="panel">
          <header className="panel-header">
            <h3>Category share</h3>
            <p>Where every Kwacha went.</p>
          </header>
          <CategoryDonut records={records} />
        </div>
        <div className="panel">
          <header className="panel-header">
            <h3>Spend by category</h3>
            <p>Ranked totals per cost centre.</p>
          </header>
          <CategoryBarChart records={records} />
        </div>
        <div className="panel span-2">
          <header className="panel-header">
            <h3>Stacked monthly composition</h3>
            <p>How the mix of categories evolves month over month.</p>
          </header>
          <CategoryShareStackedChart records={records} />
        </div>
        <div className="panel span-2">
          <header className="panel-header">
            <h3>Daily burn rate</h3>
            <p>Spending pattern across the captured days.</p>
          </header>
          <DailySpendChart records={records} />
        </div>
      </section>

      <Insights insights={insights} topItems={topFive} />

      <div id="ledger">
        <ExpenseTable records={records} />
      </div>

      <section className="panel methodology">
        <header className="panel-header">
          <h3>How to read this dashboard</h3>
          <p>
            The workbook <code>DzalinoData.xlsx</code> holds a single sheet,
            <em> expenses_data_ddmmyyyy</em>, with 81 transactions captured
            between late May and mid-June 2026. Every transaction is one
            expense, classified into categories such as <strong>Asset</strong>,
            <strong> Food</strong>, <strong>Transport</strong>,
            <strong> Labour</strong>, <strong>Expense</strong> and
            <strong> General</strong>. The dashboard normalises each row
            (including dd/mm/yyyy strings and Excel date serials) and
            re-aggregates the values into KPIs, time-series charts, and a
            searchable ledger. Use the filters above the table to drill into a
            particular category or search the description text.
          </p>
        </header>
      </section>
    </main>
  );
}

function formatRangeLabel(date) {
  if (!date) return "�";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
