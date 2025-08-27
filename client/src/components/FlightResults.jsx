import React from "react";

const statusClass = (s = "") => {
  const x = s.toLowerCase();
  if (x.includes("landed") || x.includes("on time") || x.includes("scheduled")) return "badge badge-green";
  if (x.includes("departed")) return "badge badge-blue";
  if (x.includes("delayed")) return "badge badge-yellow";
  return "badge";
};

/**
 * flights: array of aviationstack flight objects
 * isSaved: (flight) => boolean
 * onToggleSave: (flight) => void
 */
export default function FlightResults({ flights = [], isSaved, onToggleSave }) {
  if (!flights.length) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">🛫</div>
        <div className="empty-title">No flights found</div>
        <div className="empty-sub">Try a different airline, flight number, or route.</div>
      </div>
    );
  }

  return (
    <ul className="flight-list">
      {flights.map((f, idx) => {
        const num = f?.flight?.iata || f?.flight?.number || "—";
        const dep = f?.departure?.iata || f?.departure?.icao || f?.departure?.airport || "—";
        const arr = f?.arrival?.iata || f?.arrival?.icao || f?.arrival?.airport || "—";
        const status = f?.flight_status || "—";
        const saved = isSaved ? isSaved(f) : false;

        return (
          <li key={`${num}-${dep}-${arr}-${idx}`} className="flight-item">
            <div className="flight-meta">
              <div className="flight-number">{num}</div>
              <div className="route">{dep} → {arr}</div>
              <div className="subtext">
                {f?.airline?.name || f?.airline?.airline_name || f?.airline?.iata || "Unknown Airline"}
              </div>
            </div>

            <div className="flight-actions">
              <span className={statusClass(status)}>{status}</span>
              <button
                className="heart-btn"
                onClick={() => onToggleSave?.(f)}
                title={saved ? "Unsave" : "Save"}
                aria-label={saved ? "Unsave flight" : "Save flight"}
              >
                {saved ? "❤️" : "🤍"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
