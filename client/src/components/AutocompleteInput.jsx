import React, { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;
const localCache = new Map();

export default function AutocompleteInput({
  placeholder,
  value,
  onChange,
  onSelect,
  fetchUrl,       // `${process.env.REACT_APP_API}/airports?search=` or `/airlines?search=`
  mapItemLabel,   // how to display each suggestion
  mapItemValue,   // what to put into the input when selected
  max = 6,
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([]);
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setItems([]);
      return;
    }
    const key = `${fetchUrl}${encodeURIComponent(value.trim())}&limit=${max}`;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (localCache.has(key)) {
        setItems(localCache.get(key));
        setOpen(true);
        return;
      }
      try {
        setBusy(true);
        const r = await fetch(key);
        const j = await r.json();
        const arr = Array.isArray(j?.data) ? j.data : [];
        localCache.set(key, arr);
        setItems(arr);
        setOpen(true);
      } catch (e) {
        console.error("autocomplete fetch failed", e);
      } finally {
        setBusy(false);
      }
    }, DEBOUNCE_MS);
  }, [value, fetchUrl, max]);

  return (
    <div className="auto-wrap" ref={boxRef}>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (items.length) setOpen(true); }}
        autoComplete="off"
      />
      {open && items.length > 0 && (
        <ul className="auto-list glass">
          {items.map((it, idx) => (
            <li
              key={idx}
              className="auto-item"
              onMouseDown={() => {
                setOpen(false);
                onSelect(mapItemValue(it), it);
              }}
            >
              <div className="auto-main">{mapItemLabel(it)}</div>
            </li>
          ))}
        </ul>
      )}
      {open && !items.length && !busy && (
        <div className="auto-empty glass">No matches</div>
      )}
      {busy && <div className="auto-busy">Searching…</div>}
    </div>
  );
}
