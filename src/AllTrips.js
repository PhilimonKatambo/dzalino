// Ledger for the trip records. The styling, search, sort, and paging are
// shared with the other ledgers via ./ledgerTable.

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import LedgerTable, { LEDGER_PAGE_SIZE } from "./ledgerTable";
import { authedPost } from "./auth/authedRequest";
import { fetchTrips } from "./expenseSlice";

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
    },
    { 
        key: "Status", 
        header: "Status", 
        search: true,
        render: (row) => <span className="aeBadge">{row.Status || "Away"}</span>
    }
];

const AllTrips = () => {
    const dispatch = useDispatch();
    const trips = useSelector((state) => state.expenses.trips);

    const handleStatusChange = async (id, newState) => {
        try {
            const result = await authedPost(
                `${process.env.REACT_APP_BACKEND_URI}/trip/updatedata`,
                { _id: id, Status: newState }
            );
            if (!result.ok) {
                alert(`Error updating status: ${result.error}`);
            } else {
                dispatch(fetchTrips());
            }
        } catch (err) {
            alert(`Network error: ${err.message}`);
        }
    };

    const tableColumns = [...columns, {
        key: "Action",
        header: "Change Status",
        align: "right",
        render: (row) => (
            <select 
                className="aeStatusSelect"
                value={row.Status || "Away"} 
                onChange={(e) => handleStatusChange(row._id, e.target.value)}
            >
                <option value="Away">Away</option>
                <option value="Returned">Returned</option>
            </select>
        )
    }];

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
            columns={tableColumns}
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
