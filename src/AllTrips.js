// Ledger for the trip records. The styling, search, sort, and paging are
// shared with the other ledgers via ./ledgerTable.

import { useMemo } from "react";
import { useSelector } from "react-redux";
import LedgerTable, { LEDGER_PAGE_SIZE } from "./ledgerTable";

const columns = [
    { key: "Date", header: "Date", date: true, search: true },
    { key: "Taker", header: "Taker", search: true },
    { key: "RoadLocation", header: "Road Location", search: true },
    {
        key: "NipsQty",
        header: "Nips Qty",
        align: "right",
        numeric: true,
        compare: (a, b) => (Number(b.NipsQty) || 0) - (Number(a.NipsQty) || 0)
    },
    {
        key: "BigsPapersQty",
        header: "Bigs Papers Qty",
        align: "right",
        numeric: true,
        compare: (a, b) => (Number(b.BigsPapersQty) || 0) - (Number(a.BigsPapersQty) || 0)
    },
    {
        key: "BigsClsQty",
        header: "Bigs Cls Qty",
        align: "right",
        numeric: true,
        compare: (a, b) => (Number(b.BigsClsQty) || 0) - (Number(a.BigsClsQty) || 0)
    }
];

const AllTrips = () => {
    const trips = useSelector((state) => state.expenses.trips); // assuming we added trips to expense slice

    const totals = useMemo(() => {
        const list = Array.isArray(trips) ? trips : [];
        let sumNips = 0;
        let sumPapers = 0;
        let sumCls = 0;
        for (const t of list) {
            sumNips += Number(t.NipsQty) || 0;
            sumPapers += Number(t.BigsPapersQty) || 0;
            sumCls += Number(t.BigsClsQty) || 0;
        }
        return {
            count: list.length,
            sumNips,
            sumPapers,
            sumCls
        };
    }, [trips]);

    return (
        <LedgerTable
            rows={trips}
            title="All Trips"
            subtitle="Every trip record from the backend"
            searchFields={["Date", "Taker", "RoadLocation", "_id"]}
            categoryField="Taker"
            columns={columns}
            summary={[
                { label: "", value: `${totals.count.toLocaleString()} record${totals.count === 1 ? "" : "s"} - ` },
                { label: "", value: `${totals.sumNips.toLocaleString()} total nips - ` },
                { label: "", value: `${totals.sumPapers.toLocaleString()} total papers - ` },
                { label: "", value: `${totals.sumCls.toLocaleString()} total cls` }
            ]}
        />
    );
};

export default AllTrips;
export { LEDGER_PAGE_SIZE };

