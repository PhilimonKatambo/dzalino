// Ledger for the "taken" records (c/s sold).

import { useMemo } from "react";
import { useSelector } from "react-redux";
import LedgerTable, { LEDGER_PAGE_SIZE } from "./ledgerTable";

const SORT_OPTIONS = [
    { value: "date_desc", label: "Date - Newest first" },
    { value: "date_asc", label: "Date - Oldest first" },
    { value: "qty_desc", label: "Quantity - Highest first" },
    { value: "qty_asc", label: "Quantity - Lowest first" },
    { value: "category_asc", label: "Category - A to Z" },
    { value: "category_desc", label: "Category - Z to A" },
    { value: "receiver_asc", label: "Receiver - A to Z" },
    { value: "receiver_desc", label: "Receiver - Z to A" }
];

const columns = [
    { key: "Date", header: "Date", date: true, search: true },
    {
        key: "Qty",
        header: "Quantity",
        align: "right",
        numeric: true,
        compare: (a, b) => (Number(b.Qty) || 0) - (Number(a.Qty) || 0)
    },
    { key: "Category", header: "Category", badge: true, search: true },
    { key: "Receiver", header: "Receiver", search: true },
    // {
    //     key: "_id",
    //     header: "ID",
    //     render: (row) => row && row._id ? String(row._id) : "-"
    // }
];

const AllSold = () => {
    const taken = useSelector((state) => state.expenses.taken);

    const { count, qty, byCategory } = useMemo(() => {
        const list = Array.isArray(taken) ? taken : [];
        let qtyTotal = 0;
        const cats = new Map();
        for (const e of list) {
            if (!e) continue;
            const q = Number(e.Qty) || 0;
            qtyTotal += q;
            const cat = e.Category || "Uncategorized";
            cats.set(cat, (cats.get(cat) || 0) + q);
        }
        return { count: list.length, qty: qtyTotal, byCategory: cats };
    }, [taken]);

    const categoryBreakdown = useMemo(() => {
        if (!byCategory.size) return "no entries yet";
        return Array.from(byCategory.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, q]) => `${cat}: ${Number(q).toLocaleString()}`)
            .join(" / ");
    }, [byCategory]);

    return (
        <LedgerTable
            rows={taken}
            title="All Sold (c/s)"
            subtitle="Dzalino c/s handed out to customers"
            searchFields={["Date", "Category", "Receiver", "_id"]}
            categoryField="Category"
            columns={columns}
            sortOptions={SORT_OPTIONS}
            summary={[
                { label: "", value: `${count.toLocaleString()} record${count === 1 ? "" : "s"} - ` },
                { label: "", value: `${Number(qty).toLocaleString()} c/s - ` },
                { label: "by category: ", value: categoryBreakdown }
            ]}
        />
    );
};

export default AllSold;
export { LEDGER_PAGE_SIZE };
