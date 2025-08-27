// src/App.js
import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import "./index.css";

const API_BASE = process.env.REACT_APP_API || "http://localhost:5000";

// ---------- Helpers ----------
function toQuery(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") p.set(k, String(v).trim());
  });
  return p.toString();
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// ---------- Layout ----------
function Shell({ children }) {
  return (
    <>
      <header className="topbar">
        <div className="brand">✈️ Flight Tracker</div>
        <nav className="nav">
          <NavLink to="/" end className="nav-link">Flights</NavLink>
          <NavLink to="/saved" className="nav-link">Saved</NavLink>
          <NavLink to="/about" className="nav-link">About</NavLink>
        </nav>
      </header>
      <main className="page">{children}</main>
    </>
  );
}

// ---------- Flights Page ----------
function FlightsPage({ saved, toggleSave }) {
  const [airlineName, setAirlineName] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [depIata, setDepIata] = useState("");
  const [arrIata, setArrIata] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]); // aviationstack data array
  const [quota, setQuota] = useState(null); // {month,count,limit}

  // Build request URL shown under the form (for transparency)
  const requestUrl = useMemo(() => {
    const q = toQuery({
      airline_name: airlineName || undefined,
      flight_number: flightNumber || undefined,
      dep_iata: depIata || undefined,
      arr_iata: arrIata || undefined,
      limit: 12, // keep results short = quota friendly
    });
    return `${API_BASE}/flights?${q}`;
  }, [airlineName, flightNumber, depIata, arrIata]);

  async function search() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(requestUrl);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      const j = await res.json();
      setQuota(j.quota || null);
      const rows = Array.isArray(j?.data?.data) ? j.data.data : [];
      setData(rows);
    } catch (e) {
      setError(e.message || "Failed to search flights");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setAirlineName("");
    setFlightNumber("");
    setDepIata("");
    setArrIata("");
    setData([]);
    setError("");
  }

  return (
    <Shell>
      <h1 className="title">Flights</h1>

      <section className="card">
        <h2 className="card-title">Search by Flight</h2>
        <div className="form-row">
          <input
            className="input"
            placeholder="Airline (e.g., UA, United)"
            value={airlineName}
            onChange={(e) => setAirlineName(e.target.value)}
          />
          <input
            className="input"
            placeholder="Flight number (e.g., 123)"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
          />
          <input
            className="input"
            placeholder="From IATA (optional, e.g., JFK)"
            value={depIata}
            onChange={(e) => setDepIata(e.target.value.toUpperCase())}
          />
          <input
            className="input"
            placeholder="To IATA (optional, e.g., LAX)"
            value={arrIata}
            onChange={(e) => setArrIata(e.target.value.toUpperCase())}
          />
        </div>
        <div className="actions">
          <button className="btn primary" onClick={search} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
          <button className="btn" onClick={clearForm} disabled={loading}>Clear</button>
        </div>

        <div className="meta-row">
          <div className="muted small">Source: <code>{requestUrl}</code></div>
          {quota && (
            <div className="badge">Month usage: {quota.count}/{quota.limit}</div>
          )}
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <ul className="flight-list">
        {data.map((f, idx) => {
          const fid = `${f.airline?.iata || ""}${f.flight?.iata || f.flight?.number || idx}`;
          const isSaved = saved.some((x) => x._id === fid);

          const dep = f.departure || {};
          const arr = f.arrival || {};
          const status = f.flight_status || "Unknown";

          return (
            <li key={fid} className="flight-item">
              <div>
                <div className="flight-code">
                  {f.airline?.iata || f.airline?.icao || "??"}
                  {f.flight?.iata || f.flight?.number ? " " : ""}
                  {f.flight?.iata || f.flight?.number || ""}
                </div>
                <div className="route">
                  {(dep.iata || dep.airport || "—")} → {(arr.iata || arr.airport || "—")}
                </div>
              </div>
              <div className="right">
                <span
                  className={
                    "status " +
                    (status === "scheduled" || status === "active" || status === "landed"
                      ? "ok"
                      : status === "cancelled"
                      ? "bad"
                      : "warn")
                  }
                >
                  {status === "scheduled"
                    ? "Scheduled"
                    : status === "active"
                    ? "In Air"
                    : status === "landed"
                    ? "Landed"
                    : status === "cancelled"
                    ? "Cancelled"
                    : status || "Unknown"}
                </span>
                <button
                  className={"heart " + (isSaved ? "on" : "")}
                  title={isSaved ? "Remove from saved" : "Save flight"}
                  onClick={() =>
                    toggleSave({
                      _id: fid,
                      airline: f.airline?.name || f.airline?.iata || f.airline?.icao || "Airline",
                      number: f.flight?.iata || f.flight?.number || "",
                      from: dep.iata || dep.airport || "",
                      to: arr.iata || arr.airport || "",
                      status: status || "",
                    })
                  }
                >
                  {isSaved ? "❤️" : "🤍"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {!loading && data.length === 0 && !error && (
        <div className="empty">
          <div className="emoji">🛫</div>
          <div className="primary">No flights yet</div>
          <div className="muted">Enter a filter and press Search.</div>
        </div>
      )}
    </Shell>
  );
}

// ---------- Saved Page ----------
function SavedPage({ saved, toggleSave }) {
  return (
    <Shell>
      <h1 className="title">Saved Flights</h1>
      {saved.length === 0 ? (
        <div className="empty">
          <div className="emoji">💾</div>
          <div className="primary">No saved flights yet</div>
          <div className="muted">Tap the heart on any result to save it here.</div>
        </div>
      ) : (
        <ul className="flight-list">
          {saved.map((f) => (
            <li key={f._id} className="flight-item">
              <div>
                <div className="flight-code">
                  {f.number}
                </div>
                <div className="route">
                  {f.from || "—"} → {f.to || "—"}
                </div>
              </div>
              <div className="right">
                <span className={"status " + (f.status === "cancelled" ? "bad" : "ok")}>
                  {f.status || "Saved"}
                </span>
                <button className="heart on" onClick={() => toggleSave(f)}>❤️</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

// ---------- About ----------
function AboutPage() {
  return (
    <Shell>
      <h1 className="title">About</h1>
      <div className="card">
        <p>
          This app shows live flight data via your Express proxy (Aviationstack).
          Searches are quota-friendly (no calls until you click <b>Search</b>).
          Results are cached on the server to save your free-plan 100 calls/month.
        </p>
      </div>
    </Shell>
  );
}

// ---------- App Root ----------
export default function App() {
  const [saved, setSaved] = useLocalStorage("savedFlights", []);

  function toggleSave(flight) {
    setSaved((prev) => {
      const exists = prev.some((x) => x._id === flight._id);
      return exists ? prev.filter((x) => x._id !== flight._id) : [...prev, flight];
    });
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<FlightsPage saved={saved} toggleSave={toggleSave} />} />
        <Route path="/saved" element={<SavedPage saved={saved} toggleSave={toggleSave} />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}
