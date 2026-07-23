import { useState } from "react";
import "./expenseInput.css";

const DEFAULT_FORM = {
    date: "",
    qty: "",
    category: "",
    receiver: ""
};

const TakenInput = () => {
    // const status = useSelector((state) => state.expenses.loading);

    const [form, setForm] = useState(DEFAULT_FORM);
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const qty = Number(form.qty);

        if (!form.date) return setError("Date is required");
        if (!form.category) return setError("Category is required");
        if (!form.receiver) return setError("Receiver is required");
        if (!Number.isFinite(qty) || qty <= 0)
            return setError("Qty must be a positive number");

        const payload = {
            Date: form.date,
            Qty: qty,
            Category: form.category,
            Receiver: form.receiver
        };

        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URI}/taken/insert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save");

            resetForm();
            // setShowForm(false);
            setFeedback("Record Saved!");
            setTimeout(() => {
                setFeedback("");
            }, 1000);

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
                    <div className="eiTitle">Add sold c/s</div>
                    <div className="eiSubtitle">
                        Record a new number of sold to keep the dashboard up to date.
                    </div>
                </div>
                <button className="eiToggle" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close" : "+ New Entry"}
                </button>
            </div>

            {showForm && (
                <form className="eiForm" onSubmit={handleSubmit}>
                    <div className="eiGrid">
                        <div className="eiField">
                            <label htmlFor="eiDate">Date</label>
                            <input
                                id="eiDate"
                                type="date"
                                value={form.date}
                                onChange={handleChange("date")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="eiDate">Quantity</label>
                            <input
                                className="eiField eiFieldWide"
                                type="number"
                                placeholder="Qty"
                                value={form.qty}
                                onChange={handleChange("qty")}
                            />
                        </div>

                        <div className="eiField">
                            <label>Category</label>
                            <select
                                value={form.category}
                                onChange={handleChange("category")}
                            >
                                <option value="Nips">Nips</option>
                                <option value="Bigs_papers">Bigs_papers</option>
                                <option value="Bigs_cartons">Bigs_cartons</option>
                            </select>
                        </div>

                        <div className="eiField">
                            <label htmlFor="eiDate">Receiver</label>
                            <input
                                className="eiField eiFieldWide"
                                type="text"
                                placeholder="Receiver"
                                value={form.receiver}
                                onChange={handleChange("receiver")}
                            />
                        </div>

                        <button
                            className="eiBtn eiBtnPrimary"
                            type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Save"}
                        </button>

                        {error && <p style={{ color: "red" }}>{error}</p>}
                        {feedback !== "" ? <p style={{ color: "green" }}>{feedback}</p> : null}
                    </div>
                </form>
            )}
        </div>
    );
};

export default TakenInput;