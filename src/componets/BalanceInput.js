import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { authedPost } from "../auth/authedRequest";
import "./BalanceInput.css";

const BalanceInput = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [qty, setQty] = useState("");
  const [debtor, setDebtor] = useState("");
  const [witness, setWitness] = useState("");
  const [location, setLocation] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");
    setSubmitError("");

    if (!date) {
      setSubmitError("Date is required.");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      setSubmitError("Amount must be a non-negative number.");
      return;
    }
    const qtyNum = parseInt(qty, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setSubmitError("Quantity must be a non-negative integer.");
      return;
    }
    if (!debtor.trim()) {
      setSubmitError("Debtor is required.");
      return;
    }
    if (!witness.trim()) {
      setSubmitError("Witness is required.");
      return;
    }
    if (!location.trim()) {
      setSubmitError("Location is required.");
      return;
    }
    const paidAmountNum = parseFloat(paidAmount);
    if (isNaN(paidAmountNum) || paidAmountNum < 0) {
      setSubmitError("Paid amount must be a non-negative number.");
      return;
    }

    const payload = {
      Date: date,
      Amount: amountNum,
      Qty: qtyNum,
      Debtor: debtor.trim(),
      Witness: witness.trim(),
      Location: location.trim(),
      PaidAmount: paidAmountNum,
    };

    setSubmitting(true);
    try {
      const result = await authedPost(
        `${process.env.REACT_APP_BACKEND_URI}/balance/insert`,
        payload
      );

      if (!result.ok) {
        throw new Error(result.error || "Failed to save balance entry.");
      }

      setFeedback("Balance entry saved!");
      setDate("");
      setAmount("");
      setQty("");
      setDebtor("");
      setWitness("");
      setLocation("");
      setPaidAmount("");

    } catch (err) {
      setSubmitError((err && err.message) || "Failed to save balance entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <form onSubmit={handleSubmit} noValidate className="balance-input-container">
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Qty:</label>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Debtor:</label>
          <input
            type="text"
            value={debtor}
            onChange={(e) => setDebtor(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Witness:</label>
          <input
            type="text"
            value={witness}
            onChange={(e) => setWitness(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Paid Amount:</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            required
          />
        </div>

        {submitError && <div className="eiAlert eiAlertError">{submitError}</div>}
        {feedback && <div className="eiAlert eiAlertSuccess">{feedback}</div>}

        <div className="eiActions">
          <button
            type="button"
            className="eiBtn eiBtnGhost"
            onClick={() => {
              setDate("");
              setAmount("");
              setQty("");
              setDebtor("");
              setWitness("");
              setLocation("");
              setPaidAmount("");
              setFeedback("");
              setSubmitError("");
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="eiBtn eiBtnPrimary"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Submit Balance"}
          </button>
        </div>
      </form>
  );
};

export default BalanceInput;
