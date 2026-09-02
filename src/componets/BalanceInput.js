import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { authedPost } from "../auth/authedRequest";
import "./BalanceInput.css";

const DEFAULT_FORM = {
    date: "",
    amount: "",
    qty: "",
    debtor: "",
    witness: "",
    location: "",
    paidAmount: "",
};

const BalanceInput = () => {
    const dispatch = useDispatch();
    const [form, setForm] = useState(DEFAULT_FORM);
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.date) return setError("Date is required");
        if (!form.debtor.trim()) return setError("Debtor is required");
        if (!form.witness.trim()) return setError("Witness is required");
        if (!form.location.trim()) return setError("Location is required");
        
        const amountNum = parseFloat(form.amount);
        if (isNaN(amountNum) || amountNum < 0) return setError("Amount must be a positive number");
        
        const qtyNum = parseInt(form.qty, 10);
        if (isNaN(qtyNum) || qtyNum < 0) return setError("Qty must be a positive number");
        
        const paidAmountNum = parseFloat(form.paidAmount);
        if (isNaN(paidAmountNum) || paidAmountNum < 0) return setError("Paid amount must be a positive number");

        const payload = {
            Date: form.date,
            Amount: amountNum,
            Qty: qtyNum,
            Debtor: form.debtor.trim(),
            Witness: form.witness.trim(),
            Location: form.location.trim(),
            PaidAmount: paidAmountNum,
        };

        setSubmitting(true);
        try {
            const result = await authedPost(
                `${process.env.REACT_APP_BACKEND_URI}/balance/insert`,
                payload
            );

            if (!result.ok) {
                throw new Error(result.error || "Failed to save balance entry");
            }

            resetForm();
            setFeedback("Balance entry saved!");
            setTimeout(() => setFeedback(""), 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div id="expenseInput">
            <div className="eiHeader">
                <div>
                    <div className="eiTitle">Add Balance Pay</div>
                    <div className="eiSubtitle">
                        Record balance payments and debts
                    </div>
                </div>
                <button className="eiToggle" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close" : "+ New Balance"}
                </button>
            </div>

            {showForm && (
                <form className="eiForm" onSubmit={handleSubmit}>
                    <div className="eiGrid">
                        <div className="eiField">
                            <label htmlFor="biDate">Date</label>
                            <input
                                id="biDate"
                                type="date"
                                value={form.date}
                                onChange={handleChange("date")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="biAmount">Amount</label>
                            <input
                                id="biAmount"
                                type="number"
                                step="0.01"
                                placeholder="Amount"
                                value={form.amount}
                                onChange={handleChange("amount")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="biQty">Quantity</label>
                            <input
                                id="biQty"
                                type="number"
                                placeholder="Qty"
                                value={form.qty}
                                onChange={handleChange("qty")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="biDebtor">Debtor</label>
                            <input
                                id="biDebtor"
                                type="text"
                                placeholder="Debtor Name"
                                value={form.debtor}
                                onChange={handleChange("debtor")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="biWitness">Witness</label>
                            <input
                                id="biWitness"
                                type="text"
                                placeholder="Witness Name"
                                value={form.witness}
                                onChange={handleChange("witness")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="biLocation">Location</label>
                            <input
                                id="biLocation"
                                type="text"
                                placeholder="Location"
                                value={form.location}
                                onChange={handleChange("location")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="biPaid">Paid Amount</label>
                            <input
                                id="biPaid"
                                type="number"
                                step="0.01"
                                placeholder="Paid Amount"
                                value={form.paidAmount}
                                onChange={handleChange("paidAmount")}
                            />
                        </div>

                        <button
                            className="eiBtn eiBtnPrimary"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save Balance"}
                        </button>

                        {error && <p style={{ color: "red" }}>{error}</p>}
                        {feedback !== "" && (
                            <p style={{ color: "green" }}>{feedback}</p>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};

export default BalanceInput;
