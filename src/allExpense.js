import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "./allExpense.css";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
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

const AllExpense = () => {
    const expenses = useSelector((state) => state.expenses.expenses);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("date_desc");
    const [page, setPage] = useState(1);

    const list = useMemo(() => (Array.isArray(expenses) ? expenses : []), [expenses]);

    const categories = useMemo(() => {
        const set = new Set();
        list.forEach((e) => {
            if (e && e.Category) set.add(e.Category);
        });
        return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [list]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return list.filter((e) => {
            if (!e) return false;
            if (category !== "All" && e.Category !== category) return false;
            if (!q) return true;
            const desc = String(e.Description || "").toLowerCase();
            const cat = String(e.Category || "").toLowerCase();
            const date = String(e.Date || "").toLowerCase();
            const id = String(e._id || "").toLowerCase();
            return desc.includes(q) || cat.includes(q) || date.includes(q) || id.includes(q);
        });
    }, [list, search, category]);

    const sorted = useMemo(() => {
        const out = filtered.slice();
        out.sort((a, b) => compareExpenses(a, b, sortBy));
        return out;
    }, [filtered, sortBy]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * PAGE_SIZE;
    const pageRows = sorted.slice(pageStart, pageStart + PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, category, sortBy]);

    const totals = useMemo(() => {
        let count = sorted.length;
        let sum = 0;
        let qty = 0;
        for (const e of sorted) {
            sum += Number(e.Total) || 0;
            qty += Number(e.Qty) || 0;
        }
        return { count, sum, qty };
    }, [sorted]);

    return (
        <div id="allExpense">
            <div className="aeHeader">
                <div className="aeTitle">All Expenses</div>
                <div className="aeSubtitle">
                    {totals.count.toLocaleString()} record{totals.count === 1 ? "" : "s"} -
                    {" "}K{Number(totals.sum).toLocaleString()} total -
                    {" "}{Number(totals.qty).toLocaleString()} units
                </div>
            </div>

            <div className="aeControls">
                <div className="aeField aeFieldSearch">
                    <label htmlFor="aeSearch">Search</label>
                    <input
                        id="aeSearch"
                        type="text"
                        placeholder="Search description, category, date..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="aeField">
                    <label htmlFor="aeCategory">Category</label>
                    <select
                        id="aeCategory"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="aeField">
                    <label htmlFor="aeSort">Sort by</label>
                    <select
                        id="aeSort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="aeTableWrap">
                <table className="aeTable">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th className="aeNum">Qty</th>
                            <th className="aeNum">Unit Price</th>
                            <th className="aeNum">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="aeEmpty">No expenses match your filters.</td>
                            </tr>
                        ) : (
                            pageRows.map((e, i) => (
                                <tr key={e._id || `${pageStart + i}`}>
                                    <td>{formatDateCell(e.Date)}</td>
                                    <td>{e.Description || "-"}</td>
                                    <td>
                                        <span className="aeBadge">{e.Category || "Uncategorized"}</span>
                                    </td>
                                    <td className="aeNum">{Number(e.Qty || 0).toLocaleString()}</td>
                                    <td className="aeNum">K{Number(e["UnitPrice"] || 0).toLocaleString()}</td>
                                    <td className="aeNum aeTotal">K{Number(e.Total || 0).toLocaleString()}</td>
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
                    <button
                        type="button"
                        className="aeBtn"
                        onClick={() => setPage(1)}
                        disabled={safePage <= 1}
                    >
                        First
                    </button>
                    <button
                        type="button"
                        className="aeBtn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                    >
                        Prev
                    </button>
                    <span className="aePagerPage">Page {safePage} of {totalPages}</span>
                    <button
                        type="button"
                        className="aeBtn"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage >= totalPages}
                    >
                        Next
                    </button>
                    <button
                        type="button"
                        className="aeBtn"
                        onClick={() => setPage(totalPages)}
                        disabled={safePage >= totalPages}
                    >
                        Last
                    </button>
                </div>
            </div>
        </div>
    );
};

const compareExpenses = (a, b, sortBy) => {
    const da = parseDateSafe(a.Date);
    const db = parseDateSafe(b.Date);
    const ta = Number(a.Total) || 0;
    const tb = Number(b.Total) || 0;
    const qa = Number(a.Qty) || 0;
    const qb = Number(b.Qty) || 0;
    const ca = String(a.Category || "");
    const cb = String(b.Category || "");
    const na = String(a.Description || "");
    const nb = String(b.Description || "");

    switch (sortBy) {
        case "date_asc": {
            const c = compareDate(da, db);
            return c !== 0 ? c : compareDate(da, db);
        }
        case "amount_desc":
            return tb - ta;
        case "amount_asc":
            return ta - tb;
        case "category_asc":
            return ca.localeCompare(cb) || compareDate(db, da);
        case "category_desc":
            return cb.localeCompare(ca) || compareDate(db, da);
        case "description_asc":
            return na.localeCompare(nb) || compareDate(db, da);
        case "description_desc":
            return nb.localeCompare(na) || compareDate(db, da);
        case "qty_desc":
            return qb - qa;
        case "qty_asc":
            return qa - qb;
        case "date_desc":
        default:
            return compareDate(db, da);
    }
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
        const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
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

export default AllExpense;
