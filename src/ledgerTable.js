import { useEffect, useMemo, useState } from "react";
import "./allExpense.css";

export const LEDGER_PAGE_SIZE = 12;
export const PAGE_SIZE = LEDGER_PAGE_SIZE;

const DEFAULT_SORT_OPTIONS = [
    { value: "date_desc", label: "Date - Newest first" },
    { value: "date_asc", label: "Date - Oldest first" },
    { value: "amount_desc", label: "Amount - Highest first" },
    { value: "amount_asc", label: "Amount - Lowest first" },
    { value: "category_asc", label: "Category - A to Z" },
    { value: "category_desc", label: "Category - Z to A" },
    { value: "description_asc", label: "Description - A to Z" },
    { value: "description_desc", label: "Description - Z to A" },
    { value: "qty_desc", label: "Quantity - Highest first" },
    { value: "qty_asc", label: "Quantity - Lowest first" }
];

const LedgerTable = ({
    rows,
    title,
    subtitle,
    searchFields,
    categoryField = "Category",
    columns,
    summary = [],
    showCategoryFilter = true,
    sortOptions = DEFAULT_SORT_OPTIONS
}) => {
    const list = useMemo(
        () => (Array.isArray(rows) ? rows.filter((r) => r != null) : []),
        [rows]
    );

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("date_desc");
    const [page, setPage] = useState(1);

    const categories = useMemo(() => {
        if (!showCategoryFilter) return ["All"];
        const set = new Set();
        list.forEach((e) => {
            const v = e ? e[categoryField] : null;
            if (v) set.add(v);
        });
        return ["All", ...Array.from(set).sort((a, b) => String(a).localeCompare(String(b)))];
    }, [list, categoryField, showCategoryFilter]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const fields = Array.isArray(searchFields) && searchFields.length
            ? searchFields
            : ["Description", "Category", "Date", "_id"];

        return list.filter((e) => {
            if (!e) return false;

            if (showCategoryFilter && category !== "All" && e[categoryField] !== category) {
                return false;
            }

            if (!q) return true;

            return fields.some((f) => {
                const v = e[f];
                return v != null && String(v).toLowerCase().includes(q);
            });
        });
    }, [list, search, category, searchFields, showCategoryFilter, categoryField]);

    const sorted = useMemo(() => {
        const out = filtered.slice();
        out.sort((a, b) => compareRows(a, b, sortBy, columns));
        return out;
    }, [filtered, sortBy, columns]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / LEDGER_PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * LEDGER_PAGE_SIZE;
    const pageRows = sorted.slice(pageStart, pageStart + LEDGER_PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, category, sortBy]);

    const headerSummary = useMemo(() => {
        if (!summary.length) return null;
        return summary
            .map((s) => (s.value == null ? "" : `${s.label}${s.value}`))
            .filter(Boolean)
            .join(" - ");
    }, [summary]);

    return (
        <div id="allExpense" className="ledger">
            <div className="aeHeader">
                <div className="aeTitle">{title}</div>
                {subtitle && <div className="aeSubtitle">{subtitle}</div>}
                {headerSummary && <div className="aeSubtitle">{headerSummary}</div>}
            </div>

            <div className="aeControls">
                <div className="aeField aeFieldSearch">
                    <label>Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {showCategoryFilter && (
                    <div className="aeField">
                        <label>Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="aeField">
                    <label>Sort</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <table className="aeTable">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageRows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length}>No data</td>
                        </tr>
                    ) : (
                        pageRows.map((row, i) => (
                            <tr key={i}>
                                {columns.map((col) => (
                                    <td key={col.key}>{row[col.key]}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="aePager">
                <button onClick={() => setPage(1)} disabled={safePage === 1}>First</button>
                <button onClick={() => setPage(page - 1)} disabled={safePage === 1}>Prev</button>
                <span>{safePage} / {totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={safePage === totalPages}>Next</button>
                <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>Last</button>
            </div>
        </div>
    );
};

export default LedgerTable;

const compareRows = (a, b, sortBy) => {
    if (sortBy === "date_desc") return new Date(b.Date) - new Date(a.Date);
    if (sortBy === "date_asc") return new Date(a.Date) - new Date(b.Date);
    if (sortBy === "amount_desc") return (b.Total || 0) - (a.Total || 0);
    if (sortBy === "amount_asc") return (a.Total || 0) - (b.Total || 0);
    if (sortBy === "qty_desc") return (b.Qty || 0) - (a.Qty || 0);
    if (sortBy === "qty_asc") return (a.Qty || 0) - (b.Qty || 0);
    return 0;
};