import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import SearchBar from "./components/SearchBar";
import FlightResults from "./components/FlightResults";
import FavoriteFlights from "./components/FavoriteFlights";

import "./App.css";

/** Stable key so favorites don’t duplicate even if objects are reshaped */
function flightKey(f) {
  const aIata = f?.airline?.iata || "";
  const aName = f?.airline?.name || f?.airline?.airline_name || "";
  const num   = f?.flight?.number || f?.flight?.iata || "";
  const dep   = f?.departure?.iata || f?.departure?.airport || "";
  const arr   = f?.arrival?.iata || f?.arrival?.airport || "";
  return `${aIata || aName}#${num}#${dep}->${arr}`;
}

export default function App() {
  /** results for the Flights page */
  const [results, setResults] = useState([]);

  /** favorites (persist to localStorage) */
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedFlights") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("savedFlights", JSON.stringify(saved));
  }, [saved]);

  const savedKeys = useMemo(
    () => new Set(saved.map((f) => flightKey(f))),
    [saved]
  );

  const toggleSave = (flight) => {
    const key = flightKey(flight);
    setSaved((prev) => {
      if (prev.some((f) => flightKey(f) === key)) {
        return prev.filter((f) => flightKey(f) !== key);
      }
      return [...prev, flight];
    });
  };

  /** Pages */
  const FlightsPage = () => (
    <div className="page">
      <h1 className="title">Flights</h1>

      <SearchBar
        onResults={(list /* filtered */, meta /* {raw, requestedUrl, error} */) => {
          setResults(Array.isArray(list) ? list : []);
        }}
      />

      <div className="section-card">
        <h2 className="section-title">Results</h2>
        <FlightResults
          flights={results}
          isSaved={(f) => savedKeys.has(flightKey(f))}
          onToggleSave={toggleSave}
        />
      </div>
    </div>
  );

  const SavedPage = () => (
    <div className="page">
      <h1 className="title">Saved Flights</h1>
      <div className="section-card">
        <FavoriteFlights saved={saved} onToggleSave={toggleSave} />
      </div>
    </div>
  );

  const AboutPage = () => (
    <div className="page">
      <h1 className="title">About</h1>
      <div className="section-card">
        <p>
          This app searches real flights using your backend at{" "}
          <code>{process.env.REACT_APP_API || "http://localhost:5000"}</code>, which proxies
          the Aviationstack API and enforces a monthly quota with caching.
        </p>
        <p>
          Use the search above by Airline, Flight number, and optional route (From / To IATA).
          Click the heart to save a flight and find it later on the “Saved” page.
        </p>
      </div>
    </div>
  );

  return (
    <Router>
      {/* Top nav */}
      <div className="topnav">
        <div className="brand">✈︎ Flight Tracker</div>
        <nav className="navlinks">
          <NavLink end to="/" className="nav-link">Flights</NavLink>
          <NavLink to="/saved" className="nav-link">Saved</NavLink>
          <NavLink to="/about" className="nav-link">About</NavLink>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<FlightsPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}
