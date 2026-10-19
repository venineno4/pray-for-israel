"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES, type CountryData } from "@/utils/countries";
import { fetchVisitorCountryCode } from "./useWidgetPrayerSession";

interface WidgetCountryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (country: string) => void;
}

const MAX_RESULTS = 30;

function search(term: string): CountryData[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const starts: CountryData[] = [];
  const contains: CountryData[] = [];
  for (const c of COUNTRIES) {
    const name = c.name.toLowerCase();
    if (name.startsWith(q)) starts.push(c);
    else if (name.includes(q)) contains.push(c);
  }
  return [...starts, ...contains].slice(0, MAX_RESULTS);
}

/**
 * Compact in-widget country picker (fits a 300×250 frame).
 * Covers the whole widget, never renders outside of it.
 */
export default function WidgetCountryPicker({ isOpen, onClose, onSubmit }: WidgetCountryPickerProps) {
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<CountryData | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [detected, setDetected] = useState<CountryData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Reset + focus each time the picker opens
  useEffect(() => {
    if (!isOpen) return;
    setTerm("");
    setSelected(null);
    setHighlight(0);
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 60);

    // Suggest the visitor's detected country (same /api/geo the main site uses)
    let cancelled = false;
    fetchVisitorCountryCode().then((code) => {
      if (cancelled || !code) return;
      const match = COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
      if (match) setDetected(match);
    });

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (term.trim()) return search(term);
    return detected ? [detected] : [];
  }, [term, detected]);

  // Keep highlighted row visible. (Manual scrollTop instead of scrollIntoView,
  // which could also scroll the host page that embeds this iframe.)
  useEffect(() => {
    const list = listRef.current;
    const el = list?.children[highlight] as HTMLElement | undefined;
    if (!list || !el) return;
    if (el.offsetTop < list.scrollTop) {
      list.scrollTop = el.offsetTop;
    } else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
    }
  }, [highlight]);

  const handleType = (value: string) => {
    setTerm(value);
    setHighlight(0);
    const exact = COUNTRIES.find((c) => c.name.toLowerCase() === value.trim().toLowerCase());
    setSelected(exact || null);
  };

  const choose = (c: CountryData) => {
    setSelected(c);
    setTerm(c.name);
    setHighlight(0);
  };

  const submit = () => {
    if (selected) onSubmit(selected.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const showList = results.length > 0 && !(selected && term === selected.name);
    if (e.key === "ArrowDown" && showList) {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp" && showList) {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selected && term === selected.name) submit();
      else if (results[highlight]) choose(results[highlight]);
    }
  };

  const showList = results.length > 0 && !(selected && term === selected.name);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pfw-picker-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pfw-picker-title"
            className="pfw-picker"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pfw-picker-head">
              <h2 id="pfw-picker-title" className="pfw-picker-title">
                Where are you praying from?
              </h2>
              <button type="button" className="pfw-picker-close" onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pfw-picker-field">
              {selected && term === selected.name && (
                <span className="pfw-picker-field-flag" aria-hidden="true">
                  {selected.flag}
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                className={`pfw-picker-input ${selected && term === selected.name ? "has-flag" : ""}`}
                placeholder="Enter country name..."
                value={term}
                onChange={(e) => handleType(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                role="combobox"
                aria-expanded={showList}
                aria-controls="pfw-picker-list"
                aria-autocomplete="list"
              />
            </div>

            <div className="pfw-picker-results">
              {showList ? (
                <ul id="pfw-picker-list" ref={listRef} role="listbox" className="pfw-picker-list">
                  {results.map((c, i) => (
                    <li key={c.code + c.name} role="option" aria-selected={i === highlight}>
                      <button
                        type="button"
                        className={`pfw-picker-option ${i === highlight ? "is-active" : ""}`}
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => choose(c)}
                      >
                        <span className="pfw-picker-option-flag">{c.flag}</span>
                        <span className="pfw-picker-option-name">{c.name}</span>
                        {!term.trim() && <span className="pfw-picker-option-hint">detected</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : term.trim() && !selected ? (
                <p className="pfw-picker-empty">No countries found</p>
              ) : !selected ? (
                <p className="pfw-picker-empty">Start typing your country…</p>
              ) : null}
            </div>

            <button type="button" className="pfw-picker-submit" disabled={!selected} onClick={submit}>
              Light up my country!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
