import React from "react";
import Dashboard from "./components/Dashboard";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

function App() {
  return (
    <div className="app-shell" id="dashboard">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">Dz</span>
          <div className="brand-text">
            <strong>Dzalino</strong>
            <span>Expense intelligence</span>
          </div>
        </div>
        <nav className="app-nav">
          <a href="#dashboard">Dashboard</a>
          <a href="#analytics">Analytics</a>
          <a href="#ledger">Ledger</a>
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>
      <Dashboard />
      <footer className="app-footer" id="about">
        <span>Source: <code>/assets/DzalinoData.xlsx</code></span>
        <span>Built with React + Redux · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default App;
