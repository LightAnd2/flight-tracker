import React, { useEffect, useMemo, useState } from "react";

const API = process.env.REACT_APP_API || "http://localhost:5000";

/**
 * This SearchBar ONLY hits your /flights route on the backend.
 * It builds the query with airline_name, flight_number, dep_iata, arr_iata.
 * When results arrive, it calls props.onResults(list, meta).
 */
export default function SearchBar({ onResults }) {
  const [airline, setAirline] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [fromIata, setFromIata] = useState("");
  const [toIata, setToIata] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [lastUrl, setLastUrl] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (airline.trim())  p.set("airline_name", airline.trim());
    if (flightNo.trim()) p.set("flight_number", flightNo.trim());
    if (fromIata.trim()) p.set("dep_iata", fromIata.trim().toUpperCase());
    if (toIata.trim())   p.set("arr_iata", toIata.trim().toUpperCase());
    p.set("limit", "12");
    return p.toString();
  }, [airline, flightNo, fromIata, toIata]);

  const endpoint = `${API}/flights?${qs}`;

  const handleSearch = async () => {
    setErr("");
    setLoading(true);
    setLastUrl(endpoint);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();

      if (!res.ok) {
        setErr(json?.error || "Failed to fetch flights");
        onResults?.([], { error: json?.error || "request-failed", status: res.status, requestedUrl: endpoint });
        setLoading(false);
        return;
      }

      // Your server returns: { cached, quota, data }
      // Where `data` is the raw aviationstack response: { data: [...], pagination: ... }
      const list = Array.isArray(json?.data?.data)
        ? json.data.data
        : Array.isArray(json?.data)
        ? json.data
        : [];

      onResults?.(list, { raw: json, requestedUrl: endpoint });
    } catch (e) {
      setErr(e.message || "Network error");
      onResults?.([], { error: e.message || "network", requestedUrl: endpoint });
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setAirline("");
    setFlightNo("");
    setFromIata("");
    setToIata("");
    setErr("");
    onResults?.([], { cleared: true });
  };

  // OPTIONAL: run a first fetch if you want (commented)
  // useEffect(() => { handleSearch(); /* eslint-disable-next-line */ }, []);

  return (
    <section className="section-card">
      <h2 className="section-title">Search by Flight</h2>

      <div className="form-row" style={{ flexWrap: "wrap", gap: 12 }}>
        <input
          className="input"
          placeholder="Airline (e.g., United, Delta)"
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          style={{ minWidth: 240, flex: "1 1 260px" }}
        />
        <input
          className="input"
          placeholder="Flight # (e.g., 521)"
          value={flightNo}
          onChange={(e) => setFlightNo(e.target.value)}
          style={{ minWidth: 140, maxWidth: 220, flex: "1 1 160px" }}
        />
        <input
          className="input"
          placeholder="From IATA (e.g., BNE)"
          value={fromIata}
          onChange={(e) => setFromIata(e.target.value)}
          style={{ minWidth: 140, maxWidth: 220, flex: "1 1 160px", textTransform: "uppercase" }}
        />
        <input
          className="input"
          placeholder="To IATA (e.g., SYD)"
          value={toIata}
          onChange={(e) => setToIata(e.target.value)}
          style={{ minWidth: 140, maxWidth: 220, flex: "1 1 160px", textTransform: "uppercase" }}
        />

        <button className="primary-btn" onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
        <button className="secondary-btn" onClick={clearAll} disabled={loading}>Clear</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
        <div>Endpoint: <code>{endpoint}</code></div>
        {lastUrl && <div>Last: <code>{lastUrl}</code></div>}
      </div>

      {err && (
        <div className="banner error" style={{ marginTop: 12 }}>
          {err}
        </div>
      )}
    </section>
  );
}
