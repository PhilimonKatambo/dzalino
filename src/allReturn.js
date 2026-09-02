import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LedgerTable, { LEDGER_PAGE_SIZE } from "./ledgerTable";
import { authedPost } from "./auth/authedRequest";
import { fetchReturns } from "./expenseSlice";

const columns = [
    { key: "Date", header: "Date", date: true, search: true },
    { key: "Receiver", header: "Receiver", search: true },
    { key: "Category", header: "Category", badge: true, search: true },
    {
        key: "Qty",
        header: "Initial Qty",
        align: "right",
        numeric: true,
        compare: (a, b) => (Number(b.Qty) || 0) - (Number(a.Qty) || 0)
    },
    { 
        key: "ReturnTaken", 
        header: "Total Taken", 
        align: "right", 
        numeric: true 
    },
    { 
        key: "Remaining", 
        header: "Remaining", 
        align: "right", 
        numeric: true,
        render: (row) => {
            const total = Number(row.Qty) || 0;
            const taken = Number(row.ReturnTaken) || 0;
            return (total - taken).toLocaleString();
        }
    },
    { key: "Store", header: "Store", search: true },
    { 
        key: "State", 
        header: "Status", 
        search: true,
        render: (row) => <span className="aeBadge">{row.State}</span>
    },
];

const AllReturns = () => {
    const dispatch = useDispatch();
    const returns = useSelector((state) => state.expenses.returns);
    
    const [takeDialog, setTakeDialog] = useState({
        isOpen: false,
        rowId: null,
        amount: ""
    });

    const handleStatusChange = async (id, newState) => {
        if (newState === "Taken") {
            setTakeDialog({ isOpen: true, rowId: id, amount: "" });
        } else {
            await updateReturnData(id, { State: newState });
        }
    };

    const updateReturnData = async (id, payload) => {
        try {
            const result = await authedPost(
                `${process.env.REACT_APP_BACKEND_URI}/returncls/updatedata`,
                { _id: id, ...payload }
            );
            if (!result.ok) {
                alert(`Error updating: ${result.error}`);
            } else {
                dispatch(fetchReturns());
            }
        } catch (err) {
            alert(`Network error: ${err.message}`);
        }
    };

    const confirmTake = async () => {
        const qty = Number(takeDialog.amount);
        if (isNaN(qty) || qty <= 0) {
            alert("Please enter a valid positive number");
            return;
        }

        await updateReturnData(takeDialog.rowId, { 
            State: "Taken", 
            ReturnTakenIncrement: qty 
        });
        
        setTakeDialog({ isOpen: false, rowId: null, amount: "" });
    };

    const tableColumns = [...columns, {
        key: "Action",
        header: "Change Status",
        align: "right",
        render: (row) => (
            <select 
                className="aeStatusSelect"
                value={row.State} 
                onChange={(e) => handleStatusChange(row._id, e.target.value)}
            >
                <option value="Stored">Stored</option>
                <option value="Taken">Taken</option>
            </select>
        )
    }];

    const totals = useMemo(() => {
        const list = Array.isArray(returns) ? returns : [];
        let qty = 0;
        for (const r of list) {
            qty += Number(r.Qty) || 0;
        }
        return { count: list.length, qty };
    }, [returns]);

    return (
        <>
            <LedgerTable
                rows={returns}
                title="All Returns"
                subtitle="Records of cls returned from sales trips"
                searchFields={["Date", "Receiver", "Category", "_id"]}
                categoryField="Category"
                columns={tableColumns}
                summary={[
                    { label: "", value: `${totals.count.toLocaleString()} record${totals.count === 1 ? "" : "s"} - ` },
                    { label: "", value: `${Number(totals.qty).toLocaleString()} units total` }
                ]}
            />

            {takeDialog.isOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)", display: "flex", 
                    justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "#253030", padding: "20px", borderRadius: "8px",
                        border: "1px solid #69a6bb", color: "#f4f6e5", minWidth: "300px"
                    }}>
                        <h3 style={{ marginTop: 0, color: "#69a6bb" }}>Record Daily Taking</h3>
                        <p style={{ fontSize: "0.8rem", color: "#98a087", marginBottom: "15px" }}>
                            Enter the quantity taken today. This will be added to the total taken.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <input 
                                type="number" 
                                value={takeDialog.amount}
                                onChange={(e) => setTakeDialog({...takeDialog, amount: e.target.value})}
                                placeholder="Quantity to add"
                                style={{
                                    padding: "10px", background: "#1f2a2b", color: "#f4f6e5",
                                    border: "1px solid #3a4a4f", borderRadius: "4px"
                                }}
                                autoFocus
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button 
                                    onClick={() => setTakeDialog({ ...takeDialog, isOpen: false })}
                                    className="aeBtn"
                                >Cancel</button>
                                <button 
                                    onClick={confirmTake}
                                    className="aeBtn" 
                                    style={{ borderColor: "#69a6bb", color: "#69a6bb" }}
                                >Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllReturns;
