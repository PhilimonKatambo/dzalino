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
                {subtitle != null && <div className="aeSubtitle">{subtitle}</div>}
                {headerSummary && <div className="aeSubtitle">{headerSummary}</div>}
            </div>

            <div className="aeControls">
                <div className="aeField aeFieldSearch">
                    <label htmlFor={`lt-search-${slug(title)}`}>Search</label>
                    <input
                        id={`lt-search-${slug(title)}`}
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {showCategoryFilter && (
                    <div className="aeField">
                        <label htmlFor={`lt-cat-${slug(title)}`}>Category</label>
                        <select
                            id={`lt-cat-${slug(title)}`}
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
                    <label htmlFor={`lt-sort-${slug(title)}`}>Sort by</label>
                    <select
                        id={`lt-sort-${slug(title)}`}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="aeTableWrap">
                <table className="aeTable">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className={col.align === "right" ? "aeNum" : undefined}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="aeEmpty">
                                    No records match your filters.
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((row, i) => (
                                <tr key={row._id || `${pageStart}-${i}`}>
                                    {columns.map((col) => (
                                        <td key={col.key} className={col.align === "right" ? "aeNum" : undefined}>
                                            {renderCell(row, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="aePager">
                <div className="aePagerInfo">
                    Showing {pageRows.length === 0 ? 0 : pageStart + 1}-{pageStart + pageRows.length} of {sorted.length.toLocaleString()}
                </div>
                <div className="aePagerButtons">
                    <button type="button" className="aeBtn" onClick={() => setPage(1)} disabled={safePage <= 1}>First</button>
                    <button type="button" className="aeBtn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>Prev</button>
                    <span className="aePagerPage">Page {safePage} of {totalPages}</span>
                    <button type="button" className="aeBtn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>Next</button>
                    <button type="button" className="aeBtn" onClick={() => setPage(totalPages)} disabled={safePage >= totalPages}>Last</button>
                </div>
            </div>
        </div>
    );
};

export default LedgerTable;

const renderCell = (row, col) => {
    if (typeof col.render === "function") {
        const out = col.render(row);
        if (out == null) return "-";
        return out;
    }
    const raw = row[col.key];
    if (raw == null || raw === "") return "-";
    if (col.date) return formatDateCell(raw);
    if (col.currency) return `K${Number(raw || 0).toLocaleString()}`;
    if (col.numeric) return Number(raw || 0).toLocaleString();
    if (col.badge) return <span className="aeBadge">{String(raw)}</span>;
    return String(raw);
};

const compareRows = (a, b, sortBy, columns) => {
    const col = columns.find((c) => c.key === sortBy);
    if (col && typeof col.compare === "function") {
        return col.compare(a, b);
    }
    if (sortBy === "date_asc" || sortBy === "date_desc") {
        const da = parseDateSafe(a.Date);
        const db = parseDateSafe(b.Date);
        return sortBy === "date_asc" ? compareDate(da, db) : compareDate(db, da);
    }
    if (sortBy === "amount_asc" || sortBy === "amount_desc") {
        const ta = Number(a.Total) || 0;
        const tb = Number(b.Total) || 0;
        return sortBy === "amount_asc" ? ta - tb : tb - ta;
    }
    if (sortBy === "qty_asc" || sortBy === "qty_desc") {
        const qa = Number(a.Qty) || 0;
        const qb = Number(b.Qty) || 0;
        return sortBy === "qty_asc" ? qa - qb : qb - qa;
    }
    if (sortBy === "category_asc" || sortBy === "category_desc") {
        const ca = String(a.Category || "");
        const cb = String(b.Category || "");
        return sortBy === "category_asc" ? ca.localeCompare(cb) : cb.localeCompare(ca);
    }
    if (sortBy === "description_asc" || sortBy === "description_desc") {
        const na = String(a.Description || "");
        const nb = String(b.Description || "");
        return sortBy === "description_asc" ? na.localeCompare(nb) : nb.localeCompare(na);
    }
    return 0;
};

const compareDate = (a, b) => {
    if (a && b) return a - b;
    if (a) return -1;
    if (b) return 1;
    return 0;
};

const parseDateSafe = (raw) => {
    if (raw == null) return null;
    if (raw instanceof Date) {
        return isNaN(raw.getTime()) ? null : raw;
    }
    if (typeof raw === "number") {
        const utcDays = Math.floor(raw - 25569);
        const d = new Date(utcDays * 86400 * 1000);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof raw === "string") {
        const s = raw.trim();
        if (!s) return null;
        const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
        if (dmy) {
            const day = Number(dmy[1]);
            const month = Number(dmy[2]);
            let year = Number(dmy[3]);
            if (year < 100) year += 2000;
            const d = new Date(year, month - 1, day);
            return isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
};

const formatDateCell = (raw) => {
    const d = parseDateSafe(raw);
    if (!d) return raw == null ? "-" : String(raw);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
};

const slug = (s) => String(s || "ledger").toLowerCase().replace(/[^a-z0-9]+/g, "-");