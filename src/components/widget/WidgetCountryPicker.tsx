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
 *
 * Single-step, exactly like the main site's CountryModal: choosing a country
 * (click on a result / the suggested country, or Enter on an unambiguous
 * match) immediately submits the prayer — there is no confirm button.
 */
export default function WidgetCountryPicker({ isOpen, onClose, onSubmit }: WidgetCountryPickerProps) {
  const [term, setTerm] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [navigated, setNavigated] = useState(false);
  const [detected, setDetected] = useState<CountryData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const submittedRef = useRef(false);

  // Reset + focus each time the picker opens
  useEffect(() => {
    if (!isOpen) return;
    setTerm("");
    setHighlight(0);
    setNavigated(false);
    submittedRef.current = false;
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
    setNavigated(false);
  };

  /** Choosing a country == submitting the prayer (guarded against double fire). */
  const submit = (c: CountryData) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(c.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setNavigated(true);
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setNavigated(true);
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Only submit on an unambiguous choice: exact name, single result,
      // or a row the user explicitly picked with the arrow keys.
      const q = term.trim().toLowerCase();
      const exact = q ? results.find((c) => c.name.toLowerCase() === q) : undefined;
      const choice =
        exact ||
        (results.length === 1 ? results[0] : undefined) ||
        (navigated ? results[highlight] : undefined);
      if (choice) submit(choice);
    }
  };

  const showList = results.length > 0;

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
              <input
                ref={inputRef}
                type="text"
                className="pfw-picker-input"
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
                        onClick={() => submit(c)}
                      >
                        <span className="pfw-picker-option-flag">{c.flag}</span>
                        <span className="pfw-picker-option-name">{c.name}</span>
                        {!term.trim() && <span className="pfw-picker-option-hint">detected</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : term.trim() ? (
                <p className="pfw-picker-empty">No countries found</p>
              ) : (
                <p className="pfw-picker-empty">Start typing your country…</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
