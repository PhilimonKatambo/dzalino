import { useState } from "react";
import { useDispatch } from "react-redux";
import { authedPost } from "../auth/authedRequest";
import { fetchDrums } from "../expenseSlice";
import "./expenseInput.css";

const DEFAULT_FORM = {
    date: "",
    qty: "",
};

const DrumsInput = () => {
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
        if (!Number.isFinite(qty) || qty <= 0)
            return setError("Qty must be a positive number");

        const payload = {
            Date: form.date,
            Qty: qty,
        };

        setSubmitting(true);

        try {
            // Axios-based so the JWT interceptor attaches the Bearer token.
            const result = await authedPost(
                `${process.env.REACT_APP_BACKEND_URI}/drums/insert`,
                payload
            );
            if (!result.ok) {
                throw new Error(result.error || "Failed to save");
            }

            resetForm();
            setFeedback("Record Saved!");
            // Refresh the Redux cache for the "drums" table.
            dispatch(fetchDrums());

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
                    <div className="eiTitle">Add drums given</div>
                    <div className="eiSubtitle">Record drums of ethanol given.</div>
                </div>
                <button className="eiToggle" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close" : "+ New Drums"}
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

export default DrumsInput;
