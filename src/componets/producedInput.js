import { useState } from "react";
import { useDispatch } from "react-redux";
import { authedPost } from "../auth/authedRequest";
import { fetchProduced } from "../expenseSlice";
import "./expenseInput.css";

const DEFAULT_FORM = {
    date: "",
    qty: "",
    category: "Nips",
};

const ProducedInput = () => {
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

        const qty = Number(form.qty);

        if (!form.date) return setError("Date is required");
        if (!form.category) return setError("Category is required");
        if (!Number.isFinite(qty) || qty <= 0)
            return setError("Qty must be a positive number");

        const payload = {
            Date: form.date,
            Qty: qty,
            Category: form.category,
        };

        setSubmitting(true);

        try {
            // Axios-based so the JWT interceptor attaches the Bearer token.
            const result = await authedPost(
                `${process.env.REACT_APP_BACKEND_URI}/dailyProduce/insert`,
                payload
            );
            if (!result.ok) {
                throw new Error(result.error || "Failed to save");
            }

            resetForm();
            setFeedback("Record Saved!");
            // Refresh the Redux cache for the "produced" table.
            dispatch(fetchProduced());

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
                    <div className="eiTitle">Add produced c/s</div>
                    <div className="eiSubtitle">Record number of c/s made.</div>
                </div>
                <button className="eiToggle" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close" : "+ New Produce"}
                </button>
            </div>

            {showForm && (
                <form className="eiForm" onSubmit={handleSubmit}>
                    <div className="eiGrid">
                        <div className="eiField">
                            <label>Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={handleChange("date")}
                            />
                        </div>

                        <div className="eiField">
                            <label>Quantity</label>
                            <input
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
                                <option>Select Category</option>
                                <option value="Nips">Nips</option>
                                <option value="Bigs_papers">Bigs_papers</option>
                                <option value="Bigs_cartons">Bigs_cartons</option>
                            </select>
                        </div>

                        <button
                            className="eiBtn eiBtnPrimary"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save"}
                        </button>

                        {error && <p style={{ color: "red" }}>{error}</p>}
                        {feedback !== "" ? (
                            <p style={{ color: "green" }}>{feedback}</p>
                        ) : null}
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProducedInput;
