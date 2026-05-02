"use client";

import { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface LiveMapProps {
  activeCountries: string[];
}

const LiveMap = ({ activeCountries }: LiveMapProps) => {
  const isCountryActive = (geoName: string) => {
    if (activeCountries.includes(geoName)) return true;
    if (geoName === "United States of America" && activeCountries.includes("United States")) return true;
    if (geoName === "South Korea" && activeCountries.includes("South Korea")) return true; 
    if (geoName === "United Kingdom" && activeCountries.includes("United Kingdom")) return true;
    return false;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <style>{`
        @keyframes activeCountryPulse {
          0%, 100% {
            fill: #FFE066 !important;
            filter: drop-shadow(0 0 6px rgba(255, 224, 102, 0.8));
          }
          50% {
            fill: #FFFFFF !important;
            filter: drop-shadow(0 0 15px rgba(255, 255, 255, 1));
          }
        }
        .country-active {
          animation: activeCountryPulse 3s ease-in-out infinite !important;
          outline: none !important;
          stroke: #FFE066 !important;
          stroke-width: 0.8px !important;
        }
        .country-inactive {
          fill: #1e3a5f !important;
          transition: fill 250ms ease-in-out !important;
          outline: none !important;
        }
        .country-inactive:hover {
          fill: #2a4d7d !important;
        }
      `}</style>
      <ComposableMap
        projectionConfig={{ scale: 180, center: [0, 5] }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geoName = geo.properties.name;
              const isMatch = isCountryActive(geoName);
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className={isMatch ? "country-active" : "country-inactive"}
                  stroke="#0B2B5A"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default memo(LiveMap);
