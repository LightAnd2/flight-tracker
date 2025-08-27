import React from "react";

const statusClass = (s = "") => {
  const x = s.toLowerCase();
  if (x.includes("landed") || x.includes("on time") || x.includes("scheduled")) return "badge badge-green";
  if (x.includes("departed")) return "badge badge-blue";
  if (x.includes("delayed")) return "badge badge-yellow";
  return "badge";
};

/**
 * saved: array of saved flight objects
 * onToggleSave: (flight) => void
 */
export default function FavoriteFlights({ saved = [], onToggleSave }) {
  if (!saved.length) {
    return (
      <div className="empty-state">
        <div className="empty-emoji">💾</div>
        <div className="empty-title">No saved flights yet</div>
        <div className="empty-sub">Tap the heart on any flight to save it.</div>
      </div>
    );
  }

  return (
    <ul className="flight-list">
      {saved.map((f, idx) => {
        const num = f?.flight?.iata || f?.flight?.number || "—";
        const dep = f?.departure?.iata || f?.departure?.icao || f?.departure?.airport || "—";
        const arr = f?.arrival?.iata || f?.arrival?.icao || f?.arrival?.airport || "—";
        const status = f?.flight_status || "—";

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
                title="Remove from saved"
                aria-label="Remove from saved"
              >
                ❤️
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
