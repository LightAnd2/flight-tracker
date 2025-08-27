// server/index.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// ------------------ App setup ------------------
const app = express();                 // <<<<<< THIS must exist before app.get(...)
app.use(cors());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;

// Aviationstack base endpoints
const API_FLIGHTS   = "http://api.aviationstack.com/v1/flights";
const API_AIRPORTS  = "http://api.aviationstack.com/v1/airports";
const API_AIRLINES  = "http://api.aviationstack.com/v1/airlines";

// ------------------ Monthly quota (persisted) ------------------
const USAGE_FILE = path.join(__dirname, "usage.json");
const MONTH_ID = new Date().toISOString().slice(0, 7); // e.g. "2025-08"
const MONTHLY_LIMIT = 100;                    // free plan
const SAFE_BUFFER   = 5;                      // keep a buffer
const EFFECTIVE_LIMIT = MONTHLY_LIMIT - SAFE_BUFFER; // 95

function loadUsage() {
  try {
    const raw = fs.readFileSync(USAGE_FILE, "utf8");
    const obj = JSON.parse(raw);
    if (obj.month !== MONTH_ID) return { month: MONTH_ID, count: 0 };
    return obj;
  } catch {
    return { month: MONTH_ID, count: 0 };
  }
}

function saveUsage(u) {
  try { fs.writeFileSync(USAGE_FILE, JSON.stringify(u, null, 2)); }
  catch (e) { console.error("Failed saving usage.json:", e.message); }
}

let usage = loadUsage();

// ------------------ In-memory cache ------------------
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) { cache.delete(key); return null; }
  return hit.payload;
}
function setCache(key, payload) {
  cache.set(key, { payload, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ------------------ Helper ------------------
function makeParams(baseAllowed, query) {
  const p = new URLSearchParams();
  p.set("access_key", API_KEY);
  for (const k of baseAllowed) {
    const v = query[k];
    if (v !== undefined && String(v).trim() !== "") p.set(k, String(v).trim());
  }
  return p;
}

function enforceMonthlyLimit() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (usage.month !== currentMonth) { usage = { month: currentMonth, count: 0 }; saveUsage(usage); }
  if (usage.count >= EFFECTIVE_LIMIT) {
    const err = new Error("Monthly API call limit reached (free plan).");
    err.status = 429;
    throw err;
  }
}

// ------------------ /flights ------------------
app.get("/flights", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Missing API_KEY in server/.env" });

    const key = req.originalUrl;
    const cached = getCache(key);
    if (cached) return res.json({ cached: true, quota: { month: usage.month, count: usage.count, limit: EFFECTIVE_LIMIT }, data: cached });

    enforceMonthlyLimit();

    const allow = ["airline_name", "airline_iata", "flight_number", "dep_iata", "arr_iata", "limit"];
    const params = makeParams(allow, req.query);
    if (!params.get("limit")) params.set("limit", "10");

    const url = `${API_FLIGHTS}?${params.toString()}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    usage.count += 1; saveUsage(usage);
    setCache(key, data);

    res.json({ cached: false, quota: { month: usage.month, count: usage.count, limit: EFFECTIVE_LIMIT }, data });
  } catch (e) {
    const status = e.status || e.response?.status || 500;
    const msg = e.response?.data || e.message || "Unknown error";
    console.error("Flights error:", msg);
    res.status(status).json({ error: "Failed to fetch flights" });
  }
});

// ------------------ /airports (for autocomplete) ------------------
app.get("/airports", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Missing API_KEY in server/.env" });

    const key = req.originalUrl;
    const cached = getCache(key);
    if (cached) return res.json({ cached: true, data: cached });

    enforceMonthlyLimit();

    // aviationstack supports name/iata/icao filtering via 'search'
    const params = new URLSearchParams();
    params.set("access_key", API_KEY);
    const q = (req.query.search || "").trim();
    if (q) params.set("search", q);
    params.set("limit", req.query.limit || "10");

    const url = `${API_AIRPORTS}?${params.toString()}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    usage.count += 1; saveUsage(usage);
    setCache(key, data);

    res.json({ cached: false, data });
  } catch (e) {
    const status = e.status || e.response?.status || 500;
    const msg = e.response?.data || e.message || "Unknown error";
    console.error("Airports error:", msg);
    res.status(status).json({ error: "Failed to fetch airports" });
  }
});

// ------------------ /airlines (for autocomplete) ------------------
app.get("/airlines", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Missing API_KEY in server/.env" });

    const key = req.originalUrl;
    const cached = getCache(key);
    if (cached) return res.json({ cached: true, data: cached });

    enforceMonthlyLimit();

    const params = new URLSearchParams();
    params.set("access_key", API_KEY);
    const q = (req.query.search || "").trim();
    if (q) params.set("search", q);
    params.set("limit", req.query.limit || "10");

    const url = `${API_AIRLINES}?${params.toString()}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    usage.count += 1; saveUsage(usage);
    setCache(key, data);

    res.json({ cached: false, data });
  } catch (e) {
    const status = e.status || e.response?.status || 500;
    const msg = e.response?.data || e.message || "Unknown error";
    console.error("Airlines error:", msg);
    res.status(status).json({ error: "Failed to fetch airlines" });
  }
});

// ------------------ Boot ------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Month ${usage.month}: used ${usage.count}/${EFFECTIVE_LIMIT} calls`);
});