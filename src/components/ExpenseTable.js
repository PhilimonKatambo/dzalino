import React, { useMemo, useState } from "react";
import { formatDate } from "../utils/dataParser";

const PAGE_SIZE = 12;

export default function ExpenseTable({ records }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set();
    records.forEach((r) => set.add(r.category));
    return ["All", ...Array.from(set).sort()];
  }, [records]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records
      .filter((r) => (category === "All" ? true : r.category === category))
      .filter((r) => (term ? r.description.toLowerCase().includes(term) : true))
      .sort((a, b) => (b.date?.getTime?.() ?? 0) - (a.date?.getTime?.() ?? 0));
  }, [records, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="table-card">
      <header className="table-header">
        <div>
          <h3>Expense ledger</h3>
          <p className="muted">
            {filtered.length.toLocaleString("en-US")} matching transactions
          </p>
        </div>
        <div className="table-controls">
          <input
            type="search"
            placeholder="Search description…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="num">Qty</th>
              <th className="num">Unit price</th>
              <th className="num">Total (K)</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  No expenses match the current filters.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={`${row.id}-${row.rawDate}`}>
                  <td>{row.id}</td>
                  <td>{formatDate(row.date)}</td>
                  <td>{row.description}</td>
                  <td>
                    <span className="chip">{row.category}</span>
                  </td>
                  <td className="num">{row.quantity.toLocaleString("en-US")}</td>
                  <td className="num">{row.unitPrice.toLocaleString("en-US")}</td>
                  <td className="num strong">
                    {row.total.toLocaleString("en-US")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        <span>
          Page {safePage} of {totalPages}
        </span>
        <div className="pager">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Prev
          </button>
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next ›
          </button>
        </div>
      </footer>
    </div>
  );
}
