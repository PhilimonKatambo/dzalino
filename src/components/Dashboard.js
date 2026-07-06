import React, { useEffect, useMemo, useState } from "react";
import KpiCards from "./KpiCards";
import Insights from "./Insights";
import ExpenseTable from "./ExpenseTable";
import {
  CategoryBarChart,
  CategoryDonut,
  CategoryShareStackedChart,
  DailySpendChart,
  MonthlyTrendChart,
} from "./Charts";
import {
  averageSpend,
  buildInsights,
  byCategory,
  dailySpendSeries,
  maxSpend,
  medianSpend,
  minSpend,
  byMonth,
  topItems,
  totalsByCategoryAndMonth,
  totalSpend,
  uniqueCategories,
  uniqueDays,
} from "../utils/analytics";
import {
  formatKwacha,
  formatMonthYear,
  loadExpensesWorkbook,
  parseExpenseRows,
} from "../utils/dataParser";

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

  const summary = useMemo(() => {
    if (records.length === 0) return null;
    const total = totalSpend(records);
    const months = byMonth(records);
    const first = months[0]?.date;
    const last = months[months.length - 1]?.date;
    return {
      total,
      count: records.length,
      avg: averageSpend(records),
      median: medianSpend(records),
      max: maxSpend(records),
      min: minSpend(records),
      days: uniqueDays(records),
      categories: uniqueCategories(records),
      first,
      last,
    };
  }, [records]);

  const categoryData = useMemo(() => byCategory(records), [records]);
  const monthlyData = useMemo(
    () => totalsByCategoryAndMonth(records, categoryData),
    [records, categoryData]
  );
  const dailyData = useMemo(() => dailySpendSeries(records), [records]);
  const topFive = useMemo(() => topItems(records, 5), [records]);
  const insights = useMemo(() => buildInsights(records), [records]);

  if (status.loading) {
    return <div className="state-card">Loading expense data…</div>;
  }
  if (status.error) {
    return (
      <div className="state-card error">
        <h2>We could not read the workbook</h2>
        <p>{status.error}</p>
      </div>
    );
  }
  if (!summary) {
    return <div className="state-card">No expense rows were found.</div>;
  }

  const kpis = [
    {
      label: "Total spend",
      value: summary.total,
      formatted: `K${summary.total.toLocaleString("en-US")}`,
      subtitle: `${summary.count} transactions tracked`,
    },
    {
      label: "Average ticket",
      value: summary.avg,
      formatted: formatKwacha(summary.avg),
      subtitle: `Median ${formatKwacha(summary.median)}`,
    },
    {
      label: "Largest expense",
      value: summary.max,
      formatted: formatKwacha(summary.max),
      subtitle: `Smallest ${formatKwacha(summary.min)}`,
    },
    {
      label: "Categories",
      value: summary.categories,
      formatted: summary.categories.toString(),
      subtitle: `Active on ${summary.days} day${summary.days === 1 ? "" : "s"}`,
    },
    {
      label: "Coverage",
      value: summary.last && summary.first ? summary.last - summary.first : 0,
      formatted:
        summary.first && summary.last
          ? `${formatMonthYear(summary.first)} → ${formatMonthYear(summary.last)}`
          : "—",
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
                ? `${formatMonthYear(summary.first)} – ${formatMonthYear(summary.last)}`
                : "—"}
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
          <MonthlyTrendChart data={monthlyData} categories={categoryData} />
        </div>
        <div className="panel">
          <header className="panel-header">
            <h3>Category share</h3>
            <p>Where every Kwacha went.</p>
          </header>
          <CategoryDonut data={categoryData} />
        </div>
        <div className="panel">
          <header className="panel-header">
            <h3>Spend by category</h3>
            <p>Ranked totals per cost centre.</p>
          </header>
          <CategoryBarChart data={categoryData} />
        </div>
        <div className="panel span-2">
          <header className="panel-header">
            <h3>Stacked monthly composition</h3>
            <p>How the mix of categories evolves month over month.</p>
          </header>
          <CategoryShareStackedChart data={monthlyData} categories={categoryData} />
        </div>
        <div className="panel span-2">
          <header className="panel-header">
            <h3>Daily burn rate</h3>
            <p>Spending pattern across the captured days.</p>
          </header>
          <DailySpendChart data={dailyData} />
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
