import React from "react";

export default function Insights({ insights, topItems }) {
  return (
    <div className="insights-grid">
      <section className="panel">
        <h3>Automatic insights</h3>
        <ul className="insight-list">
          {insights.length === 0 ? (
            <li className="muted">Add more data to unlock insights.</li>
          ) : (
            insights.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="panel">
        <h3>Top items by spend</h3>
        {topItems.length === 0 ? (
          <p className="muted">No items to show.</p>
        ) : (
          <ol className="top-list">
            {topItems.map((item) => (
              <li key={item.description}>
                <div>
                  <strong>{item.description}</strong>
                  <span className="muted"> · {item.count}× · {item.category}</span>
                </div>
                <span className="amount">K{item.total.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
