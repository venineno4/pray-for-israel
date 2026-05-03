"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/utils/countries";

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: string) => void;
}

export default function CountryModal({ isOpen, onClose, onSelect }: CountryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary-deepBlue">Where are you praying from?</h3>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-shadow text-gray-800"
                autoFocus
              />
            </div>
            
            <div className="max-h-[400px] overflow-y-auto p-2">
              {searchTerm.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic text-sm">
                  Type your country name above...
                </div>
              ) : filteredCountries.length > 0 ? (
                <ul className="space-y-1">
                  {filteredCountries.map(country => (
                    <li key={country.name}>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          onSelect(country.name);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No countries found matching "{searchTerm}"
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
