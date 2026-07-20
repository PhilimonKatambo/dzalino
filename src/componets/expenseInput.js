import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "./expenseInput.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URI;
const INSERT_URL = `${BACKEND_URL}/insert/data`;

const DEFAULT_FORM = {
    date: "",
    description: "",
    category: "",
    qty: "",
    unitPrice: "",
    total: ""
};

const SUGGESTED_CATEGORIES = [
    "food",
    "transport",
    "labour",
    "asset",
    "rent",
    "office",
    "marketing",
    "maintenance",
    "salaries",
];

const ExpenseInput = () => {
    const status = useSelector((state) => state.expenses.loading);

    const [form, setForm] = useState(DEFAULT_FORM);
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [validationError, setValidationError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const categoryOptions = useMemo(() => {
        return SUGGESTED_CATEGORIES.slice().sort((a, b) => a.localeCompare(b));
    }, []);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "qty" || field === "unitPrice") {
                const qty = Number(field === "qty" ? value : prev.qty);
                const price = Number(field === "unitPrice" ? value : prev.unitPrice);
                if (Number.isFinite(qty) && Number.isFinite(price)) {
                    next.total = (qty * price).toFixed(2);
                } else {
                    next.total = "";
                }
            }
            return next;
        });
    };

    const handleCategorySelect = (cat) => {
        setForm((prev) => ({ ...prev, category: cat }));
    };

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setValidationError("");
        setSubmitError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setValidationError("");
        setSubmitError("");

        const description = form.description.trim();
        const category = form.category.trim();
        const qty = Number(form.qty);
        const unitPrice = Number(form.unitPrice);
        const total = Number(form.total);

        if (!form.date) {
            setValidationError("Please pick a date.");
            return;
        }
        if (!description) {
            setValidationError("Description is required.");
            return;
        }
        if (!category) {
            setValidationError("Please choose or type a category.");
            return;
        }
        if (!Number.isFinite(qty) || qty <= 0) {
            setValidationError("Quantity must be a positive number.");
            return;
        }
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            setValidationError("Unit price must be zero or a positive number.");
            return;
        }
        if (!Number.isFinite(total) || total < 0) {
            setValidationError("Total must be zero or a positive number.");
            return;
        }

        const payload = {
            Date: form.date,
            Description: description,
            Category: category,
            Qty: qty,
            Unit_Price: unitPrice,
            Total: total
        };

        setSubmitting(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/expense/insert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let message = `Request failed with status ${response.status}`;
                try {
                    const data = await response.json();
                    if (data && (data.message || data.error)) {
                        message = data.message || data.error;
                    }
                } catch (_) {
                    // ignore JSON parse errors and use the default message
                }
                throw new Error(message);
            }

            resetForm();
            // setShowForm(false);
            setFeedback("Record Saved!");

            setTimeout(() => {
                setFeedback("");
            }, 1000);
        } catch (err) {
            setSubmitError(
                (err && err.message) || "Failed to save the expense."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div id="expenseInput">
            <div className="eiHeader">
                <div>
                    <div className="eiTitle">Add an Expense</div>
                    <div className="eiSubtitle">
                        Record a new entry to keep the dashboard up to date.
                    </div>
                </div>
                <button
                    type="button"
                    className="eiToggle"
                    onClick={() => {
                        setShowForm((open) => !open);
                        setValidationError("");
                        setSubmitError("");
                    }}
                    aria-expanded={showForm}
                >
                    {showForm ? "Close" : "+ New Expense"}
                </button>
            </div>

            {showForm && (
                <form className="eiForm" onSubmit={handleSubmit} noValidate>
                    <div className="eiGrid">
                        <div className="eiField">
                            <label htmlFor="eiDate">Date</label>
                            <input
                                id="eiDate"
                                type="date"
                                value={form.date}
                                onChange={handleChange("date")}
                                required
                            />
                        </div>

                        <div className="eiField eiFieldWide">
                            <label htmlFor="eiDescription">Description</label>
                            <input
                                id="eiDescription"
                                type="text"
                                value={form.description}
                                onChange={handleChange("description")}
                                placeholder="What was the expense for?"
                                required
                            />
                        </div>

                        <div className="eiField eiFieldWide">
                            <label htmlFor="eiCategory">Category</label>
                            <input
                                id="eiCategory"
                                type="text"
                                list="eiCategoryList"
                                value={form.category}
                                onChange={handleChange("category")}
                                placeholder="e.g. Food, Transport, Office"
                                required
                            />
                            <datalist id="eiCategoryList">
                                {categoryOptions.map((cat) => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                            <div className="eiCategoryChips">
                                {categoryOptions.slice(0, 6).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={
                                            "eiChip" +
                                            (form.category === cat ? " eiChipActive" : "")
                                        }
                                        onClick={() => handleCategorySelect(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="eiField">
                            <label htmlFor="eiQty">Quantity</label>
                            <input
                                id="eiQty"
                                type="number"
                                min="0"
                                step="1"
                                value={form.qty}
                                onChange={handleChange("qty")}
                                placeholder="1"
                                required
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="eiUnitPrice">Unit Price (K)</label>
                            <input
                                id="eiUnitPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.unitPrice}
                                onChange={handleChange("unitPrice")}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="eiTotal">Total (K)</label>
                            <input
                                id="eiTotal"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.total}
                                onChange={handleChange("total")}
                                placeholder="Auto-calculated"
                                required
                            />
                            <span className="eiHint">Qty x Unit Price</span>
                        </div>
                    </div>

                    {validationError && (
                        <div className="eiAlert eiAlertError">{validationError}</div>
                    )}
                    {submitError && (
                        <div className="eiAlert eiAlertError">{submitError}</div>
                    )}

                    <div className="eiActions">
                        <button
                            type="button"
                            className="eiBtn eiBtnGhost"
                            onClick={() => {
                                resetForm();
                                setShowForm(false);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="eiBtn eiBtnPrimary"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save Expense"}
                        </button>
                    </div>
                        {feedback !== "" ? <p style={{ color: "green" }}>{feedback}</p> : null}
                </form>
            )}

            {status && (
                <div className="eiStatus">Loading existing expenses...</div>
            )}
        </div>
    );
};

export default ExpenseInput;
