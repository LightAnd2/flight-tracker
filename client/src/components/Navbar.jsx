import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="topnav" style={{ justifyContent: "center", gap: 24 }}>
      <NavLink end to="/" className="nav-link">Flights</NavLink>
      <NavLink to="/saved" className="nav-link">Saved</NavLink>
      <NavLink to="/about" className="nav-link">About</NavLink>
    </div>
  );
}
