import { useState } from "react";
import { useDispatch } from "react-redux";
import { authedPost } from "../auth/authedRequest";
import { fetchTrips } from "../expenseSlice";
import "./expenseInput.css";

const DEFAULT_FORM = {
    date: "",
    taker: "",
    roadLocation: "",
    nips_qty: "",
    bigs_papers_qty: "",
    bigs_cls_qty: "",
};

const TripInput = () => {
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

        const date = form.date;
        const taker = form.taker.trim();
        const roadLocation = form.roadLocation.trim();
        const nipsQty = Number(form.nips_qty);
        const bigsPapersQty = Number(form.bigs_papers_qty);
        const bigsClsQty = Number(form.bigs_cls_qty);

        if (!date) return setError("Date is required");
        if (!taker) return setError("Taker is required");
        if (!roadLocation) return setError("Road location is required");
        if (!Number.isFinite(nipsQty) || nipsQty < 0)
            return setError("Nips qty must be a non-negative number");
        if (!Number.isFinite(bigsPapersQty) || bigsPapersQty < 0)
            return setError("Bigs papers qty must be a non-negative number");
        if (!Number.isFinite(bigsClsQty) || bigsClsQty < 0)
            return setError("Bigs cls qty must be a non-negative number");

        const payload = {
            Date: date,
            Taker: taker,
            RoadLocation: roadLocation,
            NipsQty: nipsQty,
            BigsPapersQty: bigsPapersQty,
            BigsClsQty: bigsClsQty,
        };

        setSubmitting(true);

        try {
            const result = await authedPost(
                `${process.env.REACT_APP_BACKEND_URI}/trip/insert`,
                payload
            );
            if (!result.ok) {
                throw new Error(result.error || "Failed to save trip entry");
            }

            resetForm();
            setFeedback("Trip entry saved!");
            dispatch(fetchTrips());

            setTimeout(() => {
                setFeedback("");
            }, 1000);
        } catch (err) {
            setError(err.message || "Failed to save trip entry");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="entryFormCard">
            <div className="eiHeader">
                <div>
                    <div className="eiTitle">Add Trip Entry</div>
                    <div className="eiSubtitle">Record trip details.</div>
                </div>
                <button className="eiToggle" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close" : "+ New Trip"}
                </button>
            </div>

            {showForm && (
                <form className="eiForm" onSubmit={handleSubmit}>
                    <div className="eiGrid">
                        <div className="eiField">
                            <label htmlFor="tripDate">Date</label>
                            <input
                                id="tripDate"
                                type="date"
                                value={form.date}
                                onChange={handleChange("date")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="tripTaker">Taker</label>
                            <input
                                id="tripTaker"
                                type="text"
                                value={form.taker}
                                onChange={handleChange("taker")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="tripRoadLocation">Road Location</label>
                            <input
                                id="tripRoadLocation"
                                type="text"
                                value={form.roadLocation}
                                onChange={handleChange("roadLocation")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="tripNipsQty">Nips Qty</label>
                            <input
                                id="tripNipsQty"
                                type="number"
                                min="0"
                                value={form.nips_qty}
                                onChange={handleChange("nips_qty")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="tripBigsPapersQty">Bigs Papers Qty</label>
                            <input
                                id="tripBigsPapersQty"
                                type="number"
                                min="0"
                                value={form.bigs_papers_qty}
                                onChange={handleChange("bigs_papers_qty")}
                            />
                        </div>

                        <div className="eiField">
                            <label htmlFor="tripBigsClsQty">Bigs Cls Qty</label>
                            <input
                                id="tripBigsClsQty"
                                type="number"
                                min="0"
                                value={form.bigs_cls_qty}
                                onChange={handleChange("bigs_cls_qty")}
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

export default TripInput;
