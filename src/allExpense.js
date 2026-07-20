// Ledger for the expense records. The styling, search, sort, and paging are
// shared with the other ledgers via `./ledgerTable`.

import { useMemo } from "react";
import { useSelector } from "react-redux";
import LedgerTable, { LEDGER_PAGE_SIZE } from "./ledgerTable";

const columns = [
    { key: "Date", header: "Date", date: true, search: true },
    { key: "Description", header: "Description", search: true },
    { key: "Category", header: "Category", badge: true, search: true },
    {
        key: "Qty",
        header: "Qty",
        align: "right",
        numeric: true,
        compare: (a, b) => (Number(b.Qty) || 0) - (Number(a.Qty) || 0)
    },
    {
        // The form POST sends `Unit_Price`; the backend is expected to surface it
        // as `UnitPrice` (or `Unit_Price`). We look up both keys to stay robust.
        key: "UnitPrice",
        header: "Unit Price",
        align: "right",
        currency: true,
        render: (row) => {
            const raw = row ? (row.UnitPrice != null ? row.UnitPrice : row.Unit_Price) : null;
            return `K${Number(raw || 0).toLocaleString()}`;
        }
    },
    {
        key: "Total",
        header: "Total",
        align: "right",
        currency: true,
        compare: (a, b) => (Number(b.Total) || 0) - (Number(a.Total) || 0)
    }
];

const AllExpense = () => {
    const expenses = useSelector((state) => state.expenses.expenses);

    const totals = useMemo(() => {
        const list = Array.isArray(expenses) ? expenses : [];
        let sum = 0;
        let qty = 0;
        for (const e of list) {
            sum += Number(e.Total) || 0;
            qty += Number(e.Qty) || 0;
        }
        return { count: list.length, sum, qty };
    }, [expenses]);

    return (
        <LedgerTable
            rows={expenses}
            title="All Expenses"
            subtitle="Every expense record from the backend"
            searchFields={["Date", "Description", "Category", "_id"]}
            categoryField="Category"
            columns={columns}
            summary={[
                { label: "", value: `${totals.count.toLocaleString()} record${totals.count === 1 ? "" : "s"} - ` },
                { label: "K", value: `${Number(totals.sum).toLocaleString()} total - ` },
                { label: "", value: `${Number(totals.qty).toLocaleString()} units` }
            ]}
        />
    );
};

export default AllExpense;
export { LEDGER_PAGE_SIZE };
