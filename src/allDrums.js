// Ledger for the drums-given records.

import { useMemo } from "react";
import { useSelector } from "react-redux";
import LedgerTable, { LEDGER_PAGE_SIZE } from "./ledgerTable";

const SORT_OPTIONS = [
    { value: "date_desc", label: "Date - Newest first" },
    { value: "date_asc", label: "Date - Oldest first" },
    { value: "qty_desc", label: "Quantity - Highest first" },
    { value: "qty_asc", label: "Quantity - Lowest first" }
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
    // {
    //     key: "_id",
    //     header: "ID",
    //     render: (row) => row && row._id ? String(row._id) : "-"
    // }
];

const AllDrums = () => {
    const drums = useSelector((state) => state.expenses.drums);

    const { count, qty, firstDate, lastDate } = useMemo(() => {
        const list = Array.isArray(drums) ? drums : [];
        let qtyTotal = 0;
        let first = null;
        let last = null;
        for (const e of list) {
            if (!e) continue;
            qtyTotal += Number(e.Qty) || 0;
            const d = e.Date ? new Date(e.Date) : null;
            if (d && !isNaN(d.getTime())) {
                if (!first || d < first) first = d;
                if (!last || d > last) last = d;
            }
        }
        return { count: list.length, qty: qtyTotal, firstDate: first, lastDate: last };
    }, [drums]);

    const rangeLabel = useMemo(() => {
        if (!firstDate || !lastDate) return "no dated entries yet";
        const fmt = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        return `${fmt(firstDate)} - ${fmt(lastDate)}`;
    }, [firstDate, lastDate]);

    return (
        <LedgerTable
            rows={drums}
            title="All Drums Given"
            subtitle="Drums of ethanol handed out"
            searchFields={["Date", "_id"]}
            categoryField="Category"
            showCategoryFilter={false}
            columns={columns}
            sortOptions={SORT_OPTIONS}
            summary={[
                { label: "", value: `${count.toLocaleString()} record${count === 1 ? "" : "s"} - ` },
                { label: "", value: `${Number(qty).toLocaleString()} drums - ` },
                { label: "range: ", value: rangeLabel }
            ]}
        />
    );
};

export default AllDrums;
export { LEDGER_PAGE_SIZE };
